import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import { z } from 'zod';

const schema = z.object({ bathroomId: z.uuid(), reportType: z.enum(['wrong_floor','incorrect_access','duplicate','outage','other']), message: z.string().trim().min(5).max(280), cleanliness: z.number().int().min(1).max(5).nullable(), privacy: z.number().int().min(1).max(5).nullable(), upkeep: z.number().int().min(1).max(5).nullable(), turnstileToken: z.string().min(1).max(2048) });
export async function POST(request: NextRequest) {
  const { TURNSTILE_SECRET_KEY: secret, UPSTASH_REDIS_REST_URL: redisUrl, UPSTASH_REDIS_REST_TOKEN: redisToken, SUPABASE_SERVICE_ROLE_KEY: serviceKey, NEXT_PUBLIC_SUPABASE_URL: dbUrl } = process.env;
  if (!secret || !redisUrl || !redisToken || !serviceKey || !dbUrl || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return NextResponse.json({ error: 'Community reports unavailable' },{status:503});
  if (Number(request.headers.get('content-length') ?? 0) > 4096) return NextResponse.json({error:'Request too large'},{status:413});
  let raw: unknown; try { const text = await request.text(); if (text.length > 4096) return NextResponse.json({error:'Request too large'},{status:413}); raw = JSON.parse(text); } catch { return NextResponse.json({error:'Invalid JSON'},{status:400}); }
  const parsed = schema.safeParse(raw); if (!parsed.success) return NextResponse.json({error:'Invalid report'},{status:400}); const x = parsed.data;
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'; const bucket = Math.floor(Date.now()/3600000); const key = `feedback:${createHash('sha256').update(`${ip}:${secret}:${bucket}`).digest('hex')}`; const redis = new Redis({url:redisUrl,token:redisToken}); const count = await redis.incr(key); if (count === 1) await redis.expire(key, 7200); if (count > 5) return NextResponse.json({error:'Rate limit reached'},{status:429});
    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret,response:x.turnstileToken,remoteip:ip})}); const verification = await verify.json() as {success?: boolean}; if (!verification.success) return NextResponse.json({error:'Bot check failed'},{status:403});
    const db = createClient(dbUrl,serviceKey,{auth:{persistSession:false}}); const {data:b,error:lookupError} = await db.from('bathrooms').select('id').eq('id',x.bathroomId).eq('is_active',true).eq('is_published',true).single(); if (lookupError || !b) return NextResponse.json({error:'Restroom not found'},{status:404});
    const {error:reportError} = await db.from('feedback_reports').insert({bathroom_id:x.bathroomId,report_type:x.reportType,message:x.message,status:'pending'}); if (reportError) throw reportError;
    if (x.cleanliness !== null || x.privacy !== null || x.upkeep !== null) { const {error} = await db.from('observations').insert({bathroom_id:x.bathroomId,source_kind:'community',cleanliness:x.cleanliness,privacy:x.privacy,upkeep:x.upkeep,status:'pending'}); if (error) throw error; }
    return NextResponse.json({status:'pending'},{status:202});
  } catch { return NextResponse.json({error:'Report service unavailable'},{status:503}); }
}
