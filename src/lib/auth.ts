import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { configured } from './db';

export async function authDb() {
  if (!configured) return null;
  const jar = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => jar.getAll(), setAll: (values: { name: string; value: string; options?: Parameters<typeof jar.set>[2] }[]) => { try { values.forEach(({ name, value, options }) => jar.set(name, value, options)); } catch { /* Server components cannot write cookies. */ } } } });
}
export async function requireRole(role: 'inspector' | 'owner' = 'inspector') {
  const db = await authDb(); if (!db) redirect('/admin/login');
  const { data: { user } } = await db.auth.getUser(); if (!user) redirect('/admin/login');
  const { data, error } = await db.from('admin_users').select('role').eq('user_id', user.id).single();
  if (error || !data || (role === 'owner' && data.role !== 'owner')) redirect('/admin/forbidden');
  return { db, user, role: data.role as 'owner' | 'inspector' };
}
