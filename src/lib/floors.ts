import type { Bathroom } from './types';
import { floorPlanUrls } from './floorPlanUrls';

export type FloorRow = {
  label: string;
  key: string;
  count: number | null;
  minimum: boolean;
  detail: string | null;
  breakdown: { men: number; women: number; allGender: number; unspecified: number } | null;
  planUrl: string | null;
};

type HallFloors = { labels: string[]; count: number | null; minimum?: boolean };
const range = (first: number, last: number) => Array.from({ length: last - first + 1 }, (_, index) => `${first + index}${ordinal(first + index)} floor`);
function ordinal(n: number) { return n % 100 >= 11 && n % 100 <= 13 ? 'th' : n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th'; }
function floorNumber(label: string) { return label.toLowerCase().includes('mezzanine') ? 0 : Number.parseInt(label, 10) || Number.MAX_SAFE_INTEGER; }

// Floor labels follow the plans linked from each Columbia Housing hall page.
// A minimum is used only when Housing says bathrooms are on every listed floor.
const hallFloors: Record<string, HallFloors> = {
  'Schapiro Hall': { labels: range(2, 16), count: 1, minimum: true },
  'Broadway Hall': { labels: range(3, 13), count: 2, minimum: true },
  'Furnald Hall': { labels: range(2, 10), count: 2, minimum: true },
  'John Jay Hall': { labels: range(5, 15), count: 1, minimum: true },
  'Wallach Hall': { labels: range(2, 10), count: 1, minimum: true },
  'McBain Hall': { labels: range(1, 8), count: 2, minimum: true },
  'River Hall': { labels: range(1, 6), count: 2, minimum: true },
  'Harmony Hall': { labels: ['Mezzanine', ...range(1, 8)], count: null },
  'Wien Hall': { labels: range(2, 12), count: 1, minimum: true },
  '538 W. 114th Street': { labels: range(1, 4), count: 1, minimum: true },
  '619 W. 113th Street': { labels: range(1, 5), count: 1, minimum: true },
  '611 W. 112th Street': { labels: range(1, 6), count: 7 },
  '600 W. 113th Street': { labels: [...range(2, 5), ...range(9, 10)], count: null },
};

export function floorsForHall(bathrooms: Bathroom[]): FloorRow[] {
  if (!bathrooms.length) return [];
  const hall = bathrooms[0].building.name;
  const summary = hallFloors[hall];
  if (!summary) return Array.from(new Set(bathrooms.map(b => b.floor_label))).sort((a, b) => floorNumber(a) - floorNumber(b)).map(label => ({ label, key: `${bathrooms[0].building_id}:${label}`, count: bathrooms.filter(b => b.floor_label === label).length, minimum: true, detail: null, breakdown: null, planUrl: null }));
  return [...summary.labels].sort((a, b) => floorNumber(a) - floorNumber(b)).map(label => {
    const listed = bathrooms.filter(b => b.floor_label.toLowerCase() === label.toLowerCase() || b.floor_label.toLowerCase() === label.replace(/^\d+(st|nd|rd|th) floor$/, match => `Floor ${match.match(/^\d+/)?.[0]}`).toLowerCase());
    let count = summary.count;
    let minimum = Boolean(summary.minimum);
    const n = Number.parseInt(label);
    let breakdown: FloorRow['breakdown'] = null;
    if (hall === 'Furnald Hall') breakdown = { men: 1, women: 1, allGender: 0, unspecified: 0 };
    if (hall === 'Broadway Hall') breakdown = n === 6 ? { men: 0, women: 2, allGender: 4, unspecified: 0 } : { men: 1, women: 1, allGender: 4, unspecified: 0 };
    if (hall === 'Schapiro Hall') breakdown = n <= 9 ? { men: 1, women: 2, allGender: 1, unspecified: 0 } : { men: 1, women: 1, allGender: 0, unspecified: 0 };
    if (hall === 'Wien Hall') breakdown = n === 2 ? { men: 0, women: 0, allGender: 0, unspecified: 2 } : { men: 1, women: 1, allGender: n === 12 || n <= 9 ? 1 : 0, unspecified: 0 };
    if (hall === 'River Hall') breakdown = { men: 0, women: 0, allGender: 0, unspecified: 4 };
    if (hall === '611 W. 112th Street') breakdown = { men: 0, women: 0, allGender: 0, unspecified: 7 };
    if (breakdown) { count = breakdown.men + breakdown.women + breakdown.allGender + breakdown.unspecified; minimum = false; }
    if (listed.length > (count ?? 0)) { count = listed.length; minimum = true; }
    const detail = listed.length ? listed.map(b => b.restroom_type === 'all_gender' ? 'All-gender' : b.restroom_type === 'mens' ? 'Men’s' : b.restroom_type === 'womens' ? 'Women’s' : 'Floor plan listing').join(' · ') : null;
    const planUrl = floorPlanUrls[hall]?.[label] ?? null;
    return { label, key: `${bathrooms[0].building_id}:${label}`, count, minimum, detail, breakdown, planUrl };
  });
}
