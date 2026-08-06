import { access, readFile } from 'node:fs/promises';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  getHomeProject,
  getVisibleProjects,
  parseProjectRecords,
  type ProjectRecord,
  type ProjectStatus
} from '../src/lib/projects';

const dataFile = (name: string) => new URL(`../src/data/${name}`, import.meta.url);
const projectFile = (path: string) => new URL(`../${path}`, import.meta.url);

type ManualPageRecord = {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  productionUrl: string;
  status: ProjectStatus;
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

  it('contains exactly the two manually approved public pages', async () => {
    const projects = parseProjectRecords(JSON.parse(await readFile(dataFile('live-projects.json'), 'utf8')));

    expect(projects).toEqual([
      {
        id: 'nexus-hvac',
        name: 'Nexus HVAC',
        description: 'Servicios de instalación, reparación y mantenimiento de sistemas de aire acondicionado y refrigeración para hogares y negocios en Guadalajara.',
        technologies: ['Next.js'],
        productionUrl: 'https://nexus-hvac.malacaran8n.uk/',
        status: 'production',
        updatedAt: '2026-08-05T00:00:00.000Z',
        featured: true
      },
      {
        id: 't-ethos',
        name: 'T-Ethos',
        description: 'Presencia digital para profesionales y artesanos mediante automatizaciones, asistentes de IA, páginas web y consultoría personalizada.',
        technologies: ['Next.js'],
        productionUrl: 'https://t-ethos.malacaran8n.uk/',
        status: 'production',
        updatedAt: '2026-08-05T00:00:00.000Z',
        featured: false
      }
    ]);
    expect(getHomeProject(projects)?.id).toBe('nexus-hvac');
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

  it('uses the first sorted page as the home fallback when none is featured', () => {
    const projects = [
      manualPage({ id: 'older', updatedAt: '2026-07-01T00:00:00.000Z' }),
      manualPage({ id: 'newer', updatedAt: '2026-08-01T00:00:00.000Z' })
    ];

    expect(getHomeProject(projects)?.id).toBe('newer');
  });

  it('parses a record with the exact manual catalog fields', () => {
    const project = manualPage();

    expect(parseProjectRecords([project])).toEqual([project]);
  });

  it('rejects a catalog that is not an array', () => {
    expect(() => parseProjectRecords({ projects: [] })).toThrow('expected an array');
  });

  it.each(['repository', 'githubUrl'])('rejects the legacy extra field %s', (extraKey) => {
    expect(() => parseProjectRecords([{ ...manualPage(), [extraKey]: 'not-allowed' }])).toThrow(
      'exactly the approved fields'
    );
  });

  it.each([
    ['a missing required field', (() => {
      const { description: _description, ...missingDescription } = manualPage();
      return missingDescription;
    })()],
    ['a non-string name', { ...manualPage(), name: 42 }],
    ['a non-boolean featured flag', { ...manualPage(), featured: 'yes' }],
    ['a technologies value that is not an array', { ...manualPage(), technologies: 'Astro' }],
    ['a non-string technology', { ...manualPage(), technologies: ['Astro', 42] }]
  ])('rejects %s', (_label, project) => {
    expect(() => parseProjectRecords([project])).toThrow('Invalid manual project record');
  });

  it.each([
    ['a relative production URL', { ...manualPage(), productionUrl: '/proyecto' }],
    ['a non-HTTP production URL', { ...manualPage(), productionUrl: 'ftp://example.com/proyecto' }],
    ['an invalid update date', { ...manualPage(), updatedAt: 'not-a-date' }],
    ['an unsupported status', { ...manualPage(), status: 'unknown' }]
  ])('rejects %s', (_label, project) => {
    expect(() => parseProjectRecords([project])).toThrow('Invalid manual project record');
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
