'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { accessLabel, cleanlinessFor, effectiveAccess, visibleBathrooms } from '@/lib/rankings';
import { directionsToBuilding } from '@/lib/location';
import { floorsForHall, type FloorRow } from '@/lib/floors';
import { searchBathrooms } from '@/lib/search';
import type { Bathroom, Filters, Sort } from '@/lib/types';

const initialFilters: Filters = { allGender: false, accessible: false, private: false, idAllowed: false, verifiedOnly: false };
const filterLabels: { key: keyof Filters; label: string }[] = [
  { key: 'accessible', label: 'Accessible · verified' },
  { key: 'private', label: 'Single-use' }, { key: 'idAllowed', label: 'ID allowed' },
  { key: 'verifiedOnly', label: 'Field verified' }
];

type Gender = 'all' | 'men' | 'women' | 'allGender';

function FloorItem({ floor, hall, gender, favorite, onFavorite }: { floor: FloorRow; hall: string; gender: Gender; favorite: boolean; onFavorite: () => void }) {
  const [open, setOpen] = useState(false);
  const countLabel = gender !== 'all' && floor.breakdown
    ? `${floor.breakdown[gender]} ${gender === 'allGender' ? 'all-gender' : gender === 'men' ? 'men’s' : 'women’s'} ${floor.breakdown[gender] === 1 ? 'bathroom' : 'bathrooms'} · ${floor.count} total`
    : floor.count === null ? '? count unconfirmed' : `${floor.count}${floor.minimum ? '+' : ''} ${floor.count === 1 && !floor.minimum ? 'bathroom' : 'bathrooms'}`;
  return <li className={`floor-row${open ? ' is-open' : ''}`}>
    <button type="button" className="floor-summary" aria-expanded={open} aria-label={`${hall} ${floor.label}, ${countLabel}. ${open ? 'Hide' : 'Show'} details`} onClick={() => setOpen(value => !value)}>
      <strong>{floor.label}</strong><span>{countLabel}</span><span className="floor-chevron" aria-hidden="true">⌄</span>
    </button>
    <button type="button" className="favorite-button" aria-label={`${favorite ? 'Remove favorite' : 'Favorite'} ${hall} ${floor.label}`} aria-pressed={favorite} onClick={onFavorite}>{favorite ? '★' : '☆'}</button>
    <div className="floor-details">
      <p>{floor.breakdown
        ? floor.breakdown.unspecified > 0 && floor.breakdown.men + floor.breakdown.women + floor.breakdown.allGender === 0
          ? 'Single-use · gender designation not shown'
          : `Men ${floor.breakdown.men} · Women ${floor.breakdown.women} · All-gender ${floor.breakdown.allGender}`
        : floor.detail ?? 'Bathroom details not confirmed on the floor plan.'}</p>
      {floor.planUrl && <a className="floor-plan-link" href={floor.planUrl} target="_blank" rel="noopener noreferrer" aria-label={`${hall} ${floor.label} floor plan`}>View floor map ↗</a>}
    </div>
  </li>;
}

