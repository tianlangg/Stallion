import Link from 'next/link';
import { accessLabel, distanceTo, effectiveAccess, lastObserved, scoreFor } from '@/lib/rankings';
import type { Bathroom } from '@/lib/types';

const typeLabel = (type: Bathroom['restroom_type']) => ({
  all_gender: 'All-gender', mens: 'Men’s', womens: 'Women’s', unknown: 'Type unknown'
})[type];

export function RestroomCard({ bathroom: b, start, expanded = false, showBuilding = false }: {
  bathroom: Bathroom;
  start: { lat: number; lng: number } | null;
  expanded?: boolean;
  showBuilding?: boolean;
}) {
  const score = scoreFor(b.observations);
  const distance = distanceTo(b, start);
  const observed = lastObserved(b);
  return <article className="restroom-card" id={`card-${b.id}`}>
    {showBuilding && <h3 className="entry-building">{b.building.name}</h3>}
    <h4><Link aria-label={`${b.building.name}, ${b.floor_label} details`} href={`/bathrooms/${b.id}`}>{b.floor_label}</Link></h4>
    <p className="entry-type">{typeLabel(b.restroom_type)}{b.single_occupancy === true ? ' · Single-use' : ''}</p>
    <p className="entry-source">{b.verification_status === 'field_verified' ? 'Field verified' : b.verification_status === 'official_unverified' ? 'Official listing · unverified' : 'Community report · unverified'}</p>
    <p className="entry-access">{accessLabel(effectiveAccess(b))}</p>
    {distance !== null && <p className="entry-distance">~{Math.round(distance)} m straight-line to entrance</p>}
    {b.temporarily_unavailable_reason && <p className="entry-warning">Reported issue, not live verified.</p>}
    {expanded && <div className="entry-extra">
      <p>Accessibility: {b.wheelchair_accessible === null ? 'Unknown' : b.wheelchair_accessible ? 'Field verified' : 'Not wheelchair-accessible'}</p>
      <p>Private: {b.single_occupancy === null ? 'Unknown' : b.single_occupancy ? 'Yes' : 'No'}</p>
      <p>{score.value === null ? 'Not yet rated' : `${score.provisional ? 'Provisional ' : ''}Poop Score ${score.value}/5`} · {score.count} observation{score.count === 1 ? '' : 's'}</p>
      {observed && <p>Last checked {new Date(observed).toLocaleDateString()}</p>}
      {b.location_hint && <p>{b.location_hint}</p>}
      {b.source_url && <a href={b.source_url} target="_blank" rel="noopener noreferrer">Floor plan ↗</a>}
    </div>}
    <Link className="entry-detail" href={`/bathrooms/${b.id}`}>Details ↗</Link>
  </article>;
}
