import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const maintenanceGuide = new URL('../docs/maintenance.md', import.meta.url);

describe('maintenance guide', () => {
  it('defines the required safe operating procedures', async () => {
    const guide = await readFile(maintenanceGuide, 'utf8');

    expect(guide).toContain('## Publicar contenido');
    expect(guide).toContain('## Agregar una página de proyecto');
    expect(guide).toContain('## Privacidad');
    expect(guide).toContain('## Rollback');
    expect(guide).toMatch(/el sitio no tiene acceso (al|a la) bóveda de Obsidian/i);
  });
});
