import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { afterEach, describe, expect, it } from 'vitest';

const run = promisify(execFile);
const checker = new URL('../scripts/check-built-links.mjs', import.meta.url);
const temporaryDirectories: string[] = [];

async function siteFixture(link: string) {
  const directory = await mkdtemp(join(tmpdir(), 'site-links-'));
  temporaryDirectories.push(directory);
  await mkdir(join(directory, 'about'));
  await writeFile(join(directory, 'index.html'), `<a href="${link}">Destino</a>`);
  await writeFile(join(directory, 'about', 'index.html'), '<h1 id="about">About</h1>');
  return directory;
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })));
});

describe('built internal link checker', () => {
  it('accepts internal routes and fragments that exist', async () => {
    const directory = await siteFixture('/about/#about');

    await expect(run(process.execPath, [checker.pathname, directory])).resolves.toMatchObject({ stderr: '' });
  });

  it('reports an internal route that does not exist', async () => {
    const directory = await siteFixture('/missing/');

    await expect(run(process.execPath, [checker.pathname, directory])).rejects.toMatchObject({
      stderr: expect.stringContaining('/missing/')
    });
  });
});
