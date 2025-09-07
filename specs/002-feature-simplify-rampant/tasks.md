# Tasks: Simplify slash command by removing stack selection

**Input**: Design documents from `/specs/002-feature-simplify-rampant/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → Extract: tech stack, libraries, structure (single project; Deno)
2. Load optional design documents:
   → data-model.md: No new entities (skip model tasks)
   → contracts/: Each file → contract test task (slash-command-contract.md)
   → research.md: Backup strategy, simplified phases → setup + core tasks
   → quickstart.md: Verification steps → integration test tasks
3. Generate tasks by category
4. Apply rules: tests before implementation (TDD); [P] for different files
5. Number tasks sequentially (T001, T002...)
6. Define dependencies and parallel examples
```

## Phase 3.1: Setup

- [x] T001 Confirm branch and environment
  - Ensure current branch is `feature/002-feature-simplify-rampant`.
  - Command: `git rev-parse --abbrev-ref HEAD`
- [x] T002 Create simplified command template
  - Add template file with target content for the orchestrator without stack selection.
  - Path: `/Users/dubois/Source/repos/ai/rampante/templates/rampante-command-simplified.md`
- [x] T003 [P] Scaffold updater script (no logic yet)
  - Create Deno CLI script entry that will handle backup + rewrite.
  - Path: `/Users/dubois/Source/repos/ai/rampante/src/cli/update-rampante-command.ts`
  - Command: `deno run --allow-read --allow-write /Users/dubois/Source/repos/ai/rampante/src/cli/update-rampante-command.ts --help`
- [x] T004 [P] Add npm/deno script alias for updater
  - Update `/Users/dubois/Source/repos/ai/rampante/deno.json` with task alias `update:command` → `deno run --allow-read --allow-write src/cli/update-rampante-command.ts`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

- [x] T005 [P] Contract test: creates timestamped backup before modification
  - File: `/Users/dubois/Source/repos/ai/rampante/tests/contract/test_rampante_command_contract.ts`
  - Verifies backup `rampante/command/rampante.<epoch>.md` exists when original exists; uses temporary workspace.
  - Command: `deno test --allow-all /Users/dubois/Source/repos/ai/rampante/tests/contract/test_rampante_command_contract.ts`
- [x] T006 [P] Contract test: no reference to scripts/select-stack.sh in new file
  - File: `/Users/dubois/Source/repos/ai/rampante/tests/contract/test_no_stack_selection_reference.ts`
  - Asserts updated `/Users/dubois/Source/repos/ai/rampante/rampante/command/rampante.md` has no `select-stack.sh` string.
- [x] T007 [P] Integration test: simplified phases present; selection phases absent
  - File: `/Users/dubois/Source/repos/ai/rampante/tests/integration/test_rampante_command_update.ts`
  - Asserts presence of: Specification Generation, Implementation Planning, Task Generation, Project Overview; absence of Phase 1: Stack Selection and Validation.
- [x] T008 [P] Integration test: unique backup names on same-second updates
  - File: `/Users/dubois/Source/repos/ai/rampante/tests/integration/test_backup_name_uniqueness.ts`
  - Calls updater twice within same second; expects `...<epoch>.md` and `...<epoch>-1.md`.

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T009 Implement backup utility
  - Function to create `/Users/dubois/Source/repos/ai/rampante/rampante/command/rampante.<epoch>.md` from existing file; add `-N` suffix on collision.
  - File: `/Users/dubois/Source/repos/ai/rampante/src/cli/update-rampante-command.ts`
- [ ] T010 Implement simplified content generator
  - Read template `/Users/dubois/Source/repos/ai/rampante/templates/rampante-command-simplified.md` and render with any necessary variables.
  - File: `/Users/dubois/Source/repos/ai/rampante/src/cli/update-rampante-command.ts`
- [ ] T011 Wire updater CLI
  - Ensure `deno run --allow-read --allow-write src/cli/update-rampante-command.ts` performs: backup → write new content → log summary.
  - File: `/Users/dubois/Source/repos/ai/rampante/src/cli/update-rampante-command.ts`
- [ ] T012 Replace orchestrator file with simplified content
  - Overwrite `/Users/dubois/Source/repos/ai/rampante/rampante/command/rampante.md` using the generator.
  - Ensure no `select-stack.sh` references remain.
- [ ] T013 Update quickstart and plan references if needed
  - Adjust any docs pointing to removed phases.
  - Files: `/Users/dubois/Source/repos/ai/rampante/specs/002-feature-simplify-rampant/quickstart.md`, project README as needed.

## Phase 3.4: Integration

- [ ] T014 Validate updater idempotency
  - Running updater repeatedly should not reintroduce removed phases; backups created per run.
  - File: `/Users/dubois/Source/repos/ai/rampante/tests/integration/test_rampante_command_update.ts`
- [ ] T015 Ensure CI scripts use simplified flow
  - If any CI/docs refer to stack selection, update them.
  - Files: search repo for `select-stack.sh` and update references.
  - Command: `rg -n "select-stack.sh" /Users/dubois/Source/repos/ai/rampante`

## Phase 3.5: Polish

- [ ] T016 [P] Unit tests: backup utility edge cases
  - File: `/Users/dubois/Source/repos/ai/rampante/tests/unit/test_backup_utility.ts`
  - Cases: missing original file, permission error handling, collision suffixing.
- [ ] T017 [P] Unit tests: content generator
  - File: `/Users/dubois/Source/repos/ai/rampante/tests/unit/test_content_generator.ts`
  - Asserts target headings present; no forbidden strings.
- [ ] T018 [P] Documentation updates
  - Update `/Users/dubois/Source/repos/ai/rampante/README.md` to describe simplified orchestrator flow and updater command.
- [ ] T019 Cleanup
  - Remove any leftover references to stack selection in docs/examples.

## Dependencies

- Setup (T001–T004) before Tests
- Tests (T005–T008) before Core (T009–T013)
- T009 before T011–T012
- T010 before T011–T012
- Core before Integration (T014–T015)
- Everything before Polish (T016–T019)

## Parallel Example

```
# Launch T005–T008 together (different files):
Task: "deno test --allow-all /Users/dubois/Source/repos/ai/rampante/tests/contract/test_rampante_command_contract.ts"
Task: "deno test --allow-all /Users/dubois/Source/repos/ai/rampante/tests/contract/test_no_stack_selection_reference.ts"
Task: "deno test --allow-all /Users/dubois/Source/repos/ai/rampante/tests/integration/test_rampante_command_update.ts"
Task: "deno test --allow-all /Users/dubois/Source/repos/ai/rampante/tests/integration/test_backup_name_uniqueness.ts"
```

## Validation Checklist

- [ ] Contract file has corresponding tests (slash-command-contract.md → T005, T006)
- [ ] No entities → no model tasks (OK)
- [ ] All tests come before implementation (OK)
- [ ] Parallel tasks target different files (OK)
- [ ] Each task specifies exact file path (OK)
- [ ] No [P] tasks modify the same file
