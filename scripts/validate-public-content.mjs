import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const contentDirectory = resolve('src/content');
const blockedTerms = [
  'noc', 'data center', 'datacenter', 'infraestructura', 'servidor', 'runbook',
  'incidente', 'credencial', 'contraseña', 'ip interna', 'finanzas', 'diario',
  'sensitive', 'archives'
];
const ipAddress = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;

function assertPublicContent(source, filePath) {
  const lower = source.toLowerCase();
  const violations = blockedTerms
    .filter((term) => lower.includes(term))
    .map((term) => `${filePath}: contiene término bloqueado "${term}"`);

  if (ipAddress.test(source)) {
    violations.push(`${filePath}: contiene una dirección IP`);
  }

  return violations;
}

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
for (const filePath of await contentFiles(contentDirectory)) {
  violations.push(...assertPublicContent(await readFile(filePath, 'utf8'), filePath));
}

if (violations.length > 0) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
}
