# Tasks: Exportação CSV com paridade com `/cadastro`

## Status

Automated complete

## Implementation tasks

- [x] Create `execution-logs.md`
- [x] Add Vitest configuration and test scripts
- [x] Create synthetic fixtures for cadastro forms, centers, answers and projected CSV rows
- [x] Create `lib/cadastroViewModel.ts`
- [x] Implement current cadastro form selection using the same `/cadastro` rule
- [x] Implement visible page filtering with `ROLE !== "coord_regional"`
- [x] Implement cadastro answers cache preserving API order
- [x] Implement group projection for simple groups using answer index zero
- [x] Implement group projection for `IS_MULTIPLE` groups using index-aligned occurrences
- [x] Implement CSV value formatting by `ANSWER_TYPE`
- [x] Update `app/cadastro/page.tsx` to use the shared view model without changing UI behavior
- [x] Update `components/GroupQuestionComponent.tsx` to use the shared group projection
- [x] Refactor `lib/summaryCsv.ts` to serialize projected cadastro rows instead of summaries
- [x] Create `lib/cadastroCsvExport.ts`
- [x] Implement canonical answer loading with `GET /answers?CENTRO_ID=:centroId`
- [x] Implement concurrency-limited center answer loading for regional and Alliance exports
- [x] Create `components/ExportCenterCadastroCsvButton.tsx`
- [x] Add center CSV export action to coordinator center actions
- [x] Update regional CSV export to produce one row per center from the cadastro view model
- [x] Update Alliance CSV export to produce one row per center and include `Regional`
- [x] Update export labels and messages to describe displayed/current cadastro data
- [x] Create unit tests for cadastro view model selection, cache and projections
- [x] Create unit tests for CSV formatting and escaping
- [x] Create integration tests for center, regional and Alliance exports
- [x] Create parity tests comparing projected `/cadastro` values with CSV cells
- [x] Create harness task contract for manual page-versus-CSV validation

## Validation tasks

- [x] Run lint
- [x] Run typecheck
- [x] Run unit tests
- [x] Run integration tests
- [x] Run parity tests
- [x] Run `npm run harness:check:quick`
- [x] Run `npm run harness:preflight`
- [x] Run `npm run harness:check`
- [ ] Manually compare `/cadastro?centroId=:id` with center CSV export
- [ ] Manually compare regional `/resumo/coordenador` CSV export with opened center cadastro pages
- [ ] Manually compare Alliance `/resumo/alianca` CSV export across at least two regionals
- [ ] Validate groups with zero, one and multiple occurrences
- [ ] Validate simple groups with duplicated answers use the first displayed answer
- [ ] Validate pages with `ROLE === "coord_regional"` are not exported
- [ ] Validate public `/respostas` LGPD behavior is unchanged

## Out of scope

- Fixing `summary.QUESTIONS` snapshot persistence
- Exporting historical summaries
- Using `summary.FORM_ID` to choose CSV structure
- Sorting answers by timestamp
- Adding aliases that `/cadastro` does not use
- Changing backend schemas or endpoints
- Adding `GROUP_INSTANCE_ID`
- Public CSV export
- XLSX export
- Server-side CSV generation
- Changing authorization rules
- Changing LGPD filters
