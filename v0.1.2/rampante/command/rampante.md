# AI Agent Orchestrator: Spec-Driven Development (Simplified)

Run the Spec-Driven Development workflow from a single prompt via slash command `/rampante.md`.

This simplified orchestrator removes stack selection and live documentation retrieval. It focuses on generating a spec, creating a plan, drafting tasks (delegated), and building a project overview.

## Input Processing & Dry-Run Detection

**First, check if the prompt starts with `--dry-run` flag:**

### Dry-Run Mode (if prompt starts with `--dry-run`)

If the first token of the prompt is exactly `--dry-run`:

Process:

1. Extract the remaining prompt content (everything after `--dry-run` and optional whitespace)
2. Generate prompts for each downstream command without executing them:
   - `/specify`: Use the extracted prompt content directly
   - `/plan`: Generate prompt referencing the spec that would be created (`/specs/[feature-name]/spec.md`)
   - `/tasks`: Generate prompt referencing the plan that would be created (`/specs/[feature-name]/plan.md`)
3. Format output as structured Markdown per CLI contract
4. Return formatted output and exit with code 0
5. **CRITICAL**: No side effects, no file creation, no command execution

Output Format:

````markdown
# DRY RUN: /rampante

## Summary

- Commands: [/specify, /plan, /tasks]

## /specify

```text
[extracted prompt content]
```
````

## /plan

```text
/specs/[feature-name]/spec.md
```

## /tasks

```text
/specs/[feature-name]/plan.md
```

```

**Exit immediately after dry-run output. Do not proceed to normal workflow.**

### Invalid Flag Position

If `--dry-run` appears anywhere except as the first token:
- Return error message: "Flag --dry-run must be the first token"
- Exit with code 2

### Normal Mode (no `--dry-run` flag)

If the prompt does not start with `--dry-run`, proceed with standard workflow:

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
```
