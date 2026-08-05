import { describe, expect, it } from 'vitest';
import { formatPublicDate, getPublishedEntries, readingTime, relatedEntries } from '../src/lib/content';

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

  it('formats date-only publication dates on their UTC calendar day', () => {
    const publicationDate = new Date('2026-07-24T00:00:00.000Z');

    expect(formatPublicDate(publicationDate)).toBe('24 de julio de 2026');
  });

  it('ranks matching categories before a single shared tag', () => {
    const current = {
      id: 'current',
      data: {
        category: 'ai-coding',
        tags: ['context-engineering', 'metodologia'],
        draft: false
      }
    };
    const sharedCategory = {
      id: 'shared-category',
      data: { category: 'ai-coding', tags: [], draft: false }
    };
    const sharedTag = {
      id: 'shared-tag',
      data: { category: 'automation', tags: ['metodologia'], draft: false }
    };
    const unrelated = {
      id: 'unrelated',
      data: { category: 'product-building', tags: [], draft: false }
    };

    const ranked = relatedEntries(current, [sharedCategory, sharedTag, unrelated]);

    expect(ranked.map((entry) => entry.id)).toEqual(['shared-category', 'shared-tag']);
  });

  it('removes the current entry and drafts while preserving score ties', () => {
    const current = {
      id: 'current',
      data: { category: 'automation', tags: ['revision'], draft: false }
    };
    const candidates = [
      current,
      { id: 'first', data: { category: 'automation', tags: [], draft: false } },
      { id: 'draft', data: { category: 'automation', tags: ['revision'], draft: true } },
      { id: 'second', data: { category: 'automation', tags: [], draft: false } }
    ];

    expect(relatedEntries(current, candidates).map((entry) => entry.id)).toEqual(['first', 'second']);
  });
});
