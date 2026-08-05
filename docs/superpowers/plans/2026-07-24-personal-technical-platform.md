# Personal Technical Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy an Astro-based public personal technical platform that presents curated, safe knowledge and selected projects without any access to the Obsidian vault or references to NOC/Data Center work.

**Architecture:** Astro statically compiles Markdown/MDX content stored only in this repository. Typed content collections, a privacy validator, selected GitHub/Vercel metadata generators, and a Command Center editorial UI produce a GitHub Pages artifact. External connectors are optional and only enrich explicitly selected public projects.

**Tech Stack:** Astro static output, TypeScript, MDX, Pagefind, Vitest, Playwright, Lighthouse CI, GitHub Actions, GitHub Pages API, optional GitHub/Vercel REST APIs.

## Global Constraints

- Build output is static and deploys at `https://malaface.github.io` without a runtime server.
- No file, setting, secret, workflow or script may access the Obsidian vault or mention its filesystem path.
- Do not add an Obsidian importer, vault checkout, vault token, wikilink importer or backlink importer.
- Reject NOC, Data Center, infrastructure, servers, operational runbooks, incidents, credentials, IP addresses, internal systems, financial information, personal diary information and sensitive data in public content.
- Public content is created only in `src/content/`; every entry requires typed frontmatter and `draft: false` before build output.
- GitHub/Vercel data is opt-in through the project allowlist; forks, previews and unselected repositories are not displayed.
- Use Spanish for site copy and accessibility labels.
- Maintain keyboard access, visible focus states, semantic headings and WCAG AA contrast.
- Do not publish previews, deployment secrets, tokens or externally supplied HTML.
- Keep external analytics disabled.

---

## File Structure

```text
.
├── .github/workflows/{ci.yml,deploy.yml}
├── docs/{maintenance.md,superpowers/...}
├── public/{favicon.svg,og-default.svg,robots.txt}
├── scripts/{generate-github-data.mjs,generate-vercel-data.mjs,validate-public-content.mjs}
├── src/
│   ├── components/{ActivityFeed,CommandHeader,ContentCard,Footer,ProjectCard,RelatedContent,SearchDialog,TableOfContents,TagList,ThemeToggle}.astro
│   ├── config/{content-policy.ts,site.ts}
│   ├── content/{blog,knowledge,lab,playbooks,resources}/
│   ├── data/{activity.json,live-projects.json,project-allowlist.json}
│   ├── layouts/{BaseLayout,ContentLayout}.astro
│   ├── lib/{content.ts,projects.ts,seo.ts}
│   ├── pages/{index,sobre-mi,knowledge-hub,playbooks,blog,laboratorio,live-projects,recursos,now,contacto,search,tags/[tag]}.astro
│   ├── pages/{rss.xml.ts,sitemap-index.xml.ts}.ts
│   ├── styles/global.css
│   └── content.config.ts
├── tests/{content-policy,content-utils,project-data,site-pages}.test.ts
├── .lighthouserc.cjs
├── astro.config.mjs
├── package.json
├── playwright.config.ts
└── README.md
```

---

### Task 1: Create an isolated implementation branch and Astro foundation

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/config/site.ts`
- Create: `src/styles/global.css`
- Create: `tests/site-config.test.ts`
- Modify: `README.md`

**Interfaces:**
- Produces `siteConfig`, imported by all layouts and page metadata.
- Produces `pnpm dev`, `pnpm test`, `pnpm check`, `pnpm build`, `pnpm validate:public` and `pnpm test:e2e` commands.

- [ ] **Step 1: Create an isolated worktree from the documented design commit**

Run:

```bash
git status --short
git worktree add ../malaface.github.io-platform -b feat/personal-technical-platform main
```

Expected: a clean linked worktree at `../malaface.github.io-platform` on branch `feat/personal-technical-platform`.

- [ ] **Step 2: Write the failing configuration test**

Create `tests/site-config.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../src/config/site';

