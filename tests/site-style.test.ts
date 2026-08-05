import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const stylesheetUrl = new URL('../src/styles/global.css', import.meta.url);

describe('site design system', () => {
  it('keeps the accessibility, theme and status design tokens', async () => {
    const stylesheet = await readFile(stylesheetUrl, 'utf8');

    expect(stylesheet).toContain('.skip-link');
    expect(stylesheet).toContain(':focus-visible');
    expect(stylesheet).toContain('[data-theme="light"]');
    expect(stylesheet).toContain('prefers-reduced-motion');
    expect(stylesheet).toContain('#86efac');
  });
});
