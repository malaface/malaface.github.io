import { readFile } from 'node:fs/promises';
import { describe, expect, it, vi } from 'vitest';
import { getVisibleProjects, type ProjectRecord } from '../src/lib/projects';
import { collectGitHubData } from '../scripts/generate-github-data.mjs';

const dataFile = (name: string) => new URL(`../src/data/${name}`, import.meta.url);

const selectedProject: ProjectRecord = {
  repository: 'malaface/malaface.github.io',
  name: 'malaface.github.io',
  description: 'Sitio público seleccionado.',
  technologies: ['Astro', 'TypeScript'],
  githubUrl: 'https://github.com/malaface/malaface.github.io',
  productionUrl: 'https://malaface.github.io',
  status: 'production',
  updatedAt: '2026-07-24T00:00:00.000Z',
  featured: true
};

const repositoryFixture = {
  full_name: 'malaface/malaface.github.io',
  name: 'malaface.github.io',
  description: 'Plataforma técnica pública.',
  fork: false,
  html_url: 'https://github.com/malaface/malaface.github.io',
  updated_at: '2026-08-04T12:30:00.000Z'
};

describe('selected project data', () => {
  it('gives every enabled repository a selected project with a GitHub URL', async () => {
    const allowlist = JSON.parse(await readFile(dataFile('project-allowlist.json'), 'utf8')) as Array<{
      repository: string;
      enabled: boolean;
    }>;
    const projects = JSON.parse(await readFile(dataFile('live-projects.json'), 'utf8')) as ProjectRecord[];

    for (const entry of allowlist.filter(({ enabled }) => enabled)) {
      expect(entry.repository.trim()).not.toBe('');
      expect(projects.find(({ repository }) => repository === entry.repository)?.githubUrl).toBe(
        `https://github.com/${entry.repository}`
      );
    }
  });

  it('keeps disabled candidates out of visible projects', () => {
    const disabledCandidate = {
      ...selectedProject,
      repository: 'malaface/web-template',
      githubUrl: 'https://github.com/malaface/web-template',
      enabled: false
    };

    expect(getVisibleProjects([{ ...selectedProject, enabled: true }, disabledCandidate])).toEqual([selectedProject]);
  });

  it('requires an explicit opt-in before a project becomes visible', () => {
    expect(getVisibleProjects([selectedProject])).toEqual([]);
  });

  it('sorts featured projects first and then by most recent update', () => {
    const projects = [
      {
        ...selectedProject,
        repository: 'malaface/regular-new',
        featured: false,
        updatedAt: '2026-08-05T00:00:00.000Z',
        enabled: true
      },
      {
        ...selectedProject,
        repository: 'malaface/featured-old',
        updatedAt: '2026-07-01T00:00:00.000Z',
        enabled: true
      },
      {
        ...selectedProject,
        repository: 'malaface/featured-new',
        updatedAt: '2026-08-01T00:00:00.000Z',
        enabled: true
      }
    ];

    expect(getVisibleProjects(projects).map(({ repository }) => repository)).toEqual([
      'malaface/featured-new',
      'malaface/featured-old',
      'malaface/regular-new'
    ]);
  });
});

describe('GitHub project data generation', () => {
  it('requests and normalizes only enabled repositories', async () => {
    const fetchFixture = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/languages')) {
        return new Response(JSON.stringify({ Astro: 4200, TypeScript: 2100 }), { status: 200 });
      }

      return new Response(JSON.stringify(repositoryFixture), { status: 200 });
    });

    const result = await collectGitHubData({
      allowlist: [
        {
          repository: 'malaface/malaface.github.io',
          enabled: true,
          featured: true,
          manualProductionUrl: 'https://malaface.github.io'
        },
        { repository: 'malaface/web-template', enabled: false, featured: false }
      ],
      existingProjects: [selectedProject],
      existingActivity: [],
      fetchImpl: fetchFixture,
      token: 'fixture-token',
      checkedAt: '2026-08-05T15:00:00.000Z'
    });

    expect(result.projects).toEqual([
      {
        repository: 'malaface/malaface.github.io',
        name: 'malaface.github.io',
        description: 'Plataforma técnica pública.',
        technologies: ['Astro', 'TypeScript'],
        githubUrl: 'https://github.com/malaface/malaface.github.io',
        productionUrl: 'https://malaface.github.io',
        status: 'production',
        updatedAt: '2026-08-04T12:30:00.000Z',
        featured: true
      }
    ]);
    expect(result.activity).toEqual([]);
    expect(fetchFixture).toHaveBeenCalledTimes(2);
    expect(fetchFixture.mock.calls.map(([input]) => String(input))).toEqual([
      'https://api.github.com/repos/malaface/malaface.github.io',
      'https://api.github.com/repos/malaface/malaface.github.io/languages'
    ]);
    const headers = new Headers(fetchFixture.mock.calls[0]?.[1]?.headers);
    expect(headers.get('Accept')).toBe('application/vnd.github+json');
    expect(headers.get('Authorization')).toBe('Bearer fixture-token');
  });

  it('preserves manual data and emits only a safe status when GitHub is unavailable', async () => {
    const fetchFixture = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response('upstream details must not be retained', { status: 503 })
    );

    const result = await collectGitHubData({
      allowlist: [
        {
          repository: 'malaface/malaface.github.io',
          enabled: true,
          featured: true,
          manualProductionUrl: 'https://malaface.github.io'
        }
      ],
      existingProjects: [selectedProject],
      existingActivity: [],
      fetchImpl: fetchFixture,
      token: '',
      checkedAt: '2026-08-05T15:00:00.000Z'
    });

    expect(result.projects).toEqual([selectedProject]);
    expect(result.activity).toEqual([
      {
        repository: 'malaface/malaface.github.io',
        status: 'metadata-unavailable',
        checkedAt: '2026-08-05T15:00:00.000Z'
      }
    ]);
    expect(JSON.stringify(result)).not.toContain('upstream details');
    const headers = new Headers(fetchFixture.mock.calls[0]?.[1]?.headers);
    expect(headers.get('Accept')).toBe('application/vnd.github+json');
    expect(headers.has('Authorization')).toBe(false);
  });
});
