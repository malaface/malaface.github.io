import { access, readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const builtPage = (path: string) => new URL(`../dist/${path}`, import.meta.url);

describe('static site routes', () => {
  it.each([
    'index.html',
    'knowledge-hub/index.html',
    'knowledge-hub/context-engineering/index.html',
    'tags/ai-coding/index.html',
    'now/index.html'
  ])('builds %s', async (path) => {
    await expect(access(builtPage(path))).resolves.toBeUndefined();
  });

  it('does not generate a route for an unknown tag', async () => {
    await expect(access(builtPage('tags/etiqueta-desconocida/index.html'))).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('renders date-only article dates on their declared calendar day', async () => {
    const html = await readFile(builtPage('knowledge-hub/context-engineering/index.html'), 'utf8');

    expect(html).toContain('Publicado el 24 de julio de 2026');
    expect(html).not.toContain('Publicado el 23 de julio de 2026');
  });

  it('leads the home page with audiences and desired outcomes', async () => {
    const html = await readFile(builtPage('index.html'), 'utf8');
    const heroHeading = html.match(/<h1[^>]*id="hero-title"[^>]*>(?<heading>[\s\S]*?)<\/h1>/)?.groups?.heading;

    expect(heroHeading).toContain('Más alcance');
    expect(heroHeading).toContain('mejor seguimiento');
    expect(html).toContain('profesionales de la salud');
    expect(html).toContain('negocios familiares');
    expect(html).toContain('PYMEs de servicios');
    expect(html).toContain('mejor seguimiento');
    expect(html).toContain('gestión financiera');
    expect(html).toContain('tareas repetitivas');
    expect(html).toContain('no resultados concluidos');
  });
});
