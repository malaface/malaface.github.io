import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const workflow = (name: string) => new URL(`../.github/workflows/${name}`, import.meta.url);

describe('GitHub Actions workflows', () => {
  it('validates public content in CI and deployment', async () => {
    const [ci, deploy] = await Promise.all([
      readFile(workflow('ci.yml'), 'utf8'),
      readFile(workflow('deploy.yml'), 'utf8')
    ]);

    expect(ci).toContain('pnpm validate:public');
    expect(deploy).toContain('pnpm validate:public');
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
