# Tasks: Multi-CLI Rampante Slash Command (Phase 1: Codex)

**Input**: Design documents from `/specs/001-feature-phase-1/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → Extract: tech stack (Deno v2.4), libraries, structure (single project)
2. Load optional design documents:
   → data-model.md: Extract entities → model/service tasks
   → contracts/: Each file → contract test tasks
   → research.md: Decisions → setup/idempotency tasks
   → quickstart.md: Scenarios → integration tests
3. Generate tasks by category (Setup → Tests → Core → Integration → Polish)
4. Apply task rules (TDD, [P] for different files)
5. Number tasks sequentially (T001, T002...)
6. Provide parallel execution examples
7. Validate completeness (gate checks at bottom)
```

## Phase 3.1: Setup

- [x] T001 Create project directories at `/Users/dubois/Source/repos/ai/rampante`:
      `src/cli`, `src/services`, `src/lib`, `tests/contract`, `tests/integration`, `tests/unit`, `rampante/command`, `recommended-stacks`.
- [x] T002 Create minimal Deno config `/Users/dubois/Source/repos/ai/rampante/deno.json` with permissions and fmt/lint settings.
- [x] T003 [P] Add `.gitignore` entries for `tmp/`, `.DS_Store`, and transient test artifacts.

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

Contract tests (from contracts/cli-contracts.md)

- [x] T004 [P] Create contract test for installer at `/Users/dubois/Source/repos/ai/rampante/tests/contract/test_installer.ts`: - Verifies creation of `/Users/dubois/Source/repos/ai/rampante/rampante/command/rampante.md` and `/Users/dubois/Source/repos/ai/rampante/recommended-stacks/DEFINITIONS.md` in CWD. - Verifies idempotent re-run (no duplicates) and `--force` recreation. - Verifies Codex registration copies to `~/.codex/prompts/rampante.md` (simulate home in temp).
- [x] T005 [P] Create contract test for runner at `/Users/dubois/Source/repos/ai/rampante/tests/contract/test_rampante_runner.ts`: - Asserts `/rampante` produces `specs/PROJECT-OVERVIEW.md` and uses YOLO stack selection. - Asserts fail-hard when context7 unavailable (invalid API key) with clear message.

Integration tests (from quickstart scenarios)

- [x] T006 [P] Integration test: first-run install in temp dir at `/Users/dubois/Source/repos/ai/rampante/tests/integration/test_first_run.ts`.
- [x] T007 [P] Integration test: idempotent re-run and `--force` at `/Users/dubois/Source/repos/ai/rampante/tests/integration/test_idempotency.ts`.
- [x] T008 [P] Integration test: rampante workflow happy path at `/Users/dubois/Source/repos/ai/rampante/tests/integration/test_rampante_flow.ts`.

Unit tests (for libs/services planned below)

- [x] T009 [P] Unit tests for fs/path utilities at `/Users/dubois/Source/repos/ai/rampante/tests/unit/test_fs_utils.ts`.
- [x] T010 [P] Unit tests for context7 config writer at `/Users/dubois/Source/repos/ai/rampante/tests/unit/test_context7_config.ts`.

## Phase 3.3: Core Implementation (ONLY after tests are failing)

Priority Order (per plan Summary)

- [x] T011 Create Codex command file at `/Users/dubois/Source/repos/ai/rampante/rampante/command/rampante.md` with the `/rampante` workflow: select stack (from DEFINITIONS.md), fetch context7 docs, run `/specify`, `/plan`, `/tasks`, generate `specs/PROJECT-OVERVIEW.md`.
- [x] T012 Create stacks directory and seed definitions at `/Users/dubois/Source/repos/ai/rampante/recommended-stacks/DEFINITIONS.md` and initial stack spec(s), e.g., `/Users/dubois/Source/repos/ai/rampante/recommended-stacks/SIMPLE_WEB_APP.md`.
- [ ] T013 Implement Deno installer CLI entry at `/Users/dubois/Source/repos/ai/rampante/src/cli/install.ts` handling:
      `deno run npm:run-rampante install <cli>` (Phase 1 supports `codex`).

Services and Libraries

- [ ] T014 [P] Implement context7 configuration writer at `/Users/dubois/Source/repos/ai/rampante/src/services/context7_config.ts` (create `~/.codex/config.toml` if missing; add mcp_servers.context7).
- [ ] T015 [P] Implement assets installer at `/Users/dubois/Source/repos/ai/rampante/src/services/install_assets.ts` (write rampante.md, definitions, initial stacks; idempotent + `--force`).
- [ ] T016 [P] Implement Codex registration at `/Users/dubois/Source/repos/ai/rampante/src/services/register_rampante.ts` (copy rampante.md to `~/.codex/prompts/rampante.md`).
- [ ] T017 [P] Implement stack selection helper at `/Users/dubois/Source/repos/ai/rampante/src/lib/stack_selection.ts` (YOLO + deterministic tie-break by order).
- [ ] T018 [P] Implement fs/path utility helpers at `/Users/dubois/Source/repos/ai/rampante/src/lib/fs_utils.ts` (expand `~`, ensure dirs, safe write, copy, remove).

## Phase 3.4: Integration

- [ ] T019 Wire installer CLI to services in `/Users/dubois/Source/repos/ai/rampante/src/cli/install.ts` (supports `--force`).
- [ ] T020 Logging and error handling policy across services (clear messages, non-zero exit codes).
- [ ] T021 Validate runner behavior notes inside `/Users/dubois/Source/repos/ai/rampante/rampante/command/rampante.md` (document phases, outputs).

## Phase 3.5: Polish

- [ ] T022 [P] Unit tests for stack_selection and register_rampante at `/Users/dubois/Source/repos/ai/rampante/tests/unit/test_stack_and_register.ts`.
- [ ] T023 [P] Update `/Users/dubois/Source/repos/ai/rampante/specs/001-feature-phase-1/quickstart.md` with any CLI flags (e.g., `--force`).
- [ ] T024 [P] Add README section for `deno run npm:run-rampante install codex` usage at `/Users/dubois/Source/repos/ai/rampante/README.md`.

## Dependencies

- Setup (T001–T003) before tests and implementation
- Contract/Integration/Unit tests (T004–T010) must be authored and FAIL before implementation
- T011 (rampante.md) before T012 (stacks) is allowed, but both must exist before T013 passes tests
- Models/Libs (T017–T018) before Services (T014–T016) wiring in CLI (T019)
- Core before Integration (T020–T021) and Polish (T022–T024)

## Parallel Execution Examples

```
# Launch contract and integration tests together once created:
Task: "Create contract test installer in tests/contract/test_installer.ts"  # [P]
Task: "Create contract test runner in tests/contract/test_rampante_runner.ts" # [P]
Task: "Integration test first-run in tests/integration/test_first_run.ts"     # [P]
Task: "Integration test idempotency in tests/integration/test_idempotency.ts" # [P]
```

## Validation Checklist

- [ ] All contracts have corresponding tests (installer, runner)
- [ ] All entities have model/service tasks (CLI Target, Stack Definition, Selected Stack, Documentation Source, Install Assets)
- [ ] All tests come before implementation (TDD)
- [ ] Parallel tasks touch different files
- [ ] Each task specifies exact file path (absolute)
- [ ] No [P] tasks modify the same file
ile
