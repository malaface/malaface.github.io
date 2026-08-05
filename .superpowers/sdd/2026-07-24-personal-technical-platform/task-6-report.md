# Task 6 Report: Manual Live Projects Catalog

## Status

Complete.

## Final behavior

- `src/data/live-projects.json` is the only project-page catalog and is currently `[]` because the owner has not supplied an approved public URL.
- `ProjectRecord` has exactly eight fields: `id`, `name`, `description`, `technologies`, `productionUrl`, `status`, `updatedAt` and `featured`.
- `ProjectCard` links only to the approved public page through `productionUrl`.
- Inicio and `/live-projects/` show `Aún no hay páginas de proyectos aprobadas para mostrar.` while the catalog is empty.
- Inicio continues to show recent public editorial entries.
- When approved records exist, Inicio prefers the first featured record. If none is featured, it shows the first record from the deterministic featured/date/id sort. It claims the catalog is empty only when the complete parsed catalog is empty.

## Runtime validation

Both Astro pages call `parseProjectRecords` before sorting or rendering imported JSON. The parser rejects:

- a top-level value that is not an array;
- missing or additional record keys, including legacy source-code fields;
- empty or incorrectly typed `id`, `name` and `description` values;
- a `technologies` value that is not an array of non-empty strings;
- a `productionUrl` that is not an absolute HTTP(S) URL or that contains credentials;
- an invalid, non-canonical ISO `updatedAt` timestamp;
- a `status` outside `production`, `maintenance` and `archived`;
- a non-boolean `featured` value.

Invalid catalog data therefore fails the build instead of being cast into the page contract.

## TDD evidence

- The focused suite first failed because `parseProjectRecords` and `getHomeProject` did not exist; the failing cases also demonstrated that malformed records had no runtime rejection path.
- `pnpm test tests/project-data.test.ts`: 18 tests passed after implementation.
- Coverage includes exact keys, required types, technology arrays, valid and invalid URLs, timestamps, statuses, deterministic sorting, non-featured home fallback, empty initial data, and absence of automatic project-data artifacts.
- Tests perform no network requests.

## Final verification

- `pnpm validate:public`: passed.
- `pnpm test`: 7 files and 51 tests passed.
- `pnpm check`: passed with 0 errors and 14 existing Zod deprecation hints.
- `pnpm build`: passed; 33 static pages built, including `/live-projects/`.
- `git diff --check`: passed.

## Concerns

No project page will appear until the owner supplies and approves a public URL. This is intentional. The remaining Astro hints are existing Zod deprecations unrelated to the manual catalog.
