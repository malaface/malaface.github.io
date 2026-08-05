import { describe, expect, it } from 'vitest';
import { siteConfig } from '../src/config/site';

describe('siteConfig', () => {
  it('uses the canonical GitHub Pages origin and Spanish locale', () => {
    expect(siteConfig.url).toBe('https://malaface.github.io');
    expect(siteConfig.locale).toBe('es-MX');
    expect(siteConfig.name).toBe('Luis Miguel Malacara Jiménez');
  });
});