export function Discover({ bathrooms, catalog }: { bathrooms: Bathroom[]; catalog: boolean }) {
  const [nearId, setNearId] = useState('');
  const [query, setQuery] = useState('');
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsMessage, setGpsMessage] = useState('');
  const [locationPending, setLocationPending] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState<Sort>('closest');
  const [gender, setGender] = useState<Gender>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [openHall, setOpenHall] = useState<string | null>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const scrollToResults = useRef(false);
  const buildings = useMemo(() => Array.from(new Map(bathrooms.map(b => [b.building.id, b.building])).values()).sort((a, b) => a.name.localeCompare(b.name)), [bathrooms]);
  const nearBuilding = buildings.find(b => b.id === nearId);
  const start = useMemo(() => gps ?? (nearBuilding?.entrance_lat != null && nearBuilding.entrance_lng != null ? { lat: nearBuilding.entrance_lat, lng: nearBuilding.entrance_lng } : null), [gps, nearBuilding]);
  const ranked = useMemo(() => visibleBathrooms(bathrooms, filters, sort, start), [bathrooms, filters, sort, start]);
  const results = useMemo(() => searchBathrooms(ranked, query), [ranked, query]);
  const filterCount = Object.values(filters).filter(Boolean).length;
  const hasCleanliness = bathrooms.some(b => cleanlinessFor(b.observations).count > 0);
  const shownGroups = Array.from(new Map(results.map(b => [b.building.id, b.building])).values()).map(building => {
    const items = results.filter(b => b.building_id === building.id);
    let floors = floorsForHall(items);
    if (gender !== 'all') floors = floors.filter(f => (f.breakdown?.[gender] ?? 0) > 0);
    if (favoritesOnly) floors = floors.filter(f => favorites.includes(f.key));
    return { building, items, floors };
  }).filter(group => group.floors.length);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(localStorage.getItem('stallion:favorite-floors:v1') ?? '[]');
        if (Array.isArray(saved)) setFavorites(saved.filter((item): item is string => typeof item === 'string'));
      } catch { /* Ignore unavailable or malformed local storage. */ }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function toggleFavorite(key: string) {
    const next = favorites.includes(key) ? favorites.filter(item => item !== key) : [...favorites, key];
    setFavorites(next);
    try { localStorage.setItem('stallion:favorite-floors:v1', JSON.stringify(next)); } catch { /* Favorites still work for this visit. */ }
  }

  useEffect(() => {
    if (!scrollToResults.current) return;
    scrollToResults.current = false;
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [results]);

  function jumpToResults() {
    scrollToResults.current = true;
  }

  function useLocation() {
    if (locationPending) return;
    setLocationPending(true);
    setGpsMessage('Locating…');
    if (!navigator.geolocation) { setLocationPending(false); setGpsMessage('Location is unavailable in this browser. Choose a starting hall below.'); return; }
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setLocationPending(false);
      if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude) || Math.abs(coords.latitude) > 90 || Math.abs(coords.longitude) > 180) {
        setGpsMessage('Location was invalid. Choose a starting hall below.'); return;
      }
      setGps({ lat: coords.latitude, lng: coords.longitude }); setNearId(''); setQuery(''); setSort('closest');
      setGpsMessage('Location found. Nearby suggestions use hall areas; Google Maps calculates the walking route.'); jumpToResults();
    }, (error) => { setLocationPending(false); setGpsMessage(error.code === 1 ? 'Location permission is off. Enable it in your browser or choose a hall.' : error.code === 3 ? 'Location timed out. Try again or choose a hall.' : 'Could not find your location. Choose a hall below.'); }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 60_000 });
  }

  return <div className="discovery-page">
    <div className="discovery-utility"><div className="utility-right"><Link href="/about">About</Link><Link href="/admin">Inspector</Link></div></div>

    <header className="discovery-heading"><h1>Stallion <span aria-hidden="true">🦁</span><a className="poop-gif-link" href="https://klipy.com/gifs/poop-dancing-poop-3" target="_blank" rel="noopener noreferrer" aria-label="Dancing poop GIF on Klipy">💩</a></h1><p>Find a bathroom, fast.</p></header>

    <section className="discover-tools" aria-label="Find a bathroom">
      <div className="quick-find"><button type="button" className="location-action" onClick={useLocation} disabled={locationPending}>{locationPending ? 'Finding your location…' : '◎ Find bathrooms near me'}</button><label>or start near <select aria-label="Starting building" value={nearId} onChange={e => { setNearId(e.target.value); setGps(null); setGpsMessage(''); setQuery(''); setSort('closest'); jumpToResults(); }}><option value="">Choose a hall</option>{buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label></div>
      {hasCleanliness ? <div className="quick-sort" aria-label="Ranking"><span>Show me</span><button type="button" aria-pressed={sort === 'closest'} onClick={() => setSort('closest')}>Nearby halls</button><button type="button" aria-pressed={sort === 'cleanest'} onClick={() => setSort('cleanest')}>Cleanest reported</button></div> : <p className="cleanliness-note">Cleanliness ratings aren’t available yet. Browse hall listings below.</p>}
      <div className="search-line"><label htmlFor="building-search" className="visually-hidden">Search halls</label><input id="building-search" type="search" placeholder="Search a hall…" value={query} onChange={e => setQuery(e.target.value)} autoComplete="off"/><button type="button" className="favorites-filter" aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly(value => !value)}>★ Favorites{favorites.length ? ` (${favorites.length})` : ''}</button><button type="button" className="plain-button" onClick={() => setShowFilters(v => !v)} aria-expanded={showFilters} aria-controls="advanced-filters">Filters{filterCount ? ` (${filterCount})` : ''}</button></div>
      {gpsMessage && <p className="tool-note" role="status">{gpsMessage}</p>}
      {nearId && !start && <p className="tool-note">A map position for {nearBuilding?.name} is unavailable, so distance sorting is unavailable.</p>}
      <div id="advanced-filters" className="advanced-filters" hidden={!showFilters}><div className="tool-line"><label>Sort <select aria-label="Sort restrooms" value={sort} onChange={e => setSort(e.target.value as Sort)}><option value="closest">Nearby hall areas</option><option value="cleanest" disabled={!hasCleanliness}>Cleanest reported</option><option value="score">Highest overall score</option><option value="recent">Recently checked</option></select></label></div><div className="filter-list">{filterLabels.map(({ key, label }) => <button key={key} type="button" className="filter-chip" aria-pressed={filters[key]} onClick={() => setFilters({ ...filters, [key]: !filters[key] })}>{label}</button>)}</div><label className="more-toggle"><input type="checkbox" checked={expanded} onChange={e => setExpanded(e.target.checked)}/> Show more details</label><button type="button" className="plain-button" onClick={() => setFilters(initialFilters)}>Clear filters</button><p className="tool-note">Accessibility appears only after an inspector verifies the restroom itself.</p></div>
    </section>

    <div className="gender-strip" role="group" aria-label="Bathroom designation"><span>Show</span>{([['all', 'All'], ['men', 'Men'], ['women', 'Women'], ['allGender', 'All-gender']] as const).map(([value, label]) => <button type="button" key={value} aria-pressed={gender === value} onClick={() => setGender(value)}>{label}</button>)}</div>

    <section ref={resultsRef} className="discover-results" aria-label="Restroom results"><div className="results-status"><strong>{shownGroups.length} {shownGroups.length === 1 ? 'hall' : 'halls'} · floors shown below</strong><span>{favoritesOnly ? 'your saved floors' : query ? `matching “${query.trim()}”` : sort === 'cleanest' ? 'highest reported cleanliness first' : start ? 'nearby hall areas · walking route in Google Maps' : 'all published floor information'}</span></div>
      <p className="floor-key">Hover or tap a hall for access and source details; hover or tap a floor for its breakdown and map. Floors run lowest to highest. + means a minimum; ? means unconfirmed.</p>
      {shownGroups.length ? <div className={`hall-grid ${shownGroups.length === 1 ? 'single-hall' : ''}`}>
        {shownGroups.map(({ building, items, floors }) => <section className={`hall-column${openHall === building.id ? ' is-open' : ''}`} key={building.id} aria-labelledby={`hall-${building.id}`}>
          <div className="hall-top"><h2 id={`hall-${building.id}`}><button type="button" className="hall-summary" aria-expanded={openHall === building.id} aria-controls={`hall-info-${building.id}`} onClick={() => setOpenHall(value => value === building.id ? null : building.id)}>{building.name}<span aria-hidden="true">⌄</span></button></h2><a className="entry-directions" href={directionsToBuilding(building, gps)} target="_blank" rel="noopener noreferrer" aria-label={`Directions to ${building.name}`}>Walking route ↗</a></div>
          <p className="hall-floor-count">{floors.length} {floors.length === 1 ? 'floor' : 'floors'} shown</p>
          <div id={`hall-info-${building.id}`} className="hall-details"><p className="hall-access">{accessLabel(effectiveAccess(items[0]))}</p>{building.entrance_notes && <p className="hall-entrance">{building.entrance_notes}</p>}<p className="hall-source">{items.some(b => b.source_url) ? 'Some floor plan bathrooms listed; other counts use hall descriptions.' : 'Floor information from Columbia Housing; individual bathrooms unverified.'} {items[0].source_page_url && <a href={items[0].source_page_url} target="_blank" rel="noopener noreferrer">Housing source ↗</a>}</p></div>
          <ul className="floor-list">{floors.map(floor => <FloorItem key={floor.key} floor={floor} hall={building.name} gender={gender} favorite={favorites.includes(floor.key)} onFavorite={() => toggleFavorite(floor.key)}/>)}</ul>
          {expanded && items.map(b => <p className="hall-extra" key={b.id}>{b.floor_label}: {b.location_hint} <Link href={`/bathrooms/${b.id}`}>Details ↗</Link></p>)}
        </section>)}
      </div> : <div className="empty-state"><h2>{favoritesOnly ? 'No saved floors here yet' : 'No matching halls'}</h2><p>{favoritesOnly ? 'Tap a star beside a floor to save it.' : 'Try another search or clear a filter.'}</p></div>}
    </section>
    <p className="discovery-endnote">{catalog ? `${buildings.length} Columbia Housing halls · listings are not field verified.` : 'Published listings may change.'} Nearby order uses approximate hall areas. Google Maps handles walking directions. <Link href="/about">How Stallion works ↗</Link></p>
  </div>;
}
