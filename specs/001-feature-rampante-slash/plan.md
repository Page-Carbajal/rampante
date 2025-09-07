# Implementation Plan: Rampante - Complete Spec Kit Automation System

**Branch**: `001-feature-rampante-slash` | **Date**: 2025-09-07 | **Spec**: /Users/dubois/Source/repos/ai/rampante/specs/001-feature-rampante-slash/spec.md
**Input**: Feature specification from `/specs/001-feature-rampante-slash/spec.md`

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

Create a comprehensive Spec Kit automation system that provides preview capabilities and streamlined workflow execution. The system includes: dry-run preview mode for /specify, /plan, /tasks commands; automated workflow execution; CLI-specific template generation and distribution; release workflow for multi-CLI deployment; and installation mechanism for AI CLIs (Gemini, Codex, Cursor, Claude Code). Built as a multi-component system with installer, template engine, and release automation.

## Technical Context

**Language/Version**: Deno + TypeScript (latest stable)
**Primary Dependencies**: Deno standard library (@std/path, @std/fs, @std/flags), GitHub Actions for release workflow
**Storage**: File system (CLI configs, templates, distribution packages)
**Testing**: Deno test (built-in testing framework)
**Target Platform**: Cross-platform CLI + GitHub-hosted release workflow + AI CLI environments
**Project Type**: single (integrated system with multiple components)
**Performance Goals**: Fast installation (<5s), dry-run preview (<2s), template generation (<1s per CLI)
**Constraints**: No external dependencies beyond Deno stdlib, must work offline after installation, template integrity validation
**Scale/Scope**: 4 AI CLIs initially, extensible to additional CLIs, global distribution via GitHub releases

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Simplicity**:

- Projects: 1 (integrated system with installer, templates, release workflow)
- Using framework directly: Yes (Deno std lib, GitHub Actions, no wrapper layers)
- Single data model: Yes (CLI configs, templates, packages - unified data model)
- Avoiding patterns: Yes (direct file operations, no Repository/UoW complexity)

**Architecture**:

- EVERY feature as library: Yes (installer lib, template lib, preview lib, CLI entry point)
- Libraries listed: installer (CLI detection/installation), templates (CLI-specific generation), preview (dry-run simulation), cli (main interface)
- CLI per library: Single integrated CLI with subcommands (install, preview, execute)
- Library docs: Yes, llms.txt format for AI CLI integration documentation

**Testing (NON-NEGOTIABLE)**:

- RED-GREEN-Refactor cycle enforced: Yes (tests written before implementation)
- Git commits show tests before implementation: Required
- Order: Contract→Integration→Unit (E2E via integration tests for CLI workflow)
- Real dependencies used: Yes (actual file system, real CLI directories, GitHub API)
- Integration tests for: CLI installation, template generation, workflow execution, release process
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:

- Structured logging included: Yes (installation progress, workflow steps, error context)
- Frontend logs → backend: N/A (CLI tool, single process)
- Error context sufficient: Yes (file paths, CLI types, command states, failure details)

**Versioning**:

- Version number assigned: 0.2.0 (MAJOR.MINOR.BUILD)
- BUILD increments on every change: Yes
- Breaking changes handled: Template versioning, backward compatibility for CLI configs

## Project Structure

### Documentation (this feature)

```
specs/001-feature-rampante-slash/
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

**Structure Decision**: DEFAULT (Option 1) - Single integrated project with multiple library components

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

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, agent-specific file

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
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
