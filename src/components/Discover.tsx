'use client';
import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { RestroomCard } from './RestroomCard';
import { distanceTo, visibleBathrooms } from '@/lib/rankings';
import { searchBathrooms } from '@/lib/search';
import type { Bathroom, Filters, Sort } from '@/lib/types';

const RestroomMap = dynamic(() => import('./RestroomMap'), { ssr: false, loading: () => <div className="map-placeholder" role="status">Loading map…</div> });
const initialFilters: Filters = { allGender: false, accessible: false, private: false, idAllowed: false, verifiedOnly: false };
const filterLabels: { key: keyof Filters; label: string }[] = [
  { key: 'allGender', label: 'All-gender' }, { key: 'accessible', label: 'Accessible · verified' },
  { key: 'private', label: 'Single-use' }, { key: 'idAllowed', label: 'ID allowed' },
  { key: 'verifiedOnly', label: 'Field verified' }
];

function LocalClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 60_000); return () => window.clearInterval(timer); }, []);
  return <div className="utility-clock" aria-label="Local date and time">
    <span suppressHydrationWarning>{new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }).format(now)}</span>
    <span suppressHydrationWarning>{new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(now)}</span>
  </div>;
}

export function Discover({ bathrooms, catalog }: { bathrooms: Bathroom[]; catalog: boolean }) {
  const [hallId, setHallId] = useState('');
  const [nearId, setNearId] = useState('');
  const [query, setQuery] = useState('');
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsMessage, setGpsMessage] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState<Sort>('closest');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const buildings = useMemo(() => Array.from(new Map(bathrooms.map(b => [b.building.id, b.building])).values()).sort((a, b) => a.name.localeCompare(b.name)), [bathrooms]);
  const nearBuilding = buildings.find(b => b.id === nearId);
  const start = gps ?? (nearBuilding?.entrance_lat != null && nearBuilding.entrance_lng != null ? { lat: nearBuilding.entrance_lat, lng: nearBuilding.entrance_lng } : null);
  const ranked = visibleBathrooms(bathrooms, filters, sort, start);
  const results = searchBathrooms(ranked, query, hallId);
  const groups = Array.from(new Map(results.map(b => [b.building.id, b.building])).values()).map(building => ({ building, items: results.filter(b => b.building_id === building.id) }));
  const filterCount = Object.values(filters).filter(Boolean).length;
  const hasDistances = results.some(b => distanceTo(b, start) !== null);

  function useLocation() {
    setGpsMessage('Locating…');
    if (!navigator.geolocation) { setGpsMessage('Location is unavailable in this browser. Use the hall tabs or search.'); return; }
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude) || Math.abs(coords.latitude) > 90 || Math.abs(coords.longitude) > 180) {
        setGpsMessage('Location was invalid. Use the hall tabs or search.'); return;
      }
      setGps({ lat: coords.latitude, lng: coords.longitude }); setNearId('');
      setGpsMessage('Location received in this browser only. Distances appear when verified entrance coordinates are available.');
    }, () => setGpsMessage('Location unavailable or denied. Use the hall tabs or search.'), { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 });
  }

  return <div className="discovery-page">
    <div className="discovery-utility">
      <div className="utility-left">
        <label className="information-switch"><span>More information</span><input type="checkbox" role="switch" checked={expanded} onChange={e => setExpanded(e.target.checked)}/><span className="switch-track" aria-hidden="true"/></label>
        <ul className="source-key" aria-label="Information legend"><li><span className="key-symbol key-official">O</span> Official plan</li><li><span className="key-symbol key-verified">V</span> Field verified</li><li><span className="key-symbol key-unknown">?</span> Unknown</li></ul>
      </div>
      <div className="utility-right"><LocalClock/><Link href="/about">About</Link><Link href="/admin">Inspector</Link></div>
    </div>

    <header className="discovery-heading"><h1>Stallion <span aria-hidden="true">🦁</span></h1><p>Find a bathroom at Columbia.</p></header>
    <nav className="hall-tabs" aria-label="Residence halls"><button type="button" className={hallId === '' ? 'active' : ''} aria-pressed={hallId === ''} onClick={() => { setHallId(''); setQuery(''); }}>All Halls</button>{buildings.map(b => <button key={b.id} type="button" className={hallId === b.id ? 'active' : ''} aria-pressed={hallId === b.id} onClick={() => { setHallId(b.id); setQuery(''); }}>{b.name.replace(' Hall', '')}</button>)}</nav>
    <p className="catalog-notice">{catalog ? `Columbia Housing floor plans · ${bathrooms.length} listed candidates · none field verified` : `${bathrooms.length} published restroom records`}. Access and current conditions may change.</p>

    <section className="discover-tools" aria-label="Search and refine restrooms">
      <div className="search-line"><label htmlFor="building-search" className="visually-hidden">Search halls</label><input id="building-search" type="search" placeholder="Search halls…" value={query} onChange={e => { setQuery(e.target.value); setHallId(''); }} autoComplete="off"/><button type="button" className="plain-button" onClick={() => setShowFilters(v => !v)} aria-expanded={showFilters} aria-controls="advanced-filters">Options{filterCount ? ` (${filterCount})` : ''}</button></div>
      {gpsMessage && <p className="tool-note" role="status">{gpsMessage}</p>}
      {nearId && !start && <p className="tool-note">Entrance coordinates for {nearBuilding?.name} are not verified, so distance sorting is unavailable.</p>}
      <div id="advanced-filters" className="advanced-filters" hidden={!showFilters}><div className="tool-line"><label>Near <select aria-label="Starting building" value={nearId} onChange={e => { setNearId(e.target.value); setGps(null); }}><option value="">No starting point</option>{buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label><button type="button" className="plain-button" onClick={useLocation}>Use my location</button><label>Sort <select aria-label="Sort restrooms" value={sort} onChange={e => setSort(e.target.value as Sort)}><option value="closest">Closest</option><option value="score">Highest score</option><option value="recent">Recently checked</option></select></label><div className="view-switch" aria-label="View"><button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>List</button><button type="button" aria-pressed={view === 'map'} onClick={() => startTransition(() => setView('map'))}>Map</button></div></div><div className="filter-list">{filterLabels.map(({ key, label }) => <button key={key} type="button" className="filter-chip" aria-pressed={filters[key]} onClick={() => setFilters({ ...filters, [key]: !filters[key] })}>{label}</button>)}</div><button type="button" className="plain-button" onClick={() => setFilters(initialFilters)}>Clear filters</button><p className="tool-note">Accessibility appears only after an inspector verifies the restroom itself. Unknown values never satisfy that filter.</p></div>
    </section>

    <section className="discover-results" aria-label="Restroom results"><div className="results-status"><strong>{results.length} {results.length === 1 ? 'bathroom candidate' : 'bathroom candidates'}</strong><span>{query ? `matching “${query.trim()}”` : hallId ? `in ${buildings.find(b => b.id === hallId)?.name}` : hasDistances ? 'sorted by approximate distance' : 'across residence halls'}</span></div>{pending && <p role="status">Switching view…</p>}
      {view === 'map' ? <RestroomMap bathrooms={results} selectedId={selectedId} onSelect={setSelectedId} onShowList={() => setView('list')} start={start}/> : groups.length ? <div className={`hall-grid ${groups.length === 1 ? 'single-hall' : ''} ${expanded ? 'expanded-grid' : ''}`}>{groups.map(({ building, items }) => <section className="hall-column" key={building.id} aria-labelledby={`hall-${building.id}`}><h2 id={`hall-${building.id}`}>{building.name}</h2>{items.map(b => <RestroomCard key={b.id} bathroom={b} start={start} expanded={expanded}/>)}</section>)}</div> : <div className="empty-state"><h2>No matching bathrooms</h2><p>Try another hall or clear a filter. The current official candidates are unverified.</p></div>}
    </section>
    <p className="discovery-endnote">Officially listed means shown on a Columbia Housing page or floor plan. Indoor route, access, and restroom accessibility require an in-person check. <Link href="/about">How Stallion works ↗</Link></p>
  </div>;
}
