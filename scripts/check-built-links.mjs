import { access, readFile, readdir } from 'node:fs/promises';
import { extname, relative, resolve } from 'node:path';

const siteDirectory = resolve(process.argv[2] ?? 'dist');
const hrefPattern = /\bhref\s*=\s*["']([^"']+)["']/giu;

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return filesIn(path);
    return entry.name.endsWith('.html') ? [path] : [];
  }));
  return files.flat();
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function publicPathFor(filePath) {
  const localPath = relative(siteDirectory, filePath).replaceAll('\\', '/');
  if (localPath === 'index.html') return '/';
  if (localPath.endsWith('/index.html')) return `/${localPath.slice(0, -'index.html'.length)}`;
  return `/${localPath}`;
}

async function targetFile(pathname) {
  const decodedPath = decodeURIComponent(pathname).replace(/^\/+/, '');
  const directPath = resolve(siteDirectory, decodedPath);
  if (!directPath.startsWith(`${siteDirectory}/`) && directPath !== siteDirectory) return undefined;

  const candidates = pathname.endsWith('/')
    ? [resolve(directPath, 'index.html')]
    : extname(decodedPath)
      ? [directPath]
      : [directPath, resolve(directPath, 'index.html'), `${directPath}.html`];

  for (const candidate of candidates) {
    if (await exists(candidate)) return candidate;
  }
  return undefined;
}

function hasFragment(html, fragment) {
  if (!fragment) return true;
  const decodedFragment = decodeURIComponent(fragment);
  return html.includes(`id="${decodedFragment}"`) || html.includes(`id='${decodedFragment}'`);
}

const violations = [];
for (const sourceFile of await filesIn(siteDirectory)) {
  const source = await readFile(sourceFile, 'utf8');
  const sourceUrl = new URL(publicPathFor(sourceFile), 'https://site.invalid');

  for (const [, href] of source.matchAll(hrefPattern)) {
    if (/^(?:mailto:|tel:|data:|javascript:)/iu.test(href)) continue;

    const url = new URL(href, sourceUrl);
    if (url.origin !== sourceUrl.origin) continue;

    const destination = await targetFile(url.pathname);
    const sourceName = relative(siteDirectory, sourceFile).replaceAll('\\', '/');
    if (!destination) {
      violations.push(`${sourceName}: enlace interno inexistente "${href}"`);
      continue;
    }

    if (url.hash && !hasFragment(await readFile(destination, 'utf8'), url.hash.slice(1))) {
      violations.push(`${sourceName}: fragmento interno inexistente "${href}"`);
    }
  }
}

if (violations.length > 0) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
}
