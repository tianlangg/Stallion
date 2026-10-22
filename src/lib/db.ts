import { createClient } from '@supabase/supabase-js';
import { officialCandidates } from './catalog';
import type { Bathroom, Building, Observation } from './types';

export const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const catalogMode = !configured;
export function publicDb() { if (!configured) return null; return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } }); }

export async function getBathrooms(): Promise<Bathroom[]> {
  if (catalogMode) return officialCandidates;
  const db = publicDb(); if (!db) return [];
  const [bs, buildings, observations] = await Promise.all([
    db.from('bathrooms').select('*').eq('is_active', true).eq('is_published', true),
    db.from('buildings').select('*'),
    db.from('observations').select('id,bathroom_id,source_kind,cleanliness,privacy,upkeep,toilet_paper,soap,queue_level,out_of_order,note,status,observed_at').eq('status', 'published')
  ]);
  if (bs.error || buildings.error || observations.error) throw new Error('Could not load restroom records');
  const byBuilding = new Map((buildings.data as Building[]).map(b => [b.id, b]));
  const byBathroom = new Map<string, Observation[]>();
  for (const o of observations.data as Observation[]) byBathroom.set(o.bathroom_id, [...(byBathroom.get(o.bathroom_id) ?? []), o]);
  return (bs.data as Omit<Bathroom, 'building' | 'observations'>[]).flatMap(b => { const building = byBuilding.get(b.building_id); return building ? [{ ...b, building, observations: byBathroom.get(b.id) ?? [] }] : []; });
}
export async function getBathroom(id: string) { return (await getBathrooms()).find(b => b.id === id || b.slug === id) ?? null; }
