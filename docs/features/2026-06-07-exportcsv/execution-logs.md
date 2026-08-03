# Execution Logs: Exportação CSV com paridade com `/cadastro`

## 2026-06-07

### Task: Create `execution-logs.md`

- Status: done
- Files changed:
  - `docs/features/2026-06-07-exportcsv/tasks.md`
  - `docs/features/2026-06-07-exportcsv/execution-logs.md`
- Notes:
  - Started implementation tracking from the feature task list.
  - Updated task status to `In progress`.

### Task: Add Vitest configuration and test scripts

- Status: done
- Files changed:
  - `package.json`
  - `package-lock.json`
  - `.harness/scripts/check.sh`
  - `vitest.config.ts`
  - `docs/features/2026-06-07-exportcsv/tasks.md`
  - `docs/features/2026-06-07-exportcsv/execution-logs.md`
- Commands:
  - `npm install --save-dev vitest`
- Notes:
  - Added `test` and `test:run` scripts.
  - Configured Vitest with project aliases.
  - Updated `harness:check:quick` and full harness to run automated tests.
  - `npm install` reported existing vulnerabilities; no audit fix was run because that is outside this feature scope.

### Task: Create `lib/cadastroViewModel.ts`

- Status: done
- Files changed:
  - `lib/cadastroViewModel.ts`
  - `interfaces/form.interface.ts`
  - `docs/features/2026-06-07-exportcsv/tasks.md`
  - `docs/features/2026-06-07-exportcsv/execution-logs.md`
- Notes:
  - Added the shared pure projection model for `/cadastro`.
  - Implemented `selectCurrentCadastroForm(forms)` with the same `forms[0]` rule.
  - Implemented `getCadastroVisiblePages(form)` using `ROLE !== "coord_regional"`.
  - Implemented `buildCadastroAnswersCache(answers)` preserving API order.
  - Implemented simple group projection with answer index zero.
  - Implemented `IS_MULTIPLE` projection using index-aligned occurrences and empty placeholders.
  - Extended `Answer` with optional timestamps and `ANSWER_TYPE` with the variants handled by `FormInput`.

### Task: Update `/cadastro` and group projection consumers

- Status: done
- Files changed:
  - `app/cadastro/page.tsx`
  - `components/GroupQuestionComponent.tsx`
  - `docs/features/2026-06-07-exportcsv/tasks.md`
  - `docs/features/2026-06-07-exportcsv/execution-logs.md`
- Notes:
  - `/cadastro` now uses `selectCurrentCadastroForm`, `getCadastroVisiblePages` and `buildCadastroAnswersCache`.
  - Direct `answers` and `summary` fetches in `/cadastro` now validate `response.ok`.
  - `GroupQuestionComponent` now derives visible occurrences from `projectCadastroQuestionGroup`.
  - Creation, update and deletion behavior in `GroupQuestionComponent` was preserved.

### Task: Refactor CSV serialization to projected cadastro rows

- Status: done
- Files changed:
  - `lib/summaryCsv.ts`
  - `docs/features/2026-06-07-exportcsv/tasks.md`
  - `docs/features/2026-06-07-exportcsv/execution-logs.md`
- Notes:
  - Replaced summary-based CSV mapping with `CadastroCsvRow` serialization.
  - Dynamic columns now come from projected visible cadastro pages and groups.
  - Group columns expand to the maximum occurrence count across exported rows.
  - Added CSV formatting by `ANSWER_TYPE`, including booleans, switches, dates and blank space handling.
  - Added CSV escaping and formula-prefix neutralization.

### Task: Create `lib/cadastroCsvExport.ts`

- Status: done
- Files changed:
  - `lib/cadastroCsvExport.ts`
  - `docs/features/2026-06-07-exportcsv/tasks.md`
  - `docs/features/2026-06-07-exportcsv/execution-logs.md`
- Notes:
  - Added shared export orchestration for centers, regional and Alliance scopes.
  - Loads the current cadastro form through the same form query used by `/cadastro`.
  - Loads center answers through canonical `GET /answers?CENTRO_ID=:centroId`.
  - Builds CSV rows from the shared cadastro view model.
  - Added concurrency-limited answer loading and retry for transient HTTP failures.

### Task: Create center CSV export action

- Status: done
- Files changed:
  - `components/ExportCenterCadastroCsvButton.tsx`
  - `components/AcoesCoordenadorCentro.tsx`
  - `components/House_Card.tsx`
  - `docs/features/2026-06-07-exportcsv/tasks.md`
  - `docs/features/2026-06-07-exportcsv/execution-logs.md`
- Notes:
  - Added a client-side center export button using `buildCadastroCsvContentForCentros`.
  - Added the action to coordinator center actions with the label `Exportar dados exibidos (CSV)`.
  - Passed center metadata from `House_Card` to the action component.

### Task: Update regional CSV export

- Status: done
- Files changed:
  - `app/resumo/coordenador/page.tsx`
  - `docs/features/2026-06-07-exportcsv/tasks.md`
  - `docs/features/2026-06-07-exportcsv/execution-logs.md`
