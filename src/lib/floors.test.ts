import { describe, expect, it } from 'vitest';
import { officialCandidates } from './catalog';
import { floorsForHall } from './floors';

const hall = (name: string) => floorsForHall(officialCandidates.filter(b => b.building.name === name));

describe('published floor summaries', () => {
  it('shows the exact published seven bathrooms on each 611 residential floor', () => {
    expect(hall('611 W. 112th Street')).toHaveLength(6);
    expect(hall('611 W. 112th Street').every(f => f.count === 7 && !f.minimum)).toBe(true);
  });
  it('uses minimums for halls without exact counts', () => {
    expect(hall('McBain Hall')[0]).toMatchObject({ label: '1st floor', count: 2, minimum: true });
    expect(hall('Schapiro Hall')[0]).toMatchObject({ label: '2nd floor', count: 4, minimum: false, breakdown: { men: 1, women: 2, allGender: 1, unspecified: 0 } });
  });
  it('does not fabricate per-floor counts for Harmony or 600 West', () => {
    expect(hall('Harmony Hall').every(f => f.count === null)).toBe(true);
    expect(hall('600 W. 113th Street').every(f => f.count === null)).toBe(true);
  });
  it('matches known floor plan listings on their floor', () => {
    expect(hall('Furnald Hall').find(f => f.label === '3rd floor')?.detail).toBe('Men’s · Women’s');
    expect(hall('Broadway Hall').find(f => f.label === '6th floor')?.breakdown).toMatchObject({ men: 0, women: 2, allGender: 4 });
    expect(hall('River Hall').every(f => f.count === 4 && !f.minimum && f.breakdown?.unspecified === 4)).toBe(true);
  });
});
