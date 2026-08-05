import { describe, expect, it } from 'vitest';
import { assertPublicContent } from '../src/config/content-policy';
import { assertPublicContent as cliPolicy } from '../src/config/public-content-policy.mjs';

describe('public content policy', () => {
  it('accepts a safe public article', () => {
    expect(assertPublicContent('Automatización con scripts reutilizables.', 'safe.md')).toEqual([]);
  });

  it('allows Spanish words that contain the letters of a blocked abbreviation', () => {
    const source = 'Convertir conocimiento en acción permite reconocer patrones.';

    expect(assertPublicContent(source, 'spanish.md')).toEqual([]);
  });

  it('allows generic business financial management', () => {
    const source = 'Finanzas empresariales: gestión financiera para PYMEs.';

    expect(assertPublicContent(source, 'business.md')).toEqual([]);
  });

  it('allows years and business metrics without sensitive financial labels', () => {
    const source = 'En 2026, la meta anual del negocio es $125,000 y 10,000 clientes potenciales.';

    expect(assertPublicContent(source, 'metrics.md')).toEqual([]);
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
    const source = 'Infrastructure, server, incident, credential, credentials, centro de datos, password, internal IP, contenido sensible y archivos.';

    expect(assertPublicContent(source, 'bilingual.md')).toEqual([
      'bilingual.md: contiene término bloqueado "centro de datos"',
      'bilingual.md: contiene término bloqueado "infrastructure"',
      'bilingual.md: contiene término bloqueado "server"',
      'bilingual.md: contiene término bloqueado "incident"',
      'bilingual.md: contiene término bloqueado "credential"',
      'bilingual.md: contiene término bloqueado "credentials"',
      'bilingual.md: contiene término bloqueado "password"',
      'bilingual.md: contiene término bloqueado "internal ip"',
      'bilingual.md: contiene término bloqueado "sensible"',
      'bilingual.md: contiene término bloqueado "archivos"'
    ]);
  });

  it('rejects private financial data and sensitive records', () => {
    const source = 'Datos financieros personales, private financial data, credencial y registros financieros sensibles.';

    expect(assertPublicContent(source, 'private-finance.md')).toEqual([
      'private-finance.md: contiene término bloqueado "credencial"',
      'private-finance.md: contiene término bloqueado "datos financieros personales"',
      'private-finance.md: contiene término bloqueado "private financial data"',
      'private-finance.md: contiene término bloqueado "registros financieros sensibles"'
    ]);
  });

  it('rejects personal finance topics in Spanish and English', () => {
    const source = 'Finanzas personales y personal finances.';

    expect(assertPublicContent(source, 'personal-finance.md')).toEqual([
      'personal-finance.md: contiene término bloqueado "finanzas personales"',
      'personal-finance.md: contiene término bloqueado "personal finances"'
    ]);
  });

  it('rejects labelled bank balances with synthetic values', () => {
    const source = 'Saldo bancario: $125,000. Bank balance: USD 42,500.75.';

    expect(assertPublicContent(source, 'balances.md')).toEqual([
      'balances.md: contiene dato financiero bloqueado "saldo bancario"',
      'balances.md: contiene dato financiero bloqueado "bank balance"'
    ]);
  });

  it('rejects a labelled CLABE with a synthetic value', () => {
    const source = 'CLABE: 123456789012345678';

    expect(assertPublicContent(source, 'clabe.md')).toEqual([
      'clabe.md: contiene dato financiero bloqueado "clabe"'
    ]);
  });

  it('rejects labelled account numbers with synthetic values', () => {
    const source = 'Número de cuenta: 1234567890. Account number: 1234567890.';

    expect(assertPublicContent(source, 'accounts.md')).toEqual([
      'accounts.md: contiene dato financiero bloqueado "número de cuenta"',
      'accounts.md: contiene dato financiero bloqueado "account number"'
    ]);
  });

  it('uses the same policy function as the CLI validator', () => {
    expect(assertPublicContent).toBe(cliPolicy);
  });
});
