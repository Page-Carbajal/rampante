# Implementation Plan: Multi-CLI Rampant Slash Command (Phase 1: Codex)

**Branch**: `001-feature-phase-1` | **Date**: 2025-09-07 | **Spec**: /Users/dubois/Source/repos/ai/rampante/specs/001-feature-phase-1/spec.md
**Input**: Feature specification from `/specs/001-feature-phase-1/spec.md`

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
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
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

Provide a Deno-invoked installer command `deno run npm:run-rampant install <cli>` (Phase 1 implements `<cli>=codex`) that:

- Configures context7 in the CLI’s config (Codex: `~/.codex/config.toml`).
- Installs `/recommended-stacks` with `DEFINITIONS.md` and initial stack files into the current directory.
- Installs and registers the unified slash command `/rampant` for the target CLI (Codex: copy `/rampant-command/rampant.md` to `~/.codex/prompts`).

Then running `/rampant "<main prompt>"` executes the end-to-end Spec Kit workflow: infer project type, select stack via YOLO strategy from definitions, fetch latest docs for the selected stack via context7 MCP, run `/specify`, `/plan`, `/tasks`, and write `specs/PROJECT-OVERVIEW.md` (always overwrite). Phase 2 will prioritize support for Claude Code and Gemini.

Priority execution order (TDD-aligned)

1. Create `/rampant-command/rampant.md` (Codex slash command file) first, so contract tests can run immediately against a concrete artifact.
2. Create `/recommended-stacks` with `DEFINITIONS.md` and initial stack files next, enabling stack selection tests and planning.
3. Implement the Deno installer CLI (`deno run npm:run-rampant install <cli>`, Phase 1: `codex`) last, wiring config, idempotency, and registration.

## Technical Context

**Language/Version**: Deno v2.4 (required)
**Primary Dependencies**: context7 MCP via `npx @upstash/context7-mcp`, file system operations, CLI environment (Codex in Phase 1)
**Storage**: Files in current directory (`/recommended-stacks`, `/rampant-command`) and user config at `~/.codex/config.toml`
**Testing**: CLI contract/integration tests (shell-based), idempotency checks; no backend services
**Target Platform**: Developer machines (macOS/Linux; Windows WSL acceptable)
**Project Type**: single (CLI + files)
**Performance Goals**: Fast local setup (<5s typical), minimal overhead
**Constraints**: Fail hard if context7 unavailable; always overwrite `specs/PROJECT-OVERVIEW.md`; re-runs are idempotent; `--force` drops/recreates installed assets
**Scale/Scope**: Single-user CLI setup; small file tree

User-provided details ($ARGUMENTS):

- Entry command: `deno run npm:run-rampant install <cli>`; Phase 1 supports `codex`.
- Register `/rampant` for Codex at `~/.codex/prompts` by copying `/rampant-command/rampant.md`.
- context7 config block to add to `~/.codex/config.toml` and create file if missing.
- YOLO stack selection, deterministic tie-break; install `/recommended-stacks` in CWD.
- Overwrite policy: always overwrite `specs/PROJECT-OVERVIEW.md`; idempotent re-runs; `--force` option.
- Phase 2 priorities: add `claude-code` and `gemini` targets.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Simplicity**:

- Projects: 2 (cli, tests) — within limit
- Using runtime directly (Deno + npx), no wrappers
- Single data model (entities in docs only), no DTOs
- Avoiding heavy patterns (simple file ops; no frameworks)

**Architecture**:

- Feature packaged as a CLI utility with minimal library code
- Libraries: installer (sets up config/assets), runner template (rampant.md content)
- CLI entry: `deno run npm:run-rampant install <cli>`; `/rampant` as user-facing command
- Documentation: spec + plan + quickstart; llms.txt not required for Phase 1

**Testing (NON-NEGOTIABLE)**:

- RED-GREEN-Refactor: plan to author failing CLI contract tests first
- Order: Contract → Integration → (no backend/E2E) → Unit (helpers)
- Real environment: filesystem writes in temp dirs; simulate missing config; idempotency checks
- FORBIDDEN: skipping RED phase or backfilling tests

**Observability**:

- Clear CLI stdout/stderr messages; non-zero exit on failures
- Error messages include actionable remediation (install Deno, create config)

**Versioning**:

- Initial version 0.1.0 for installer; SemVer planned
- No breaking changes in Phase 1; `--force` as explicit destructive option

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 1 (single project)

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:

- One test file per endpoint
- Assert request/response schemas
- Tests must fail (no implementation yet)
- Include CLI contract tests asserting existence and shape of `/rampant-command/rampant.md` (Priority #1)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/update-agent-context.sh [claude|gemini|copilot]` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests (plan-level), quickstart.md, and a concrete command template file to be created first during implementation: `/rampant-command/rampant.md`

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)
- Priority order for this feature:
  1.  Create `/rampant-command/rampant.md` (Codex command file) and its contract tests
  2.  Create `/recommended-stacks` with `DEFINITIONS.md` and initial stack files (+ tests)
  3.  Implement the Deno installer CLI with idempotency and `--force` (+ contract/integration tests)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
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
