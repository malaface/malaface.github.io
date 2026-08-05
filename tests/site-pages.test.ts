import { access, readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const builtPage = (path: string) => new URL(`../dist/${path}`, import.meta.url);

describe('static site routes', () => {
  it.each([
    'index.html',
    'knowledge-hub/index.html',
    'knowledge-hub/context-engineering/index.html',
    'tags/ai-coding/index.html',
    'live-projects/index.html',
    'now/index.html',
    'search/index.html',
    'rss.xml',
    'sitemap-index.xml',
    'robots.txt',
    'pagefind/pagefind.js',
    'pagefind/pagefind-entry.json'
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

  it('publishes only the allowed editorial collections in RSS', async () => {
    const rss = await readFile(builtPage('rss.xml'), 'utf8');

    expect(rss).toContain('/blog/documentar-para-reutilizar/');
    expect(rss).toContain('/knowledge-hub/context-engineering/');
    expect(rss).toContain('/playbooks/content-review/');
    expect(rss).not.toContain('/laboratorio/quality-first-web-projects/');
    expect(rss).not.toContain('/recursos/public-content-checklist/');
  });

  it('allows public crawling and advertises the canonical sitemap', async () => {
    const robots = await readFile(builtPage('robots.txt'), 'utf8');

    expect(robots).toBe([
      'User-agent: *',
      'Allow: /',
      'Sitemap: https://malaface.github.io/sitemap-index.xml',
      ''
    ].join('\n'));
  });

  it('emits Person and WebSite structured data, with BlogPosting only for articles', async () => {
    const homeHtml = await readFile(builtPage('index.html'), 'utf8');
    const articleHtml = await readFile(builtPage('knowledge-hub/context-engineering/index.html'), 'utf8');
    const structuredData = (html: string) => {
      const json = html.match(/<script type="application\/ld\+json">(?<json>[\s\S]*?)<\/script>/)?.groups?.json;

      expect(json).toBeDefined();
      return JSON.parse(json ?? '{}') as { '@graph'?: Array<{ '@type'?: string }> };
    };

    const homeTypes = structuredData(homeHtml)['@graph']?.map((entry) => entry['@type']);
    const articleTypes = structuredData(articleHtml)['@graph']?.map((entry) => entry['@type']);

    expect(homeTypes).toEqual(expect.arrayContaining(['Person', 'WebSite']));
    expect(homeTypes).not.toContain('BlogPosting');
    expect(articleTypes).toEqual(expect.arrayContaining(['Person', 'WebSite', 'BlogPosting']));
  });

  it('ships an accessible local search entry point', async () => {
    const html = await readFile(builtPage('search/index.html'), 'utf8');

    expect(html).toContain('<dialog');
    expect(html).toContain('aria-label="Buscar en el sitio"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('/pagefind/pagefind.js');
    expect(html).toMatch(/<main[^>]*id="content"[^>]*data-pagefind-body>/);
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

  it('shows an honest empty project state while keeping public article activity', async () => {
    const homeHtml = await readFile(builtPage('index.html'), 'utf8');
    const projectsHtml = await readFile(builtPage('live-projects/index.html'), 'utf8');

    expect(homeHtml).toContain('href="/live-projects/"');
    expect(homeHtml).toContain('Aún no hay páginas de proyectos aprobadas para mostrar.');
    expect(projectsHtml).toContain('Aún no hay páginas de proyectos aprobadas para mostrar.');
    expect(homeHtml).toContain('Publicaciones recientes');
    expect(homeHtml).not.toContain('t-ethos');
    expect(projectsHtml).not.toContain('t-ethos');
    expect(homeHtml).not.toContain('github.com/malaface/');
    expect(projectsHtml).not.toContain('github.com/malaface/');
  });
});
