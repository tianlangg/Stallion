import { Discover } from '@/components/Discover';
import { catalogMode, getBathrooms } from '@/lib/db';
export const dynamic = 'force-dynamic';
export default async function Home() { const bathrooms = await getBathrooms(); return <Discover bathrooms={bathrooms} catalog={catalogMode}/>; }
