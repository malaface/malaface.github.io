import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../src/config/site';

const stylesheetUrl = new URL('../src/styles/global.css', import.meta.url);

function readRootToken(stylesheet: string, token: string) {
  const root = stylesheet.match(/:root\s*\{(?<tokens>[\s\S]*?)\}/)?.groups?.tokens;
  const value = root?.match(new RegExp(`${token}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1];

  if (!value) throw new Error(`No se encontró el token ${token} en :root`);
  return value;
}

function relativeLuminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground: string, background: string) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

describe('site design system', () => {
  it('keeps the accessibility, theme and status design tokens', async () => {
    const stylesheet = await readFile(stylesheetUrl, 'utf8');

    expect(stylesheet).toContain('.skip-link');
    expect(stylesheet).toContain(':focus-visible');
    expect(stylesheet).toContain('[data-theme="light"]');
    expect(stylesheet).toContain('prefers-reduced-motion');
    expect(stylesheet).toContain('#86efac');
  });

  it('keeps subtle dark-theme text readable on footer and card surfaces', async () => {
    const stylesheet = await readFile(stylesheetUrl, 'utf8');
    const subtle = readRootToken(stylesheet, '--color-subtle');
    const footer = readRootToken(stylesheet, '--color-background-raised');
    const card = readRootToken(stylesheet, '--color-surface');

    expect(contrastRatio(subtle, footer)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(subtle, card)).toBeGreaterThanOrEqual(4.5);
  });

  it('exposes the primary navigation in Spanish', () => {
    expect(siteConfig.navigation.map(({ label }) => label)).toEqual([
      'Inicio',
      'Conocimiento',
      'Guías',
      'Blog',
      'Laboratorio',
      'Proyectos',
      'Recursos',
      'Ahora'
    ]);
  });
});
