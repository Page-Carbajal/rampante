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

Given the main prompt provided as an argument, execute this deterministically without user interaction:

### 1. Analyze prompt and select stack (YOLO):
   - Run `scripts/select-stack.sh --json "$ARGUMENTS"` from the repo root.
   - Parse JSON for: `selected_stack`, `stack_file`, `priority`, `technologies`, and `fallback`.
   - If `/recommended-stacks/DEFINITIONS.md` is missing → ERROR "Missing /recommended-stacks/DEFINITIONS.md. Run installer to set up stacks." and **EXIT PROCESS**.
   - If `stack_file` is missing → ERROR "Missing stack file: <stack_file>. Please add it to /recommended-stacks" and **EXIT PROCESS**.

### 2. Load stack documentation:
   - Read `stack_file` for context (already identified by the script).
   - Extract the selected stack name and list of technologies from step 1.

### 3. Fetch latest documentation via context7 MCP:
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
   - Store a short summary string for the `/plan` step: `Using the <SELECTED-STACK> stack with the following technologies and updated documentation: <context7 results summary>`.

### 4. Execute Spec Kit commands in sequence (feed outputs forward):

   **a) /specify**
      - Run: `scripts/create-new-feature.sh --json "$ARGUMENTS"`
      - Parse JSON: `BRANCH_NAME`, `SPEC_FILE`, `FEATURE_NUM`.
      - Load `templates/spec-template.md` and write the completed specification to `SPEC_FILE` using the user prompt. Follow the template's execution flow; fill mandatory sections; mark ambiguities as [NEEDS CLARIFICATION] instead of guessing.

   **b) /plan**
      - Run: `scripts/setup-plan.sh --json`
      - Parse JSON: `FEATURE_SPEC`, `IMPL_PLAN`, `SPECS_DIR`, `BRANCH`.
      - Load `templates/plan-template.md` (already copied to `IMPL_PLAN`).
      - Execute steps 1–10 per the template, incorporating: `Using the <SELECTED-STACK> stack with the following technologies and updated documentation: <context7 results summary>`.
      - Ensure Phase 0–2 artifacts are generated in `SPECS_DIR` without errors.

   **c) /tasks**
      - Run: `scripts/check-task-prerequisites.sh --json`
      - Parse JSON: `FEATURE_DIR`, `AVAILABLE_DOCS`.
      - Generate `tasks.md` per `/templates/tasks-template.md`, reading available design docs.
      - Ensure tasks are specific, ordered with dependencies, and parallelizable where safe.

### 5. Generate PROJECT-OVERVIEW.md
   - Run: `scripts/generate-project-overview.sh \
       --stack "<SELECTED-STACK>" \
       --stack-file "<stack_file>" \
       --technologies "<comma-separated list>" \
       --docs-timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)"`
   - The script must create or overwrite `specs/PROJECT-OVERVIEW.md` with:
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

### Slash Command Integration
   - This orchestrator runs as `/command` in supported AI agents
   - Compatible with: Claude Code, Gemini, Codex, Cursor Agent, and similar CLI-based AI development tools
   - Designed for autonomous execution within agent environments

## Reporting

### On Success, report:
- Selected stack and priority
- Created branch and paths for spec, plan, tasks
- Technologies fetched via context7 (list)
- PROJECT-OVERVIEW.md path

### On Failure, report:
- The exact error per the rules above
- **STOP execution immediately**
- Do not attempt recovery or continuation
