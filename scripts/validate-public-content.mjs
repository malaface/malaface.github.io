import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, relative, resolve } from 'node:path';
import { assertPublicContent } from '../src/config/public-content-policy.mjs';

const projectDirectory = resolve();
const publicSourceDirectories = [
  'public',
  'src/components',
  'src/config',
  'src/content',
  'src/data',
  'src/layouts',
  'src/pages',
  'src/styles'
];
const publicSourceFiles = ['astro.config.mjs', 'src/content.config.ts'];
const readableExtensions = new Set([
  '.astro', '.css', '.html', '.js', '.json', '.jsx', '.md', '.mdx', '.mjs', '.mts', '.svg', '.ts', '.tsx', '.txt', '.xml'
]);
const excludedSources = new Set([
  resolve('src/config/public-content-policy.d.mts'),
  resolve('src/config/public-content-policy.mjs')
]);

async function filesIn(directory, extensions = readableExtensions) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return filesIn(path, extensions);
      return extensions.has(extname(entry.name)) ? [path] : [];
    }));
    return nested.flat();
  } catch (error) {
    if (error && error.code === 'ENOENT') return [];
    throw error;
  }
}

async function existingFiles(filePaths) {
  const files = await Promise.all(filePaths.map(async (filePath) => {
    try {
      return (await stat(filePath)).isFile() ? [filePath] : [];
    } catch (error) {
      if (error && error.code === 'ENOENT') return [];
      throw error;
    }
  }));
  return files.flat();
}

function sourceName(filePath) {
  return relative(projectDirectory, filePath).replaceAll('\\', '/');
}

const builtFlag = process.argv.indexOf('--built');
let files;
if (builtFlag >= 0) {
  const outputDirectory = process.argv[builtFlag + 1];
  if (!outputDirectory) throw new Error('Uso: validate-public-content.mjs --built <directorio>');
  files = await filesIn(resolve(outputDirectory), new Set(['.html']));
  if (files.length === 0) throw new Error(`No se encontraron archivos HTML en ${outputDirectory}`);
} else {
  const nestedSources = await Promise.all(
    publicSourceDirectories.map((directory) => filesIn(resolve(directory)))
  );
  files = [
    ...nestedSources.flat(),
    ...await existingFiles(publicSourceFiles.map((filePath) => resolve(filePath)))
  ].filter((filePath) => !excludedSources.has(filePath));
}

const violations = [];
for (const filePath of files) {
  const name = sourceName(filePath);
  violations.push(...assertPublicContent(await readFile(filePath, 'utf8'), name));
}

if (violations.length > 0) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
}
