import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { afterEach, describe, expect, it } from 'vitest';
import { assertPublicContent } from '../src/config/content-policy';

const run = promisify(execFile);
const validator = new URL('../scripts/validate-public-content.mjs', import.meta.url);
const temporaryDirectories: string[] = [];

const contentEntries = import.meta.glob<string>('../src/content/**/*.{md,mdx}', {
  eager: true,
  import: 'default',
  query: '?raw'
});
const editorialPages = import.meta.glob<string>([
  '../src/pages/contacto.astro',
  '../src/pages/now.astro',
  '../src/pages/sobre-mi.astro'
], {
  eager: true,
  import: 'default',
  query: '?raw'
});
const publicSources = import.meta.glob<string>([
  '../astro.config.mjs',
  '../public/**/*',
  '../src/components/**/*',
  '../src/config/**/*',
  '../src/content.config.ts',
  '../src/content/**/*.{md,mdx}',
  '../src/data/**/*.json',
  '../src/layouts/**/*',
  '../src/pages/**/*',
  '../src/styles/**/*'
], {
  eager: true,
  import: 'default',
  query: '?raw'
});

const policySourcePrefix = '../src/config/public-content-policy.';

async function publicSiteFixture() {
  const directory = await mkdtemp(join(tmpdir(), 'public-content-'));
  temporaryDirectories.push(directory);

  await Promise.all([
    mkdir(join(directory, 'public'), { recursive: true }),
    mkdir(join(directory, 'src', 'components'), { recursive: true }),
    mkdir(join(directory, 'src', 'config'), { recursive: true }),
    mkdir(join(directory, 'src', 'data'), { recursive: true }),
    mkdir(join(directory, 'src', 'layouts'), { recursive: true }),
    mkdir(join(directory, 'src', 'pages'), { recursive: true }),
    mkdir(join(directory, 'tests'), { recursive: true }),
    mkdir(join(directory, 'docs'), { recursive: true })
  ]);

  await Promise.all(['contacto', 'now', 'sobre-mi'].map((page) =>
    writeFile(join(directory, 'src', 'pages', `${page}.astro`), '<p>Contenido público seguro.</p>')
  ));

  return directory;
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })));
});

describe('public editorial content', () => {
  it('publishes at least six policy-safe entries with an explicit draft flag', () => {
    const entries = Object.entries(contentEntries);

    expect(entries.length).toBeGreaterThanOrEqual(6);

    for (const [filePath, source] of entries) {
      const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];

      expect(frontmatter, filePath).toMatch(/^draft: false$/m);
      expect(assertPublicContent(source, filePath)).toEqual([]);
    }
  });

  it('keeps every editorial Astro page within the public-content policy', () => {
    expect(Object.keys(editorialPages)).toHaveLength(3);

    for (const [filePath, source] of Object.entries(editorialPages)) {
      expect(assertPublicContent(source, filePath)).toEqual([]);
    }
  });

  it('keeps every public or renderable source within the public-content policy', () => {
    const sources = Object.entries(publicSources)
      .filter(([filePath]) => !filePath.startsWith(policySourcePrefix));

    expect(sources.length).toBeGreaterThan(20);

    for (const [filePath, source] of sources) {
      expect(assertPublicContent(source, filePath)).toEqual([]);
    }
  });

  it('rejects policy violations across public sources without scanning declarative policy, tests or docs', async () => {
    const directory = await publicSiteFixture();
    const unsafeSources = {
      'public/og.svg': '<svg><text>runbook</text></svg>',
      'src/pages/index.astro': '<p>NOC</p>',
      'src/components/Card.astro': '<p>Data Center</p>',
      'src/layouts/BaseLayout.astro': '<p>private financial data</p>',
      'src/config/site.ts': "export const description = 'número de cuenta';",
      'src/data/live-projects.json': '[{"description":"CLABE"}]'
    };

    await Promise.all([
      ...Object.entries(unsafeSources).map(([filePath, source]) =>
        writeFile(join(directory, filePath), source)
      ),
      writeFile(
        join(directory, 'src', 'components', 'Finance.astro'),
        '<p>Gestión financiera empresarial para PYMEs.</p>'
      ),
      writeFile(
        join(directory, 'src', 'config', 'public-content-policy.mjs'),
        "export const blockedTerms = ['NOC', 'Data Center', 'CLABE'];"
      ),
      writeFile(join(directory, 'tests', 'policy.test.ts'), "const unsafe = 'NOC';"),
      writeFile(join(directory, 'docs', 'policy.md'), 'NOC, Data Center y CLABE están prohibidos.')
    ]);

    const result = run(process.execPath, [validator.pathname], { cwd: directory });

    await expect(result).rejects.toMatchObject({
      stderr: expect.stringContaining('src/pages/index.astro')
    });
    await expect(result).rejects.toMatchObject({
      stderr: expect.stringContaining('src/components/Card.astro')
    });
    await expect(result).rejects.toMatchObject({
      stderr: expect.stringContaining('src/layouts/BaseLayout.astro')
    });
    await expect(result).rejects.toMatchObject({
      stderr: expect.stringContaining('src/config/site.ts')
    });
    await expect(result).rejects.toMatchObject({
      stderr: expect.stringContaining('src/data/live-projects.json')
    });
    await expect(result).rejects.toMatchObject({
      stderr: expect.stringContaining('public/og.svg')
    });
    await expect(result).rejects.toMatchObject({
      stderr: expect.not.stringContaining('Finance.astro')
    });
    await expect(result).rejects.toMatchObject({
      stderr: expect.not.stringContaining('public-content-policy.mjs')
    });
    await expect(result).rejects.toMatchObject({
      stderr: expect.not.stringContaining('tests/policy.test.ts')
    });
    await expect(result).rejects.toMatchObject({
      stderr: expect.not.stringContaining('docs/policy.md')
    });
  });

  it('rejects policy violations from every generated HTML document', async () => {
    const directory = await publicSiteFixture();
    await mkdir(join(directory, 'dist', 'nested'), { recursive: true });
    await writeFile(join(directory, 'dist', 'index.html'), '<p>Contenido seguro.</p>');
    await writeFile(join(directory, 'dist', 'nested', 'index.html'), '<p>Data Center</p>');

    await expect(
      run(process.execPath, [validator.pathname, '--built', 'dist'], { cwd: directory })
    ).rejects.toMatchObject({
      stderr: expect.stringContaining('dist/nested/index.html')
    });
  });
});
