import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const maintenanceGuide = new URL('../docs/maintenance.md', import.meta.url);
const releaseChecklist = new URL('../docs/release-checklist.md', import.meta.url);

describe('maintenance guide', () => {
  it('defines the required safe operating procedures', async () => {
    const guide = await readFile(maintenanceGuide, 'utf8');

    expect(guide).toContain('## Publicar contenido');
    expect(guide).toContain('## Agregar una página de proyecto');
    expect(guide).toContain('## Privacidad');
    expect(guide).toContain('## Rollback');
    expect(guide).toMatch(/el sitio no tiene acceso (al|a la) bóveda de Obsidian/i);
  });

  it('forbids only private or personal financial information while allowing generic business guidance', async () => {
    const guide = await readFile(maintenanceGuide, 'utf8');

    expect(guide).toMatch(/información financiera (?:privada|personal)/i);
    expect(guide).toMatch(/gestión financiera empresarial genérica.+permitida/i);
    expect(guide).not.toMatch(/información financiera ni otro dato sensible/i);
  });

  it('runs the built-link gate after the build-dependent release checks', async () => {
    const guide = await readFile(releaseChecklist, 'utf8');
    const lighthouse = guide.indexOf('pnpm lighthouse');
    const linkCheck = guide.indexOf('pnpm check:links');
    const diffCheck = guide.indexOf('git diff --check');

    expect(lighthouse).toBeGreaterThan(-1);
    expect(linkCheck).toBeGreaterThan(lighthouse);
    expect(diffCheck).toBeGreaterThan(linkCheck);
  });
});
