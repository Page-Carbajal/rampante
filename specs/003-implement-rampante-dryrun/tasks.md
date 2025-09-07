# Tasks: Rampante Dry-Run Mode

**Input**: Design documents from `/specs/003-implement-rampante-dryrun/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
   → quickstart.md: Extract scenarios → integration tests
3. Generate tasks by category:
   → Setup: project scaffolding as-needed
   → Tests: contract tests, integration tests
   → Core: models, services, CLI command behavior
   → Integration: logging, guardrails, side-effect checks
   → Polish: unit tests, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness
```

## Phase 3.1: Setup

- [ ] T001 Ensure project structure for this feature exists (no-op scaffolding) - Create dirs if missing: `/Users/dubois/Source/repos/ai/rampante/tests/contract`, `/Users/dubois/Source/repos/ai/rampante/tests/integration`, `/Users/dubois/Source/repos/ai/rampante/tests/unit`, `/Users/dubois/Source/repos/ai/rampante/src/models`, `/Users/dubois/Source/repos/ai/rampante/src/services`, `/Users/dubois/Source/repos/ai/rampante/src/lib`. - Do not add dependencies; repo already configured for Deno.

## Phase 3.2: Tests First (TDD) — MUST FAIL BEFORE 3.3

- [ ] T002 [P] Contract test for dry-run CLI output in `/Users/dubois/Source/repos/ai/rampante/tests/contract/test_dryrun_cli_contract.ts` - Based on: `/Users/dubois/Source/repos/ai/rampante/specs/003-implement-rampante-dryrun/contracts/dryrun-cli-contract.md` - Assert: Markdown header "DRY RUN: /rampante"; sections for `/specify`, `/plan`, `/tasks`; fenced code blocks contain full prompts; exit code semantics.

- [ ] T003 [P] Integration test: `--dry-run` with prompt returns prompts and executes nothing in `/Users/dubois/Source/repos/ai/rampante/tests/integration/test_rampante_dryrun_basic.ts` - Scenario: `/rampante --dry-run Build a dark mode toggle` - Assert: Prompts generated for all downstream commands; no side effects recorded.

- [ ] T004 [P] Integration test: normal mode (no `--dry-run`) executes flow in `/Users/dubois/Source/repos/ai/rampante/tests/integration/test_rampante_normal_mode.ts` - Scenario: `/rampante Build a dark mode toggle` - Assert: Does not return dry-run Markdown; follows standard execution (stub or spy assertions as appropriate).

- [ ] T005 [P] Integration test: `--dry-run` with empty content returns empty list note in `/Users/dubois/Source/repos/ai/rampante/tests/integration/test_rampante_dryrun_empty.ts` - Scenario: `/rampante --dry-run` - Assert: Summary explains no downstream prompts produced; no execution.

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T006 [P] Define entities (types) for DryRunRequest and GeneratedPrompt in `/Users/dubois/Source/repos/ai/rampante/src/models/dryrun.ts` - Export interfaces: `DryRunRequest`, `GeneratedPrompt` per data-model.md

- [ ] T007 [P] Implement dry-run prompt builder service in `/Users/dubois/Source/repos/ai/rampante/src/services/dryrun_prompt_builder.ts` - Function: `buildDryRunPrompts(input: string): GeneratedPrompt[]` - Use research decisions (flag must be first token; no aliases; handle empty content)

- [ ] T008 Implement output formatter for dry-run in `/Users/dubois/Source/repos/ai/rampante/src/lib/dryrun_output.ts` - Function: `formatDryRunMarkdown(prompts: GeneratedPrompt[]): string` - Output structure exactly as contract specifies

- [ ] T009 Update Rampante command definition to support dry-run behavior in `/Users/dubois/Source/repos/ai/rampante/rampante/command/rampante.md` - Add explicit flow: if prompt starts with `--dry-run`, generate+return prompts for `/specify`, `/plan`, `/tasks` with no execution - Preserve existing behavior when flag absent

## Phase 3.4: Integration

- [ ] T010 Integrate logger notices for dry-run activation in `/Users/dubois/Source/repos/ai/rampante/src/lib/logger.ts` - Add helper: `logDryRunActivated(context)` and use where appropriate in dry-run path

- [ ] T011 Guard against side effects during dry-run across relevant code paths - Review any execution hooks; ensure dry-run path short-circuits execution and returns formatted output only

## Phase 3.5: Polish

- [ ] T012 [P] Unit tests for prompt builder and formatter in `/Users/dubois/Source/repos/ai/rampante/tests/unit/test_dryrun_libs.ts` - Cover: flag position, alias rejection, empty content, formatting structure

- [ ] T013 [P] Update README usage with `--dry-run` flag at `/Users/dubois/Source/repos/ai/rampante/README.md` - Add examples mirroring quickstart

- [ ] T014 Performance smoke test for prompt generation under 200ms in `/Users/dubois/Source/repos/ai/rampante/tests/unit/test_dryrun_perf.ts`

## Dependencies

- T002–T005 (tests) must be written and failing before T006–T009 (implementation)
- T006 (models) precedes T007 (service)
- T007 (service) precedes T008 (formatter) only for consumption wiring; files are independent and can be parallel if isolated
- T009 depends on T007–T008 to define the behavior referenced in docs
- T010–T011 after core implementation
- Polish (T012–T014) last

## Parallel Example

```
# Launch test phase in parallel:
Task: "Contract test for dry-run CLI output in /Users/dubois/Source/repos/ai/rampante/tests/contract/test_dryrun_cli_contract.ts"
Task: "Integration test: dry-run basic in /Users/dubois/Source/repos/ai/rampante/tests/integration/test_rampante_dryrun_basic.ts"
Task: "Integration test: normal mode in /Users/dubois/Source/repos/ai/rampante/tests/integration/test_rampante_normal_mode.ts"
Task: "Integration test: dry-run empty prompt in /Users/dubois/Source/repos/ai/rampante/tests/integration/test_rampante_dryrun_empty.ts"

# Launch core parallel tasks after tests are failing:
Task: "Define entities in /Users/dubois/Source/repos/ai/rampante/src/models/dryrun.ts"
Task: "Implement prompt builder in /Users/dubois/Source/repos/ai/rampante/src/services/dryrun_prompt_builder.ts"
```

## Validation Checklist

- [ ] Contract file has corresponding test (dryrun-cli-contract.md → T002)
- [ ] Entities have model tasks (DryRunRequest, GeneratedPrompt → T006)
- [ ] All tests precede implementation
- [ ] [P] tasks are independent files
- [ ] Each task specifies absolute file path
- [ ] No two [P] tasks modify the same file
