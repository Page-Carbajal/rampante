# AI Agent Orchestrator: Spec-Driven Development (Simplified)

Run the Spec-Driven Development workflow from a single prompt via slash command `/rampante.md`.

This simplified orchestrator removes stack selection and live documentation retrieval. It focuses on generating a spec, creating a plan, drafting tasks (delegated), and building a project overview.

## Prerequisites Check

- The `/scripts` folder MUST exist in the current directory

If missing:
```
ERROR: Missing required directory
- /scripts directory: [EXISTS/MISSING]
Cannot proceed without required project structure.
```

EXIT PROCESS IMMEDIATELY

## Workflow Execution

Given the main prompt provided as an argument, execute deterministically without user interaction through the following phases:

## Phase 1: Specification Generation

Purpose: Generate a detailed feature specification using the Spec Kit `/specify` behavior.

Process:
- Run: `scripts/create-new-feature.sh --json "$ARGUMENTS"`
- Parse JSON: `BRANCH_NAME`, `SPEC_FILE`, `FEATURE_NUM`
- Load `templates/spec-template.md` and write the completed specification to `SPEC_FILE` using the user prompt
- Follow the template's execution flow; fill mandatory sections; mark ambiguities as [NEEDS CLARIFICATION] instead of guessing

Expected Outputs:
- Feature branch created (if not exists)
- Complete `spec.md` file in feature directory
- Feature specification with all mandatory sections filled

## Phase 2: Implementation Planning

Purpose: Generate an implementation plan using the Spec Kit `/plan` behavior.

Process:
- Run: `scripts/setup-plan.sh --json`
- Parse JSON: `FEATURE_SPEC`, `IMPL_PLAN`, `SPECS_DIR`, `BRANCH`
- Load `templates/plan-template.md` (already copied to `IMPL_PLAN`)
- Execute steps 1–8 per the template
- Ensure Phase 0–1 artifacts are generated in `SPECS_DIR` without errors

Expected Outputs:
- Complete `plan.md` file with technical context
- Research artifacts (`research.md`)
- Data model documentation (`data-model.md`) if relevant
- Contracts (in `contracts/` directory) if relevant
- Quickstart guide (`quickstart.md`)

## Phase 3: Task Generation (Delegated)

Purpose: Generate a detailed, ordered task list using the Spec Kit `/tasks` behavior.

Process:
- Run: `scripts/check-task-prerequisites.sh --json`
- Parse JSON: `FEATURE_DIR`, `AVAILABLE_DOCS`
- Generate `tasks.md` using `/templates/tasks-template.md`, reading available design docs
- Ensure tasks are specific, ordered with dependencies, and parallelizable where safe

Expected Outputs:
- Complete `tasks.md` file with numbered tasks
- Tasks marked with [P] for parallel execution
- Clear dependency ordering (TDD: tests before implementation)

## Phase 4: Project Overview Generation

Purpose: Create a project overview document for AI agent consumption.

Process:
- Run: `scripts/generate-project-overview.sh` with available plan/spec paths

Expected Outputs:
- `specs/PROJECT-OVERVIEW.md` created or overwritten with:
  - Purpose and Project Snapshot (feature from spec)
  - Absolute paths to: `spec.md`, `plan.md`, `tasks.md`
  - Execution Priorities (top 3–5 from plan, if present)
  - AI Agent Instructions (extract from plan, if present)
  - Parallelization notes (from tasks)
  - Environment & Assumptions (from plan's Technical Context)
  - Contact Points (Feature Owner, Scope if found; otherwise mark as Unspecified)
  - Change Log Notes (as given)

## Error Handling & Process Control

- Required `/scripts` directory missing: ERROR and EXIT.
- Any phase reports ERROR in its template-driven gates: STOP and report which gate failed.

Note: This command definition intentionally contains no references to stack selection or live documentation retrieval.
