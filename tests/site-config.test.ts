import { describe, expect, it } from 'vitest';
import { siteConfig } from '../src/config/site';

describe('siteConfig', () => {
  it('uses the canonical GitHub Pages origin and Spanish locale', () => {
    expect(siteConfig.url).toBe('https://malaface.github.io');
    expect(siteConfig.locale).toBe('es-MX');
    expect(siteConfig.name).toBe('Luis Miguel Malacara Jiménez');
  });

  it('links every primary destination in the approved order', () => {
    expect(siteConfig.navigation).toEqual([
      { href: '/', label: 'Inicio' },
      { href: '/knowledge-hub/', label: 'Conocimiento' },
      { href: '/playbooks/', label: 'Guías' },
      { href: '/blog/', label: 'Blog' },
      { href: '/laboratorio/', label: 'Laboratorio' },
      { href: '/live-projects/', label: 'Proyectos' },
      { href: '/recursos/', label: 'Recursos' },
      { href: '/now/', label: 'Ahora' }
    ]);
  });
});
