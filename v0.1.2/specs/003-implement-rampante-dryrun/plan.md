# Implementation Plan: Rampante Dry-Run Mode

**Branch**: `003-implement-rampante-dryrun` | **Date**: 2025-09-07 | **Spec**: /Users/dubois/Source/repos/ai/rampante/specs/003-implement-rampante-dryrun/spec.md
**Input**: Feature specification from `/specs/003-implement-rampante-dryrun/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: Resolve by recording assumptions and scope limits
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (if applicable)
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Add a dry-run mode for the `/rampante` command that, when the user’s prompt begins with `--dry-run`, generates and returns the exact prompts that would be sent to each downstream command (`/specify`, `/plan`, `/tasks`, and any involved sub-commands) without executing them. Normal behavior is unchanged when the flag is absent.

## Technical Context

**Language/Version**: Deno + TypeScript (existing project)
**Primary Dependencies**: Built-in Deno APIs; existing Rampante CLI/services
**Storage**: N/A
**Testing**: Deno test (existing convention)
**Target Platform**: Local CLI (macOS/Linux/WSL)
**Project Type**: single (CLI + libraries)
**Performance Goals**: Immediate output (<200ms processing overhead vs. normal parse)
**Constraints**: No side effects in dry-run; output must clearly indicate target command per prompt
**Scale/Scope**: Single-command flag behavior; limited to `/rampante` in v1

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Simplicity**:

- Projects: 1 (cli+lib) within existing repo structure
- Using framework directly: Yes (no wrappers)
- Single data model: Yes (DryRunRequest/GeneratedPrompt only)
- Avoiding patterns: Yes (no repositories/UoW introduced)

**Architecture**:

- Feature behind CLI behavior; no new library boundaries
- Libraries listed: N/A (reusing existing CLI utilities)
- CLI per library: N/A for new libs; existing CLI remains
- Library docs: Not applicable for this change

**Testing (NON-NEGOTIABLE)**:

- RED-GREEN-Refactor acknowledged; contract/integration tests planned before impl
- Order: Contract → Integration → Unit
- Real dependencies: CLI execution contexts; no external services

**Observability**:

- Structured logs via existing logger if applicable
- Error context sufficient for invalid inputs

**Versioning**:

- No breaking changes; feature-flagged by `--dry-run`
- BUILD increment will be handled in release process

## Project Structure

### Documentation (this feature)

```
specs/003-implement-rampante-dryrun/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
src/
├── cli/
├── lib/
├── services/
└── models/

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: DEFAULT to single-project; no web/mobile split required

## Phase 0: Outline & Research

1. Extract unknowns from Technical Context/spec:
   - Flag position: must it be first token? Decision in research.
   - Synonyms: support `--dryrun`/`-n`? Decision in research.
   - Behavior if no subcommands resolved: define expected output.
   - Handling long prompts: formatting and readability.
   - Interaction with other flags: precedence and parsing.
2. Generate and dispatch research tasks (documented in research.md) and consolidate findings as Decisions with Rationale and Alternatives.

**Output**: research.md with all open questions resolved by v1 decisions

## Phase 1: Design & Contracts

1. Extract entities from feature spec → data-model.md (DryRunRequest, GeneratedPrompt).
2. Generate CLI contract → contracts/dryrun-cli-contract.md describing inputs/outputs and examples.
3. Generate contract tests outline (to be implemented): expected outputs per scenario.
4. Extract test scenarios for integration testing → quickstart steps and scenarios.
5. Update agent file incrementally if needed (no changes anticipated).

**Output**: data-model.md, contracts/dryrun-cli-contract.md, quickstart.md

## Phase 2: Task Planning Approach

This /plan only describes the approach. The /tasks command will enumerate tasks from the contracts, data model, and quickstart.

**Task Generation Strategy**:

- Use `/templates/tasks-template.md` as base
- Each contract scenario → contract test task [P]
- Each entity → model definition and unit test task [P]
- Each acceptance scenario → integration test task
- Implementation tasks to make tests pass, then refactor

**Ordering Strategy**:

- TDD: write failing contract/integration tests before implementation
- Dependencies: parsing helpers → CLI flag handling → output formatting
- Mark [P] items that touch independent files

**Estimated Output**: 12-18 tasks in tasks.md

## Phase 3+: Future Implementation

Out of scope for /plan.

## Complexity Tracking

None required; no constitution deviations.

## Progress Tracking

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