describe('siteConfig', () => {
  it('uses the canonical GitHub Pages origin and Spanish locale', () => {
    expect(siteConfig.url).toBe('https://malaface.github.io');
    expect(siteConfig.locale).toBe('es-MX');
    expect(siteConfig.name).toBe('Luis Miguel Malacara Jiménez');
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm test tests/site-config.test.ts`

Expected: failure because `package.json` and `src/config/site.ts` do not exist.

- [ ] **Step 4: Add Astro, scripts and site configuration**

Create `package.json`:

```json
{
  "name": "malaface-github-io",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "check": "astro check",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "validate:public": "node scripts/validate-public-content.mjs",
    "data:github": "node scripts/generate-github-data.mjs",
    "data:vercel": "node scripts/generate-vercel-data.mjs",
    "build": "pnpm validate:public && astro check && astro build && pagefind --site dist",
    "preview": "astro preview"
  },
  "dependencies": {
    "@astrojs/mdx": "latest",
    "@astrojs/rss": "latest",
    "@astrojs/sitemap": "latest",
    "astro": "latest",
    "pagefind": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "@playwright/test": "latest",
    "@types/node": "latest",
    "@vitest/coverage-v8": "latest",
    "lighthouse": "latest",
    "typescript": "latest",
    "vitest": "latest"
  }
}
```

Create `src/config/site.ts`:

```ts
export const siteConfig = {
  name: 'Luis Miguel Malacara Jiménez',
  shortName: 'LM / SYSTEMS',
  description: 'Sistemas claros para aprender, automatizar y compartir.',
  url: 'https://malaface.github.io',
  locale: 'es-MX',
  github: 'https://github.com/malaface',
  navigation: [
    { href: '/', label: 'Inicio' },
    { href: '/knowledge-hub/', label: 'Knowledge Hub' },
    { href: '/playbooks/', label: 'Playbooks' },
    { href: '/laboratorio/', label: 'Lab' },
    { href: '/live-projects/', label: 'Projects' },
    { href: '/now/', label: 'Now' }
  ]
} as const;
```

Create `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://malaface.github.io',
  output: 'static',
  integrations: [mdx(), sitemap()],
  markdown: { shikiConfig: { theme: 'github-dark' } }
});
```

Create `.gitignore`:

```gitignore
node_modules/
dist/
.astro/
playwright-report/
test-results/
.lighthouseci/
.env
.env.*
!.env.example
.superpowers/
```

Create `tsconfig.json`:

```json
{ "extends": "astro/tsconfigs/strict" }
```

Add baseline tokens and focus styles to `src/styles/global.css`, then add a short README section with `pnpm install`, `pnpm dev`, `pnpm test`, `pnpm check` and `pnpm build`.

- [ ] **Step 5: Install dependencies and verify the foundation**

Run:

```bash
pnpm install
pnpm test tests/site-config.test.ts
pnpm check
```

Expected: test passes and Astro type checking exits 0.

- [ ] **Step 6: Commit the foundation**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs tsconfig.json .gitignore src/config/site.ts src/styles/global.css tests/site-config.test.ts README.md
git commit -m "feat: initialize Astro technical platform"
```

---

### Task 2: Define typed public content and enforce privacy boundaries

**Files:**
- Create: `src/config/content-policy.ts`
- Create: `src/content.config.ts`
- Create: `scripts/validate-public-content.mjs`
- Create: `tests/content-policy.test.ts`
- Create: `tests/content-utils.test.ts`
- Create: `src/lib/content.ts`

**Interfaces:**
- `assertPublicContent(source: string, filePath: string): string[]` returns policy violations.
- `getPublishedEntries(collection)` returns only `draft: false` entries sorted newest first.
- Collections are `knowledge`, `playbooks`, `blog`, `lab` and `resources`.

- [ ] **Step 1: Write failing policy tests**

Create `tests/content-policy.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { assertPublicContent } from '../src/config/content-policy';

describe('public content policy', () => {
  it('accepts a safe public article', () => {
    expect(assertPublicContent('Automatización con scripts reutilizables.', 'safe.md')).toEqual([]);
  });

  it('rejects blocked work and sensitive terms case-insensitively', () => {
    const source = 'Lecciones de NOC y Data Center con la IP 10.0.0.5';
    expect(assertPublicContent(source, 'unsafe.md')).toEqual([
      'unsafe.md: contiene término bloqueado "noc"',
      'unsafe.md: contiene término bloqueado "data center"',
      'unsafe.md: contiene una dirección IP'
    ]);
  });
});
```

Create `tests/content-utils.test.ts` with fixtures whose `data.draft` values prove that the helper removes drafts and sorts `publishedAt` descending.

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm test tests/content-policy.test.ts tests/content-utils.test.ts`

Expected: failure because the policy and content helpers do not exist.

- [ ] **Step 3: Implement the policy and schemas**

Create `src/config/content-policy.ts`:

```ts
const blockedTerms = [
  'noc', 'data center', 'datacenter', 'infraestructura', 'servidor', 'runbook',
  'incidente', 'credencial', 'contraseña', 'ip interna', 'finanzas', 'diario',
  'sensitive', 'archives'
];
const ipAddress = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;

export function assertPublicContent(source: string, filePath: string): string[] {
  const lower = source.toLowerCase();
  const violations = blockedTerms
    .filter((term) => lower.includes(term))
    .map((term) => `${filePath}: contiene término bloqueado "${term}"`);
  if (ipAddress.test(source)) violations.push(`${filePath}: contiene una dirección IP`);
  return violations;
}
```

Create `src/content.config.ts` with one shared Zod schema requiring `title`, `description`, `publishedAt`, `section`, `category`, `tags`, `featured` and `draft`; allow optional `updatedAt`, `githubRepo` and `externalUrl`. Define allowed categories exactly as `automation`, `knowledge-systems`, `ai-coding`, `application-security`, `product-building` and `developer-experience`.

Create `src/lib/content.ts`:

```ts
export function getPublishedEntries<T extends { data: { draft: boolean; publishedAt: Date } }>(entries: T[]) {
  return entries
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}

export function readingTime(body: string) {
  return Math.max(1, Math.ceil(body.trim().split(/\s+/).filter(Boolean).length / 220));
}
```

Implement `scripts/validate-public-content.mjs` to recursively inspect only `src/content/**/*.md` and `src/content/**/*.mdx`, call the same blocked-term logic, print every violation to stderr and exit `1` when the violations array is not empty.

- [ ] **Step 4: Run validation and tests**

Run:

```bash
pnpm test tests/content-policy.test.ts tests/content-utils.test.ts
pnpm validate:public
```

Expected: both commands exit 0 with no source content yet.

- [ ] **Step 5: Commit content boundaries**

```bash
git add src/config/content-policy.ts src/content.config.ts src/lib/content.ts scripts/validate-public-content.mjs tests/content-policy.test.ts tests/content-utils.test.ts
git commit -m "feat: add public content policy"
```

---

### Task 3: Seed only evidence-based public content and editorial pages

**Files:**
- Create: `src/content/knowledge/context-engineering.md`
- Create: `src/content/knowledge/supabase-rls.md`
- Create: `src/content/playbooks/content-review.md`
- Create: `src/content/blog/documentar-para-reutilizar.md`
- Create: `src/content/lab/quality-first-web-projects.md`
- Create: `src/content/resources/public-content-checklist.md`
- Create: `src/pages/sobre-mi.astro`
- Create: `src/pages/now.astro`
- Create: `src/pages/contacto.astro`
- Create: `tests/public-content.test.ts`

**Interfaces:**
- Every entry is a self-contained public document with validated frontmatter.
- `sobre-mi`, `now` and `contacto` contain no unverified contact channel beyond GitHub.

- [ ] **Step 1: Write the failing public-content test**

Create `tests/public-content.test.ts` that glob-loads `src/content/**/*.{md,mdx}`, asserts there are at least six entries, each contains `draft: false`, and no file has policy violations.

- [ ] **Step 2: Run the test to confirm failure**

Run: `pnpm test tests/public-content.test.ts`

Expected: failure because the public content collection is empty.

- [ ] **Step 3: Write the six public entries from verified themes**

Use this exact frontmatter shape for `src/content/knowledge/context-engineering.md`:

```yaml
---
title: Context engineering para proyectos de software
description: Convertir investigación, decisiones y criterios de validación en contexto reutilizable.
publishedAt: 2026-07-24
section: knowledge
category: ai-coding
tags: [ai-coding, context-engineering, metodologia]
featured: true
draft: false
---
```

Write original Spanish prose that explains the verified pattern: planear con contexto, documentar decisiones y validar antes de entregar. Do not quote or copy any private note. Use the same schema for the other five entries, grounded only in: Supabase RLS, documentación reutilizable, pruebas de aplicaciones web, automatización y knowledge systems. Do not include NOC, Data Center or infrastructure content.

Write `src/pages/sobre-mi.astro` as a professional narrative about clarity, automation, documentation and continuous learning; `src/pages/now.astro` as an explicit public status page with the current topics `AI coding`, `desarrollo de producto` and `knowledge systems`; write `src/pages/contacto.astro` with a GitHub link and an explicit message that other channels will be added only when configured.

- [ ] **Step 4: Verify source safety**

Run:

```bash
pnpm test tests/public-content.test.ts
pnpm validate:public
```

Expected: six validated entries and no violations.

- [ ] **Step 5: Commit the public editorial foundation**

```bash
git add src/content src/pages/sobre-mi.astro src/pages/now.astro src/pages/contacto.astro tests/public-content.test.ts
git commit -m "feat: add curated public technical content"
```

---

### Task 4: Build the Command Center design system and shared layout

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/CommandHeader.astro`
- Create: `src/components/Footer.astro`
- Create: `src/components/ThemeToggle.astro`
- Create: `src/components/TagList.astro`
- Create: `src/components/ContentCard.astro`
- Create: `src/components/ProjectCard.astro`
- Modify: `src/styles/global.css`
- Create: `tests/site-style.test.ts`

**Interfaces:**
- `BaseLayout` accepts `{ title, description, image?, article? }`.
- `ContentCard` accepts `{ entry, href }`.
- `ProjectCard` accepts a typed selected project record.

- [ ] **Step 1: Write the failing design-token test**

Create `tests/site-style.test.ts` that reads `src/styles/global.css` and asserts it contains `.skip-link`, `:focus-visible`, `[data-theme="light"]`, `prefers-reduced-motion`, and the accent value `#86efac`.

- [ ] **Step 2: Run the test to confirm failure**

Run: `pnpm test tests/site-style.test.ts`

Expected: failure because the visual design system does not exist.

- [ ] **Step 3: Implement reusable layout and components**

Implement `BaseLayout.astro` with:

```astro
---
import '../styles/global.css';
import { siteConfig } from '../config/site';
import CommandHeader from '../components/CommandHeader.astro';
import Footer from '../components/Footer.astro';
const { title, description, image = '/og-default.svg', article = false } = Astro.props;
const pageTitle = title ? `${title} · ${siteConfig.name}` : siteConfig.name;
---
<!doctype html>
<html lang="es-MX" data-theme="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{pageTitle}</title>
    <meta name="description" content={description ?? siteConfig.description} />
    <link rel="canonical" href={new URL(Astro.url.pathname, siteConfig.url)} />
    <meta property="og:type" content={article ? 'article' : 'website'} />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={description ?? siteConfig.description} />
    <meta property="og:image" content={new URL(image, siteConfig.url)} />
  </head>
  <body>
    <a class="skip-link" href="#content">Saltar al contenido</a>
    <CommandHeader />
    <main id="content"><slot /></main>
    <Footer />
  </body>
</html>
```

Use CSS custom properties to implement dark/light themes, `prefers-reduced-motion`, `:focus-visible`, a 72rem content width, green status accent and responsive grid breakpoints. `ThemeToggle` must store only `lm-theme` in `localStorage` and update `document.documentElement.dataset.theme`.

- [ ] **Step 4: Run the design-system tests**

Run:

```bash
pnpm test tests/site-style.test.ts
pnpm check
```

Expected: design-token test and Astro type checking pass.

- [ ] **Step 5: Commit the design system**

```bash
git add src/layouts src/components src/styles/global.css tests/site-style.test.ts public/og-default.svg public/favicon.svg
git commit -m "feat: add command center design system"
```

---

### Task 5: Implement home, content hubs, articles, tags and related content

**Files:**
- Create: `src/layouts/ContentLayout.astro`
- Create: `src/components/TableOfContents.astro`
- Create: `src/components/RelatedContent.astro`
- Create: `src/components/ActivityFeed.astro`
- Create: `src/pages/index.astro`
- Create: `src/pages/knowledge-hub/index.astro`
- Create: `src/pages/knowledge-hub/[slug].astro`
- Create: `src/pages/playbooks/index.astro`
- Create: `src/pages/playbooks/[slug].astro`
- Create: `src/pages/blog/index.astro`
- Create: `src/pages/blog/[slug].astro`
- Create: `src/pages/laboratorio/index.astro`
- Create: `src/pages/laboratorio/[slug].astro`
- Create: `src/pages/recursos/index.astro`
- Create: `src/pages/recursos/[slug].astro`
- Create: `src/pages/tags/[tag].astro`
- Modify: `src/lib/content.ts`
- Modify: `tests/site-pages.test.ts`

**Interfaces:**
- `relatedEntries(current, candidates, limit = 3)` ranks matching category first, then shared tags.
- Each `[slug]` route generates only published collection entries using `getStaticPaths`.

- [ ] **Step 1: Add failing related-content tests**

Extend `tests/content-utils.test.ts`:

```ts
it('ranks matching categories before a single shared tag', () => {
  const ranked = relatedEntries(current, [sharedCategory, sharedTag, unrelated]);
  expect(ranked.map((entry) => entry.id)).toEqual(['shared-category', 'shared-tag']);
});
```

- [ ] **Step 2: Verify failure**

Run: `pnpm test tests/content-utils.test.ts`

Expected: failure because `relatedEntries` is not exported.

- [ ] **Step 3: Implement routes with real collection data**

Implement `relatedEntries` as a stable score sort: `+3` matching category and `+1` per shared tag, remove the current entry and drafts, then return the first three.

Implement `ContentLayout.astro` to render breadcrumb navigation, `h1`, dates, reading time, tag links, a generated table of contents and `RelatedContent`. Use `entry.render()` in each dynamic page, never raw HTML from external metadata.

Implement `index.astro` with the approved home sequence:

1. Command Center hero: “Construyo sistemas claros para aprender, automatizar y compartir.”
2. Evidence-based specialties: Automatización, IA aplicada, Desarrollo de producto, Knowledge systems and Seguridad de aplicaciones.
3. Featured public entries.
4. Selected projects and safe activity feed.
5. CTA to Knowledge Hub and Playbooks.

Hub index pages must display only categories with published entries. The `tags/[tag]` page must return 404 for an unknown tag. Render no NOC/Data Center/infrastructure terminology in navigation, copy or category labels.

- [ ] **Step 4: Add route assertions and verify build**

Extend `tests/site-pages.test.ts` to assert that `dist/index.html`, `dist/knowledge-hub/index.html`, `dist/knowledge-hub/context-engineering/index.html`, `dist/tags/ai-coding/index.html` and `dist/now/index.html` exist after `pnpm build`.

Run:

```bash
pnpm build
pnpm test tests/content-utils.test.ts tests/site-pages.test.ts
```

Expected: build and all route tests pass.

- [ ] **Step 5: Commit content routes**

```bash
git add src/layouts/ContentLayout.astro src/components/TableOfContents.astro src/components/RelatedContent.astro src/components/ActivityFeed.astro src/pages src/lib/content.ts tests/content-utils.test.ts tests/site-pages.test.ts
git commit -m "feat: add knowledge hub and editorial routes"
```

---

### Task 6: Add selected project data and safe GitHub activity generation

**Files:**
- Create: `src/data/project-allowlist.json`
- Create: `src/data/live-projects.json`
- Create: `src/data/activity.json`
- Create: `src/lib/projects.ts`
- Create: `scripts/generate-github-data.mjs`
- Create: `tests/project-data.test.ts`
- Create: `src/pages/live-projects/index.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- `ProjectRecord` has `repository`, `name`, `description`, `technologies`, `githubUrl`, `productionUrl?`, `status`, `updatedAt`, `featured`.
- `generate-github-data.mjs` processes only `project-allowlist.json` records with `enabled: true`.

- [ ] **Step 1: Write failing project-selection tests**

Create `tests/project-data.test.ts` that loads `project-allowlist.json`, verifies every enabled record has a non-empty repository and GitHub URL, and asserts that a record with `enabled: false` is absent from `getVisibleProjects`.

- [ ] **Step 2: Run test to verify failure**

Run: `pnpm test tests/project-data.test.ts`

Expected: failure because data and helpers are absent.

- [ ] **Step 3: Define explicit, evidence-based selected projects**

Create `src/data/project-allowlist.json` with these starting records:

```json
[
  { "repository": "malaface/malaface.github.io", "enabled": true, "featured": true, "manualProductionUrl": "https://malaface.github.io" },
  { "repository": "malaface/t-ethos", "enabled": true, "featured": true, "manualProductionUrl": "https://t-ethos.vercel.app" },
  { "repository": "malaface/web-template", "enabled": false, "featured": false },
  { "repository": "malaface/webHermana", "enabled": false, "featured": false }
]
```

The disabled records are candidates only and must not render. Do not add forks, course repos, private details or unverified URLs.

Implement `src/lib/projects.ts` with `getVisibleProjects(projects)` that returns enabled records sorted by `featured` then `updatedAt` descending.

Implement `generate-github-data.mjs` using the built-in `fetch` API. Read `GITHUB_TOKEN` only when present, set an `Accept: application/vnd.github+json` header, fetch `/repos/{repository}` and `/repos/{repository}/languages`, and write normalized JSON containing only the allowed record fields. If a fetch fails, retain the existing record and append a safe `activity.json` failure status; never throw away previously generated production URLs.

Implement `/live-projects/` with `ProjectCard` records, a “verificado” label only when `productionUrl` exists, and no preview URL support.

- [ ] **Step 4: Verify selection and output**

Run:

```bash
pnpm test tests/project-data.test.ts
GITHUB_TOKEN='' pnpm data:github
pnpm build
```

Expected: tests pass, static manual records remain usable without a token, and `/live-projects/` builds.

- [ ] **Step 5: Commit project integration**

```bash
git add src/data src/lib/projects.ts scripts/generate-github-data.mjs tests/project-data.test.ts src/pages/live-projects src/pages/index.astro
git commit -m "feat: add selected GitHub projects"
```

---

### Task 7: Add optional Vercel production enrichment

**Files:**
- Create: `scripts/generate-vercel-data.mjs`
- Modify: `src/data/live-projects.json`
- Modify: `src/lib/projects.ts`
- Modify: `tests/project-data.test.ts`
- Modify: `.env.example`
- Modify: `README.md`

**Interfaces:**
- Optional env: `VERCEL_TOKEN`, `VERCEL_TEAM_ID`.
- The script accepts only deployments where `target === 'production'`.

- [ ] **Step 1: Add a failing production-only test**

Add to `tests/project-data.test.ts`:

```ts
it('keeps a production deployment and removes preview deployments', () => {
  expect(selectProductionDeployments([preview, production])).toEqual([production]);
});
```

- [ ] **Step 2: Verify failure**

Run: `pnpm test tests/project-data.test.ts`

Expected: failure because `selectProductionDeployments` does not exist.

- [ ] **Step 3: Implement production-only Vercel connector**

Implement and export `selectProductionDeployments` in `src/lib/projects.ts`:

```ts
export function selectProductionDeployments<T extends { target?: string }>(deployments: T[]) {
  return deployments.filter((deployment) => deployment.target === 'production');
}
```

Implement `scripts/generate-vercel-data.mjs` to exit `0` with `Vercel no configurado; se conservan datos manuales.` when `VERCEL_TOKEN` is absent. When it exists, call `https://api.vercel.com/v6/deployments?limit=100` with Bearer auth and optional `teamId`, filter with `selectProductionDeployments`, match only enabled project records by repository name, and update `productionUrl`, `status: 'production'` and `updatedAt`. Do not write a `url` whose deployment target is missing or equals `preview`.

Create `.env.example`:

```dotenv
# Optional: enrich explicitly selected production projects.
GITHUB_TOKEN=
VERCEL_TOKEN=
VERCEL_TEAM_ID=
```

Document that these values are local or GitHub Action secrets and are never committed.

- [ ] **Step 4: Run test and no-token behavior**

Run:

```bash
pnpm test tests/project-data.test.ts
VERCEL_TOKEN='' pnpm data:vercel
```

Expected: tests pass; the command exits 0 and does not alter manual production records.

- [ ] **Step 5: Commit Vercel enrichment**

```bash
git add scripts/generate-vercel-data.mjs src/lib/projects.ts src/data/live-projects.json tests/project-data.test.ts .env.example README.md
git commit -m "feat: add production-only Vercel enrichment"
```

---

### Task 8: Add search, RSS, sitemap, robots and structured SEO

**Files:**
- Create: `src/components/SearchDialog.astro`
- Create: `src/pages/search/index.astro`
- Create: `src/pages/rss.xml.ts`
- Create: `src/pages/robots.txt.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/CommandHeader.astro`
- Modify: `tests/site-pages.test.ts`

**Interfaces:**
- Search reads only `/pagefind/pagefind.js` generated from `dist`.
- RSS contains published `blog`, `knowledge` and `playbooks` entries only.

- [ ] **Step 1: Add failing SEO assertions**

Extend `tests/site-pages.test.ts` to assert build output includes `dist/rss.xml`, `dist/sitemap-index.xml`, `dist/robots.txt`, `dist/search/index.html`, and Pagefind assets.

- [ ] **Step 2: Confirm expected failure**

Run: `pnpm build && pnpm test tests/site-pages.test.ts`

Expected: route assertions fail before the endpoints and search page are added.

- [ ] **Step 3: Implement static discovery features**

Create `rss.xml.ts` using `@astrojs/rss`, `siteConfig.url` and published safe entries. Create `robots.txt.ts` that allows `/` and references `/sitemap-index.xml`. Add JSON-LD `Person` and `WebSite` in `BaseLayout`; add `BlogPosting` only when the `article` prop is true. Use a local `SearchDialog` script that lazy-loads Pagefind after the user opens search; it must use text nodes for result titles and excerpts, not `innerHTML`.

- [ ] **Step 4: Build and verify output**

Run:

```bash
pnpm build
pnpm test tests/site-pages.test.ts
```

Expected: generated RSS, sitemap, robots and Pagefind assets exist; tests pass.

- [ ] **Step 5: Commit discovery and SEO**

```bash
git add src/components/SearchDialog.astro src/pages/search src/pages/rss.xml.ts src/pages/robots.txt src/layouts/BaseLayout.astro src/components/CommandHeader.astro tests/site-pages.test.ts
git commit -m "feat: add search and technical SEO"
```

---

### Task 9: Add end-to-end accessibility and performance checks

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/navigation.spec.ts`
- Create: `tests/e2e/accessibility.spec.ts`
- Create: `.lighthouserc.cjs`
- Modify: `package.json`
- Modify: `README.md`

**Interfaces:**
- `pnpm test:e2e` runs against `pnpm preview`.
- `pnpm lighthouse` measures `/`, `/knowledge-hub/` and `/live-projects/`.

- [ ] **Step 1: Write the first failing browser test**

Create `tests/e2e/navigation.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('navigates to the Knowledge Hub with keyboard-visible controls', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Knowledge Hub' }).click();
  await expect(page).toHaveURL(/\/knowledge-hub\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
```

- [ ] **Step 2: Run the test and confirm the initial failure**

Run: `pnpm test:e2e tests/e2e/navigation.spec.ts`

Expected: failure until Playwright configuration and browser installation are complete.

- [ ] **Step 3: Configure browser and quality checks**

Configure Playwright with `baseURL: 'http://127.0.0.1:4321'` and a `webServer` command `pnpm preview --host 127.0.0.1`. Add `pnpm exec playwright install --with-deps chromium` to setup documentation, not to build scripts.

Create `tests/e2e/accessibility.spec.ts` that checks the skip link, theme button label, a non-empty `main`, one H1, keyboard focus visibility and absence of horizontal scrolling at 375px.

Create `.lighthouserc.cjs` with static dist collection and assertions `categories:performance >= 0.95`, `accessibility >= 0.95`, `best-practices >= 0.95`, `seo >= 0.95` for `/`, `/knowledge-hub/` and `/live-projects/`. Add a `lighthouse` npm script.

- [ ] **Step 4: Run quality checks**

Run:

```bash
pnpm build
pnpm test:e2e
pnpm lighthouse
```

Expected: navigation/accessibility checks pass; Lighthouse meets all four thresholds or the task is not committed until code/CSS is corrected.

- [ ] **Step 5: Commit quality automation**

```bash
git add playwright.config.ts tests/e2e .lighthouserc.cjs package.json README.md
git commit -m "test: add accessibility and lighthouse checks"
```

---

### Task 10: Configure GitHub Actions CI and GitHub Pages deployment

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`

**Interfaces:**
- PR workflow runs validate, unit tests, check, build and E2E tests.
- Main deployment workflow publishes only `dist/` after validation.

- [ ] **Step 1: Write workflow contract checks**

Create `tests/workflow-contract.test.ts` that reads the two YAML files as text and asserts both invoke `pnpm validate:public`; assert deploy contains `actions/deploy-pages` and does not contain `OBSIDIAN`, `VAULT`, `preview` or `VERCEL_TOKEN` printed with `echo`.

- [ ] **Step 2: Verify failure**

Run: `pnpm test tests/workflow-contract.test.ts`

Expected: failure because workflow files are absent.

- [ ] **Step 3: Implement minimum-permission workflows**

Create `.github/workflows/ci.yml` for `pull_request` and `push` with `contents: read`, Node LTS setup, `pnpm/action-setup`, dependency install, `pnpm validate:public`, `pnpm test`, `pnpm check`, `pnpm build`, and `pnpm test:e2e`.

Create `.github/workflows/deploy.yml` for pushes to `main` with:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

Run the public validator and test suite before `actions/configure-pages`, `actions/upload-pages-artifact` with `path: ./dist`, and `actions/deploy-pages`. The workflow may run `pnpm data:github` and `pnpm data:vercel` only when matching secrets exist; the scripts’ no-token behavior must be safe. Never checkout another repository.

- [ ] **Step 4: Verify contracts and build locally**

Run:

```bash
pnpm test tests/workflow-contract.test.ts
pnpm validate:public
pnpm build
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit CI/CD**

```bash
git add .github/workflows tests/workflow-contract.test.ts README.md
git commit -m "ci: validate and deploy GitHub Pages"
```

---

### Task 11: Document content maintenance, project curation and safe operation

**Files:**
- Create: `docs/maintenance.md`
- Create: `CONTRIBUTING.md`
- Modify: `README.md`
- Create: `tests/documentation-contract.test.ts`

**Interfaces:**
- Maintenance guide is the single source for publishing content, selecting projects, configuring optional tokens and rollback.

- [ ] **Step 1: Write failing documentation contract test**

Create `tests/documentation-contract.test.ts` to assert `docs/maintenance.md` contains the exact headings `## Publicar contenido`, `## Seleccionar proyectos`, `## Configurar integraciones opcionales`, `## Privacidad` and `## Rollback`; assert it states that the site does not access the Obsidian vault.

- [ ] **Step 2: Run test to confirm failure**

Run: `pnpm test tests/documentation-contract.test.ts`

Expected: failure because the maintenance guide is absent.

- [ ] **Step 3: Write operational documentation**

Document the exact content workflow: create Markdown in `src/content`, fill typed frontmatter, run `pnpm validate:public && pnpm test && pnpm build`, open a PR, and publish after CI succeeds. Explicitly state that any idea originally developed in Obsidian must be rewritten manually as a safe public article; the site has no vault access.

Document selection of an enabled project, manual production URL confirmation, optional GitHub/Vercel secret configuration, secret revocation, and rollback by reverting a deployment commit. Include a checklist that forbids NOC, Data Center, infrastructure and sensitive data.

- [ ] **Step 4: Verify documentation and full project commands**

Run:

```bash
pnpm test tests/documentation-contract.test.ts
pnpm validate:public
pnpm test
pnpm check
pnpm build
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit maintenance guides**

```bash
git add docs/maintenance.md CONTRIBUTING.md README.md tests/documentation-contract.test.ts
git commit -m "docs: add safe site maintenance guide"
```

---

### Task 12: Perform release verification and prepare handoff

**Files:**
- Modify: `README.md`
- Create: `docs/release-checklist.md`

**Interfaces:**
- Release checklist records exact verification commands and GitHub Pages configuration steps.

- [ ] **Step 1: Check prohibited wording in source and artifact**

Run:

```bash
pnpm validate:public
pnpm build
rg -n -i 'noc|data center|datacenter|infraestructura|servidor|runbook|incidente|obsidian-vault|vault path' src dist .github scripts
```

Expected: validator exits 0; `rg` returns no matches except the explicitly permitted human-readable statement in `docs/maintenance.md` that the site does not access the vault. If a prohibited word appears in `src`, `dist`, `.github` or `scripts`, remove it before release.

- [ ] **Step 2: Run the complete verification suite**

Run:

```bash
pnpm test
pnpm check
pnpm build
pnpm test:e2e
pnpm lighthouse
git diff --check
git status --short
```

Expected: all quality commands exit 0; diff check is empty; status contains only intended files.

- [ ] **Step 3: Add release checklist and final README links**

Create `docs/release-checklist.md` with the exact commands from Step 2 and GitHub’s Pages setting: `Settings → Pages → Build and deployment → Source: GitHub Actions`. Link this checklist, `docs/maintenance.md` and the design/spec documents from README.

- [ ] **Step 4: Commit verified release documentation**

```bash
git add README.md docs/release-checklist.md
git commit -m "docs: add release verification checklist"
```

- [ ] **Step 5: Request independent review before merge**

Use `superpowers:requesting-code-review` with the commit range from the initial Astro foundation commit through the release checklist commit. Resolve every confirmed finding, repeat Step 2, then merge or open a pull request.
