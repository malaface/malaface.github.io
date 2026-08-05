import { access, readFile } from 'node:fs/promises';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { getVisibleProjects, type ProjectRecord } from '../src/lib/projects';

const dataFile = (name: string) => new URL(`../src/data/${name}`, import.meta.url);
const projectFile = (path: string) => new URL(`../${path}`, import.meta.url);

type ManualPageRecord = {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  productionUrl: string;
  status: string;
  updatedAt: string;
  featured: boolean;
};

const manualPage = (overrides: Partial<ManualPageRecord> = {}): ManualPageRecord => ({
  id: 'manual-page',
  name: 'Página aprobada',
  description: 'Página pública aprobada manualmente.',
  technologies: ['Astro'],
  productionUrl: 'https://example.com/pagina-aprobada',
  status: 'production',
  updatedAt: '2026-08-05T00:00:00.000Z',
  featured: false,
  ...overrides
});

describe('manual Live Projects catalog', () => {
  it('uses only the manual public-page record contract', () => {
    expectTypeOf<ProjectRecord>().toEqualTypeOf<ManualPageRecord>();
  });

  it('starts empty until the user supplies an approved public page URL', async () => {
    const projects = JSON.parse(await readFile(dataFile('live-projects.json'), 'utf8'));

    expect(projects).toEqual([]);
  });

  it('sorts manually approved pages by featured state and update date', () => {
    const projects = [
      manualPage({ id: 'regular-new', updatedAt: '2026-08-05T00:00:00.000Z' }),
      manualPage({ id: 'featured-old', featured: true, updatedAt: '2026-07-01T00:00:00.000Z' }),
      manualPage({ id: 'featured-new', featured: true, updatedAt: '2026-08-01T00:00:00.000Z' })
    ];

    expect(getVisibleProjects(projects).map(({ id }) => id)).toEqual([
      'featured-new',
      'featured-old',
      'regular-new'
    ]);
  });

  it('has no project discovery or API integration artifacts', async () => {
    await expect(access(projectFile('scripts/generate-github-data.mjs'))).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(access(projectFile('scripts/generate-vercel-data.mjs'))).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(access(dataFile('project-allowlist.json'))).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(access(dataFile('activity.json'))).rejects.toMatchObject({ code: 'ENOENT' });

    const packageJson = JSON.parse(await readFile(projectFile('package.json'), 'utf8'));
    expect(packageJson.scripts).not.toHaveProperty('data:github');
    expect(packageJson.scripts).not.toHaveProperty('data:vercel');
  });
});
