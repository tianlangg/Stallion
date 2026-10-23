import Link from 'next/link';
import { accessLabel, cleanlinessFor, effectiveAccess, lastObserved, scoreFor } from '@/lib/rankings';
import { directionsToBuilding } from '@/lib/location';
import type { Bathroom } from '@/lib/types';

const typeLabel = (type: Bathroom['restroom_type']) => ({
  all_gender: 'All-gender', mens: 'Men’s', womens: 'Women’s', unknown: 'Type unknown'
})[type];

export function RestroomCard({ bathroom: b, start, expanded = false, showBuilding = false, featured = false }: {
  bathroom: Bathroom;
  start: { lat: number; lng: number } | null;
  expanded?: boolean;
  showBuilding?: boolean;
  featured?: boolean;
}) {
  const score = scoreFor(b.observations);
  const cleanliness = cleanlinessFor(b.observations);
  const observed = lastObserved(b);
  const directions = directionsToBuilding(b.building, start);
  return <article className={`restroom-card${featured ? ' featured-restroom' : ''}`} id={`card-${b.id}`}>
    {featured && <p className="entry-featured">Nearby listing</p>}
    {showBuilding && <h3 className="entry-building">{b.building.name}</h3>}
    <h4><Link aria-label={`${b.building.name}, ${b.floor_label} details`} href={`/bathrooms/${b.id}`}>{b.floor_label}</Link></h4>
    <p className="entry-type">{typeLabel(b.restroom_type)}{b.single_occupancy === true ? ' · Single-use' : ''}</p>
    <p className="entry-cleanliness">{cleanliness.value === null ? 'Cleanliness unknown' : `Cleanliness ${cleanliness.value}/5 · ${cleanliness.count} report${cleanliness.count === 1 ? '' : 's'}`}</p>
    <p className="entry-confidence">{b.source_url ? 'Floor plan available' : 'Exact floor not confirmed'}</p>
    <p className="entry-access">{accessLabel(effectiveAccess(b))}</p>
    {b.temporarily_unavailable_reason && <p className="entry-warning">Reported issue, not live verified.</p>}
    <div className="entry-actions"><a className="entry-directions" href={directions} target="_blank" rel="noopener noreferrer" aria-label={`Directions to ${b.building.name}`}>Get directions ↗</a><Link className="entry-detail" href={`/bathrooms/${b.id}`}>More details</Link></div>
    {expanded && <div className="entry-extra">
      <p>{b.verification_status === 'field_verified' ? 'Field verified' : b.verification_status === 'official_unverified' ? 'Official listing · unverified' : 'Community report · unverified'}</p>
      {b.location_hint && <p>{b.location_hint}</p>}
      <p>Accessibility: {b.wheelchair_accessible === null ? 'Unknown' : b.wheelchair_accessible ? 'Field verified' : 'Not wheelchair-accessible'}</p>
      <p>Private: {b.single_occupancy === null ? 'Unknown' : b.single_occupancy ? 'Yes' : 'No'}</p>
      <p>{score.value === null ? 'Not yet rated' : `${score.provisional ? 'Provisional ' : ''}Poop Score ${score.value}/5`} · {score.count} observation{score.count === 1 ? '' : 's'}</p>
      {observed && <p>Last checked {new Date(observed).toLocaleDateString()}</p>}
      {b.source_url && <a href={b.source_url} target="_blank" rel="noopener noreferrer">Floor plan ↗</a>}
    </div>}
  </article>;
}
