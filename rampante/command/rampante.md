# AI Agent Orchestrator: Spec-Driven Development Workflow

**For AI Agents:** Claude Code, Gemini, Codex, Cursor Agent, and other CLI-based AI development assistants.

Run the complete Spec-Driven Development workflow from a single prompt via slash command `/command`.

This orchestrator ties together stack selection, documentation retrieval (via context7 MCP), and the Spec Kit commands to automate the entire development planning process.

## Prerequisites Check

**CRITICAL:** Before starting, verify directory structure:

- The `/scripts` folder MUST exist in the current directory
- The `/recommended-stacks` folder MUST exist in the current directory

If either directory is missing:

```
ERROR: Missing required directories
- /scripts directory: [EXISTS/MISSING]
- /recommended-stacks directory: [EXISTS/MISSING]

Cannot proceed without required project structure. Please ensure you're in the correct project root directory.
```

**EXIT PROCESS IMMEDIATELY**

## Workflow Execution

Given the main prompt provided as an argument, execute this deterministically without user interaction through the following phases:

## Phase 1: Stack Selection and Validation

**Purpose**: Analyze the user prompt and select the most appropriate technology stack using YOLO strategy.

**Process**:
- Run `scripts/select-stack.sh --json "$ARGUMENTS"` from the repo root.
- Parse JSON for: `selected_stack`, `stack_file`, `priority`, `technologies`, and `fallback`.

**Expected Outputs**:
- Selected stack name (e.g., "REACT_SPA", "PYTHON_API")
- Absolute path to stack definition file
- List of technologies to fetch documentation for
- Priority level and fallback indicator

**Error Conditions**:
- If `/recommended-stacks/DEFINITIONS.md` is missing → ERROR "Missing /recommended-stacks/DEFINITIONS.md. Run installer to set up stacks." and **EXIT PROCESS**.
- If `stack_file` is missing → ERROR "Missing stack file: <stack_file>. Please add it to /recommended-stacks" and **EXIT PROCESS**.

## Phase 2: Documentation Context Loading  

**Purpose**: Load stack-specific context and fetch up-to-date documentation for selected technologies.

**Process**:
- Read `stack_file` for context (already identified by the script).
- Extract the selected stack name and list of technologies from Phase 1.

**Expected Outputs**:
- Stack definition context loaded
- Technology list validated and prepared for documentation fetch

## Phase 3: Live Documentation Retrieval

**Purpose**: Fetch the latest documentation for all selected technologies via context7 MCP.

**Process**:
- **CRITICAL:** If context7 is unavailable for any reason, fail immediately with the exact message:
  ```
  Error: context7 MCP not available
  Please ensure context7 is properly configured in ~/.codex/config.toml
  ```
  **EXIT PROCESS**
- For each technology in the `technologies` list:
  - Call `resolve-library-id` to map the technology to a Context7-compatible library ID.
  - Then call `get-library-docs` with a sensible token limit (e.g., 3000–6000) and topic focus when applicable.
- Combine the results into a concise documentation set (ordered by technology name) to pass into planning.

**Expected Outputs**:
- Up-to-date documentation for each selected technology
- Context7 results summary string: `Using the <SELECTED-STACK> stack with the following technologies and updated documentation: <context7 results summary>`

**Error Conditions**:
- Any context7 MCP failure → show the CRITICAL error and **EXIT PROCESS**

## Phase 4: Specification Generation

**Purpose**: Generate detailed feature specification using the Spec Kit `/specify` command.

**Process**:
- Run: `scripts/create-new-feature.sh --json "$ARGUMENTS"`
- Parse JSON: `BRANCH_NAME`, `SPEC_FILE`, `FEATURE_NUM`
- Load `templates/spec-template.md` and write the completed specification to `SPEC_FILE` using the user prompt
- Follow the template's execution flow; fill mandatory sections; mark ambiguities as [NEEDS CLARIFICATION] instead of guessing

**Expected Outputs**:
- Feature branch created (if not exists)
- Complete `spec.md` file in feature directory
- Feature specification with all mandatory sections filled

## Phase 5: Implementation Planning

**Purpose**: Generate implementation plan using the Spec Kit `/plan` command with stack-specific context.

**Process**:
- Run: `scripts/setup-plan.sh --json`
- Parse JSON: `FEATURE_SPEC`, `IMPL_PLAN`, `SPECS_DIR`, `BRANCH`
- Load `templates/plan-template.md` (already copied to `IMPL_PLAN`)
- Execute steps 1–10 per the template, incorporating: `Using the <SELECTED-STACK> stack with the following technologies and updated documentation: <context7 results summary>`
- Ensure Phase 0–2 artifacts are generated in `SPECS_DIR` without errors

**Expected Outputs**:
- Complete `plan.md` file with technical context
- Research artifacts (`research.md`)
- Data model documentation (`data-model.md`) 
- API contracts (in `contracts/` directory)
- Quickstart guide (`quickstart.md`)
- Agent-specific template file (e.g., `CODEX.md`)

## Phase 6: Task Generation

**Purpose**: Generate detailed, ordered task list using the Spec Kit `/tasks` command.

**Process**:
- Run: `scripts/check-task-prerequisites.sh --json`
- Parse JSON: `FEATURE_DIR`, `AVAILABLE_DOCS`
- Generate `tasks.md` per `/templates/tasks-template.md`, reading available design docs
- Ensure tasks are specific, ordered with dependencies, and parallelizable where safe