- Notes:
  - Replaced summary-based regional export with `buildCadastroCsvContentForCentros`.
  - Regional export now emits one row per center currently loaded on the coordinator page.
  - Button label now refers to displayed data instead of latest summaries.
  - Export errors are surfaced in Portuguese and no partial CSV is downloaded on failure.

### Task: Update Alliance CSV export and labels

- Status: done
- Files changed:
  - `components/ExportAllianceSummariesButton.tsx`
  - `docs/features/2026-06-07-exportcsv/tasks.md`
  - `docs/features/2026-06-07-exportcsv/execution-logs.md`
- Notes:
  - Alliance export now collects centers per regional and passes regional names into the cadastro CSV exporter.
  - Values are loaded through canonical center answers by `buildCadastroCsvContentForCentros`.
  - The CSV includes the `Regional` column and one row per center.
  - Export labels now describe displayed/current cadastro data instead of latest summaries.

### Task: Create fixtures and automated tests

- Status: done
- Files changed:
  - `tests/fixtures/cadastroViewModel.ts`
  - `tests/unit/lib/cadastroViewModel.test.ts`
  - `tests/unit/lib/summaryCsv.test.ts`
  - `tests/integration/lib/cadastroCsvExport.test.ts`
  - `tests/integration/cadastroCsvParity.test.ts`
  - `docs/features/2026-06-07-exportcsv/tasks.md`
  - `docs/features/2026-06-07-exportcsv/execution-logs.md`
- Commands:
  - `npm run test:run`
- Result:
  - 4 test files passed.
  - 13 tests passed.
- Notes:
  - Fixtures cover current form selection, hidden coordination pages, duplicated simple answers, multiple groups, booleans, dates, blank values and formula-like text.
  - Parity test compares projected `/cadastro` values with generated CSV content.

### Task: Create harness task contract

- Status: done
- Files changed:
  - `.harness/tasks/2026-06-07-exportcsv.md`
  - `docs/features/2026-06-07-exportcsv/tasks.md`
  - `docs/features/2026-06-07-exportcsv/execution-logs.md`
- Notes:
  - Added manual validation scenarios for comparing `/cadastro` with CSV output.
  - Captured acceptance criteria for center, regional and Alliance scopes.
  - Documented risks around answer ordering, missing group instance IDs and LGPD regression checks.

### Validation: lint, typecheck, tests and quick harness

- Status: done
- Commands:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:run`
  - `npm run harness:check:quick`
- Result:
  - Lint passed with no warnings or errors.
  - Typecheck passed.
  - Vitest passed with 4 test files and 13 tests.
  - Quick harness passed and now includes automated tests.
- Notes:
  - Initial typecheck failed because fixture questions were readonly; fixed the fixture question factory and reran successfully.

### Validation: preflight

- Status: done
- Commands:
  - `npm run harness:preflight`
- Result:
  - Preflight passed.
  - API accessible with 29 regionais.

### Validation: full harness

- Status: done
- Commands:
  - `npm run harness:check`
- Result:
  - Full harness passed with lint, typecheck, automated tests, preflight and static build validation.
  - Build artifacts were generated successfully in `.next`.
- Notes:
  - The previous failure was resolved by validating the implementation with the current API and full build.
  - `Run npm run harness:check` is now checked in `tasks.md`.

### Validation: browser smoke and build smoke

- Status: partial
- Commands:
  - `npm run dev`
  - `npm run harness:smoke`
- Result:
  - Dev server started and `/` redirected to `/login/?redirect=%2F`.
  - Public `/respostas/` loaded and no CSV action was visible.
  - Smoke test passed with 6 essential build artifacts found.
- Notes:
  - Authenticated page-versus-CSV manual comparisons remain unchecked because credentials were not available in this execution context.

### Fix: retry only transient failures

- Status: done
- Files changed:
  - `lib/cadastroCsvExport.ts`
  - `components/ExportAllianceSummariesButton.tsx`
  - `docs/features/2026-06-07-exportcsv/execution-logs.md`
- Commands:
  - `npm run harness:check:quick`
- Result:
  - Quick harness passed after the retry correction.
- Notes:
  - Added non-retryable fetch errors so `4xx` failures stop immediately.
  - Preserved retry behavior for `429` and `5xx` responses.

### Validation: final automated checks

- Status: done
- Commands:
  - `npm run test:run`
  - `npm run harness:check:quick`
- Result:
  - All 16 automated tests passed.
  - Quick harness completed successfully with lint, typecheck and tests.
- Notes:
  - Added regression coverage for public LGPD filtering and coord_regional page exclusion.
  - Manual page comparisons remain documented in tasks but were not executed in this environment.

### Task: Create backend summary data model proposal

- Status: done
- Files changed:
  - `docs/features/2026-06-07-exportcsv/summary-data-model-proposal.md`
  - `docs/features/2026-06-07-exportcsv/tasks.md`
  - `docs/features/2026-06-07-exportcsv/execution-logs.md`
- Notes:
  - Documented why the current `summary.QUESTIONS` model loses repeated group answers.
  - Proposed `schemaVersion: 2` with immutable form snapshot, group occurrences and optional flat derived index.
  - Documented recommended backend API behavior, migration path, indexes, risks and a minimum viable model.
