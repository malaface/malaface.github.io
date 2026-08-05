import { describe, expect, it } from 'vitest';
import { assertPublicContent } from '../src/config/content-policy';
import { assertPublicContent as cliPolicy } from '../src/config/public-content-policy.mjs';

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

  it('rejects English and Spanish equivalents for sensitive public-content categories', () => {
    const source = 'Infrastructure, server, incident, credential, credentials, financial, centro de datos, password, internal IP, contenido sensible y archivos.';

    expect(assertPublicContent(source, 'bilingual.md')).toEqual([
      'bilingual.md: contiene término bloqueado "centro de datos"',
      'bilingual.md: contiene término bloqueado "infrastructure"',
      'bilingual.md: contiene término bloqueado "server"',
      'bilingual.md: contiene término bloqueado "incident"',
      'bilingual.md: contiene término bloqueado "credential"',
      'bilingual.md: contiene término bloqueado "credentials"',
      'bilingual.md: contiene término bloqueado "password"',
      'bilingual.md: contiene término bloqueado "internal ip"',
      'bilingual.md: contiene término bloqueado "financial"',
      'bilingual.md: contiene término bloqueado "sensible"',
      'bilingual.md: contiene término bloqueado "archivos"'
    ]);
  });

  it('uses the same policy function as the CLI validator', () => {
    expect(assertPublicContent).toBe(cliPolicy);
  });
});
