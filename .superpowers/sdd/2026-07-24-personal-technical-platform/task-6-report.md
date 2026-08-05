# Task 6 Report: Selected projects and safe GitHub data

## Status

Complete.

## Implemented

- Added the exact four-record project allowlist from the brief. Only `malaface/malaface.github.io` and `malaface/t-ethos` are enabled; both disabled candidates remain editorial candidates only.
- Added safe manual `live-projects.json` records for the two enabled repositories and an initially empty `activity.json`.
- Added the shared `ProjectRecord` contract and `getVisibleProjects`, which now requires `enabled: true`, strips the selection flag, and orders featured records before update-date order.
- Added an injectable GitHub generator that requests repository and language metadata only for enabled records. Its output is limited to the `ProjectRecord` fields.
- Kept repository URLs canonical to the explicitly selected repository and production URLs limited to manual allowlist values or previously generated values. GitHub response URLs are not published.
- Preserved prior manual records, including production URLs, when either GitHub request fails. Failure activity contains only repository, safe status, and check time.
- Separated transient connector failures from publication-policy rejection. A confirmed fork, an unconfirmed/non-false fork state, a repository identity mismatch, or malformed selected identity is omitted even when stale manual data exists; a safe `metadata-rejected` activity item is retained instead.
- Added `/live-projects/`, linked it from the existing outcome-led home, and rendered selected records through `ProjectCard`.
- Reused `formatPublicDate` for project update dates.

## TDD evidence

Red checks observed before implementation:

- `pnpm test tests/project-data.test.ts` failed because `src/lib/projects.ts` was absent.
- The focused static-route test failed because `dist/live-projects/index.html` was absent.
- The explicit-opt-in regression failed while records without an `enabled` decision were still visible.
- Fix round 1 fixtures reproduced stale-record restoration for `fork: true`, missing fork state, and mismatched repository identity before the policy-rejection path was added. The HTTP 503 fixture continued to preserve the manual production record.

Green checks:

- `pnpm test tests/project-data.test.ts`: 9 tests passed.
- Network behavior is covered with injected `fetch` fixtures for success, headers, allowlist scope, normalized fields, token omission, upstream failure, safe activity, and manual-record preservation. No test used live GitHub.

## Final verification

Run from the Task 6 worktree:

- `pnpm validate:public`: passed.
- `pnpm test`: 7 files and 42 tests passed.
- `pnpm check`: passed with 0 errors and 16 existing Zod deprecation hints from `src/content.config.ts`.
- `pnpm build`: passed; 33 static pages built, including `/live-projects/`.
- Rendered-output assertions confirm both enabled GitHub URLs are present and both disabled candidate URLs are absent.

The live `GITHUB_TOKEN='' pnpm data:github` command was intentionally not used because it can contact GitHub anonymously. Its no-token/failure behavior is covered deterministically by the injected network fixture: no authorization header is sent and both manual project records are preserved.

## Self-review and concerns

- The generator accepts only an exact selected repository identity with `fork === false`; rejected metadata cannot restore an existing project. It ignores API-provided URLs and never includes preview deployment data or unsupported metadata.
- The page derives visibility from the allowlist at build time, so a stale record in `live-projects.json` cannot opt itself into rendering.
- No project, page, or generated artifact adds operational infrastructure, private-note, or sensitive metadata content.
- Remaining check output is limited to the pre-existing Zod deprecation hints noted above. No Task 6 error or warning remains.

---

## Human-authoritative scope replacement — manual page catalog

This section supersedes the earlier GitHub-integration implementation and findings recorded above. The prior connector design was removed rather than shipped as the final Task 6 behavior.

### Final implementation

- `src/data/live-projects.json` is `[]` because the owner has not supplied any approved public project-page URL.
- `ProjectRecord` now has exactly `id`, `name`, `description`, `technologies`, `productionUrl`, `status`, `updatedAt` and `featured`.
- `ProjectCard` links only to the manually supplied `productionUrl`; it has no source-code or repository action.
- Inicio and `/live-projects/` show the honest empty state `Aún no hay páginas de proyectos aprobadas para mostrar.`
- Inicio continues to render `ActivityFeed` from recent public editorial entries.
- The project allowlist, generated activity file and external metadata generator were deleted. The package has no project-data commands, and the content schema no longer exposes `githubRepo`.
- The design and implementation plan now define Live Projects as a manual page-only catalog. Task 7 is marked superseded and removed; later CI and maintenance tasks prohibit discovery/enrichment and describe manual page addition only.
- The generic public profile link remains scoped to `/contacto/`.

### Replacement TDD evidence

The new tests failed first because the old two project records, sorting contract, connector artifact and rendered project card were still present. After the replacement:

- `pnpm test tests/project-data.test.ts`: 4 tests passed.
- The focused built-page test passed for both empty states, absence of project repository links and continued article activity.
- Tests perform no network requests.

### Final verification after replacement

- `pnpm validate:public`: passed.
- `pnpm test`: 7 files and 37 tests passed.
- `pnpm check`: passed with 0 errors and 14 pre-existing Zod deprecation hints.
- `pnpm build`: passed; 33 static pages built, including the empty `/live-projects/` page.
- `git diff --check`: passed.

### Concerns

No project page is shown until the owner supplies and approves a public URL. This is intentional. The remaining Astro check output consists only of existing Zod deprecation hints unrelated to the manual catalog.
