import { describe, expect, it } from 'vitest';
import { assertPublicContent } from '../src/config/content-policy';

const contentEntries = import.meta.glob<string>('../src/content/**/*.{md,mdx}', {
  eager: true,
  import: 'default',
  query: '?raw'
});
const editorialPages = import.meta.glob<string>([
  '../src/pages/contacto.astro',
  '../src/pages/now.astro',
  '../src/pages/sobre-mi.astro'
], {
  eager: true,
  import: 'default',
  query: '?raw'
});

describe('public editorial content', () => {
  it('publishes at least six policy-safe entries with an explicit draft flag', () => {
    const entries = Object.entries(contentEntries);

    expect(entries.length).toBeGreaterThanOrEqual(6);

    for (const [filePath, source] of entries) {
      const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];

      expect(frontmatter, filePath).toMatch(/^draft: false$/m);
      expect(assertPublicContent(source, filePath)).toEqual([]);
    }
  });

  it('keeps every editorial Astro page within the public-content policy', () => {
    expect(Object.keys(editorialPages)).toHaveLength(3);

    for (const [filePath, source] of Object.entries(editorialPages)) {
      expect(assertPublicContent(source, filePath)).toEqual([]);
    }
  });
});
