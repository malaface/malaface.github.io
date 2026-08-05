import { describe, expect, it } from 'vitest';
import { assertPublicContent } from '../src/config/content-policy';

const contentEntries = import.meta.glob<string>('../src/content/**/*.{md,mdx}', {
  eager: true,
  import: 'default',
  query: '?raw'
});

describe('public editorial content', () => {
  it('publishes at least six policy-safe entries with an explicit draft flag', () => {
    const entries = Object.entries(contentEntries);

    expect(entries.length).toBeGreaterThanOrEqual(6);

    for (const [filePath, source] of entries) {
      expect(source, filePath).toMatch(/^---[\s\S]*?\ndraft: false\n---/);
      expect(assertPublicContent(source, filePath)).toEqual([]);
    }
  });
});
