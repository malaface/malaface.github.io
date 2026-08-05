import { readFile, readdir, stat } from 'node:fs/promises';
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

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
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
    if (await isFile(candidate)) return candidate;
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
  const sourceName = relative(siteDirectory, sourceFile).replaceAll('\\', '/');

  for (const [, href] of source.matchAll(hrefPattern)) {
    if (/^(?:mailto:|tel:|data:|javascript:)/iu.test(href)) continue;

    let url;
    try {
      url = new URL(href, sourceUrl);
    } catch {
      violations.push(`${sourceName}: enlace interno malformado "${href}"`);
      continue;
    }
    if (url.origin !== sourceUrl.origin) continue;

    let destination;
    try {
      destination = await targetFile(url.pathname);
    } catch (error) {
      if (!(error instanceof URIError)) throw error;
      violations.push(`${sourceName}: enlace interno malformado "${href}"`);
      continue;
    }
    if (!destination) {
      violations.push(`${sourceName}: enlace interno inexistente "${href}"`);
      continue;
    }

    if (url.hash) {
      try {
        if (!hasFragment(await readFile(destination, 'utf8'), url.hash.slice(1))) {
          violations.push(`${sourceName}: fragmento interno inexistente "${href}"`);
        }
      } catch (error) {
        if (!(error instanceof URIError)) throw error;
        violations.push(`${sourceName}: enlace interno malformado "${href}"`);
      }
    }
  }
}

if (violations.length > 0) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
}