**Expected Outputs**:
- Complete `tasks.md` file with numbered tasks
- Tasks marked with [P] for parallel execution
- Clear dependency ordering (TDD: tests before implementation)
- Estimated task count (typically 25-30 tasks)

## Phase 7: Project Overview Generation

**Purpose**: Create comprehensive project overview document for AI agent consumption.

**Process**:
- Run: `scripts/generate-project-overview.sh \
--stack "<SELECTED-STACK>" \
--stack-file "<stack_file>" \
--technologies "<comma-separated list>" \
--docs-timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)"`

**Expected Outputs**:
- `specs/PROJECT-OVERVIEW.md` created or overwritten with:
  - Purpose and Project Snapshot (feature from spec, stack name, technologies, timestamp)
  - Absolute paths to: spec.md, plan.md, tasks.md, and the selected stack file
  - Execution Priorities (top 3–5 from plan, if present)
  - AI Agent Instructions (extract from plan, if present)
  - Parallelization notes (from tasks)
  - Environment & Assumptions (from plan's Technical Context)
  - Contact Points (Feature Owner, Scope if found; otherwise mark as Unspecified)
  - Change Log Notes (as given)

## Error Handling & Process Control

### Required Directory Structure

- **Missing `/scripts` directory:** ERROR "Required /scripts directory not found in current directory" and **EXIT PROCESS**.
- **Missing `/recommended-stacks` directory:** ERROR "Required /recommended-stacks directory not found in current directory" and **EXIT PROCESS**.

### Missing Files

- If `/recommended-stacks/DEFINITIONS.md` missing: show installer message and **EXIT PROCESS**.
- If `/recommended-stacks/<STACK>.md` missing: show stack file message and **EXIT PROCESS**.
- If `~/.codex/config.toml` missing: treat as context7 unavailable → show exact CRITICAL error and **EXIT PROCESS**.

### Context7 Failures

- Any context7 MCP failure: show the CRITICAL error and **EXIT PROCESS**.

### Stack-selection Failures

- Select the most general-purpose stack (lowest priority) and set `fallback: true`.
- Add a note in `PROJECT-OVERVIEW.md` about fallback selection.

## AI Agent Guidelines

### Determinism and Logging

- Use YOLO: first good match by tags; ties broken by lower priority then order in DEFINITIONS.md.
- Keep command outputs for troubleshooting.
- Use absolute paths in all generated content.
- **Never prompt the user after the initial prompt.**
- Execute all steps programmatically without human intervention.

### Workflow Validation Points

Before each phase, validate required conditions:

**Pre-Phase 1**: Directory structure exists (`/scripts`, `/recommended-stacks`)
**Pre-Phase 3**: Context7 MCP connectivity test
**Pre-Phase 4**: Stack file validation and technology list verification
**Pre-Phase 5**: Spec file exists and is complete
**Pre-Phase 6**: Plan and design artifacts exist
**Pre-Phase 7**: All prerequisite files generated

### Expected Execution Timeline

- **Phase 1-2**: ~5-10 seconds (stack selection and context loading)
- **Phase 3**: ~30-60 seconds (context7 documentation fetch, depends on tech count)
- **Phase 4**: ~30-45 seconds (specification generation)
- **Phase 5**: ~60-90 seconds (planning and artifact generation)
- **Phase 6**: ~20-30 seconds (task generation)
- **Phase 7**: ~5-10 seconds (overview generation)
- **Total Expected**: ~2.5-4 minutes for complete workflow

### Slash Command Integration

- This orchestrator runs as `/rampante` in supported AI agents
- Compatible with: Claude Code, Gemini, Codex, Cursor Agent, and similar CLI-based AI development tools
- Designed for autonomous execution within agent environments
- Single-command execution: `/rampante "implement user authentication system"`

## Execution Summary & Reporting

### Phase Completion Tracking

Report progress after each successful phase:
- **Phase 1 Complete**: Stack selected: `<selected_stack>` (priority: `<priority>`, fallback: `<fallback>`)
- **Phase 2 Complete**: Context loaded from `<stack_file>`
- **Phase 3 Complete**: Documentation fetched for `<N>` technologies: `<tech_list>`
- **Phase 4 Complete**: Specification written to `<spec_path>`
- **Phase 5 Complete**: Implementation plan and artifacts created in `<specs_dir>`
- **Phase 6 Complete**: Task list generated: `<task_count>` tasks in `<tasks_path>`
- **Phase 7 Complete**: Project overview created at `<overview_path>`

### On Success, report:

- **Workflow Status**: All 7 phases completed successfully
- **Selected Stack**: `<selected_stack>` (priority: `<priority>`)
- **Created Branch**: `<branch_name>`
- **Key Artifacts**:
  - Specification: `<absolute_spec_path>`
  - Plan: `<absolute_plan_path>`
  - Tasks: `<absolute_tasks_path>`
  - Overview: `<absolute_overview_path>`
- **Technologies**: `<comma_separated_tech_list>`
- **Context7 Status**: Successfully fetched documentation for `<tech_count>` technologies
- **Task Summary**: Generated `<task_count>` tasks with `<parallel_count>` parallelizable

### On Failure, report:

- **Failed Phase**: `<phase_number>`: `<phase_name>`
- **Error Details**: The exact error per the rules above
- **Partial Artifacts**: List any successfully created files before failure
- **Recovery Instructions**: Specific guidance based on failure type
- **EXIT PROCESS IMMEDIATELY** - Do not attempt recovery or continuation
