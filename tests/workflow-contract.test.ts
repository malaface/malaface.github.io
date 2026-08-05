import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const workflow = (name: string) => new URL(`../.github/workflows/${name}`, import.meta.url);
const packageFile = new URL('../package.json', import.meta.url);

describe('GitHub Actions workflows', () => {
  it('validates public content in CI and deployment', async () => {
    const [ci, deploy] = await Promise.all([
      readFile(workflow('ci.yml'), 'utf8'),
      readFile(workflow('deploy.yml'), 'utf8')
    ]);

    expect(ci).toContain('pnpm validate:public');
    expect(deploy).toContain('pnpm validate:public');
  });

  it('pins pnpm and makes generated-output tests self-contained', async () => {
    const packageJson = JSON.parse(await readFile(packageFile, 'utf8'));

    expect(packageJson.packageManager).toBe('pnpm@11.10.0');
    expect(packageJson.scripts.test).toMatch(/^pnpm build && /);
  });

  it('validates every generated HTML document after Astro builds it', async () => {
    const packageJson = JSON.parse(await readFile(packageFile, 'utf8'));

    expect(packageJson.scripts['validate:built']).toBe(
      'node scripts/validate-public-content.mjs --built dist'
    );
    expect(packageJson.scripts.build).toMatch(/astro build && pnpm validate:built && pagefind/);
  });

  it('runs the complete browser, Lighthouse and link suite before deployment', async () => {
    const [ci, deploy] = await Promise.all([
      readFile(workflow('ci.yml'), 'utf8'),
      readFile(workflow('deploy.yml'), 'utf8')
    ]);

    for (const workflowSource of [ci, deploy]) {
      expect(workflowSource).toContain('pnpm exec playwright install --with-deps chromium');
      expect(workflowSource).toContain('pnpm test:e2e');
      expect(workflowSource).toContain('pnpm lighthouse');
      expect(workflowSource).toContain('pnpm check:links');
    }

    expect(deploy.indexOf('pnpm check:links')).toBeLessThan(deploy.indexOf('actions/upload-pages-artifact'));
  });

  it('deploys only the static dist artifact without project discovery', async () => {
    const deploy = await readFile(workflow('deploy.yml'), 'utf8');

    expect(deploy).toContain('actions/deploy-pages');
    expect(deploy).toMatch(/actions\/upload-pages-artifact[\s\S]*path:\s*\.\/dist/);
    expect(deploy).not.toMatch(
      /(?:generate-(?:github|vercel)-data|data:(?:github|vercel)|project-data|project discovery|enrichment)/i
    );
    expect(deploy).not.toMatch(/repository\s*:/i);
  });
});
