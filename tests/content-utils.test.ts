import { describe, expect, it } from 'vitest';
import { getPublishedEntries, readingTime } from '../src/lib/content';

describe('content utilities', () => {
  it('removes drafts and sorts published entries from newest to oldest', () => {
    const entries = [
      { data: { draft: false, publishedAt: new Date('2026-01-10') }, slug: 'older' },
      { data: { draft: true, publishedAt: new Date('2026-06-10') }, slug: 'draft' },
      { data: { draft: false, publishedAt: new Date('2026-05-10') }, slug: 'newer' }
    ];

    expect(getPublishedEntries(entries).map((entry) => entry.slug)).toEqual(['newer', 'older']);
  });

  it('returns at least one minute of reading time for empty content', () => {
    expect(readingTime('')).toBe(1);
  });
});
