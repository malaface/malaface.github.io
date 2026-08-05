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
- Added `/live-projects/`, linked it from the existing outcome-led home, and rendered selected records through `ProjectCard`.
- Reused `formatPublicDate` for project update dates.

## TDD evidence

Red checks observed before implementation:

- `pnpm test tests/project-data.test.ts` failed because `src/lib/projects.ts` was absent.
- The focused static-route test failed because `dist/live-projects/index.html` was absent.
- The explicit-opt-in regression failed while records without an `enabled` decision were still visible.

Green checks:

- `pnpm test tests/project-data.test.ts`: 6 tests passed.
- Network behavior is covered with injected `fetch` fixtures for success, headers, allowlist scope, normalized fields, token omission, upstream failure, safe activity, and manual-record preservation. No test used live GitHub.

## Final verification

Run from the Task 6 worktree:

- `pnpm validate:public`: passed.
- `pnpm test`: 7 files and 39 tests passed.
- `pnpm check`: passed with 0 errors and 16 existing Zod deprecation hints from `src/content.config.ts`.
- `pnpm build`: passed; 33 static pages built, including `/live-projects/`.
- Rendered-output assertions confirm both enabled GitHub URLs are present and both disabled candidate URLs are absent.

The live `GITHUB_TOKEN='' pnpm data:github` command was intentionally not used because it can contact GitHub anonymously. Its no-token/failure behavior is covered deterministically by the injected network fixture: no authorization header is sent and both manual project records are preserved.

## Self-review and concerns

- The generator rejects mismatched repository metadata and fork metadata, ignores API-provided URLs, and never includes preview deployment data or unsupported metadata.
- The page derives visibility from the allowlist at build time, so a stale record in `live-projects.json` cannot opt itself into rendering.
- No project, page, or generated artifact adds operational infrastructure, private-note, or sensitive metadata content.
- Remaining check output is limited to the pre-existing Zod deprecation hints noted above. No Task 6 error or warning remains.
