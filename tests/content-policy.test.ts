import { describe, expect, it } from 'vitest';
import { assertPublicContent } from '../src/config/content-policy';

describe('public content policy', () => {
  it('accepts a safe public article', () => {
    expect(assertPublicContent('Automatización con scripts reutilizables.', 'safe.md')).toEqual([]);
  });

  it('rejects blocked work and sensitive terms case-insensitively', () => {
    const source = 'Lecciones de NOC y Data Center con la IP 10.0.0.5';

    expect(assertPublicContent(source, 'unsafe.md')).toEqual([
      'unsafe.md: contiene término bloqueado "noc"',
      'unsafe.md: contiene término bloqueado "data center"',
      'unsafe.md: contiene una dirección IP'
    ]);
  });
});
