import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { assertPublicContent } from '../src/config/public-content-policy.mjs';

const contentDirectory = resolve('src/content');
const editorialPages = [
  resolve('src/pages/contacto.astro'),
  resolve('src/pages/now.astro'),
  resolve('src/pages/sobre-mi.astro')
];

async function contentFiles(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return contentFiles(path);
      return /\.mdx?$/.test(entry.name) ? [path] : [];
    }));
    return nested.flat();
  } catch (error) {
    if (error && error.code === 'ENOENT') return [];
    throw error;
  }
}

const violations = [];
for (const filePath of [...await contentFiles(contentDirectory), ...editorialPages]) {
  violations.push(...assertPublicContent(await readFile(filePath, 'utf8'), filePath));
}

if (violations.length > 0) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
}
