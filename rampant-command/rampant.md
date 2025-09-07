# Rampant Command

The `/rampant` command triggers a complete Spec-Driven Development workflow from a single prompt.

## Usage

```
/rampant "<main prompt>"
```

Example:

```
/rampant "Create a task management web app with user authentication"
```

## Workflow

### 1. Analyze Prompt & Select Stack

First, analyze the main prompt to determine the project type by looking for keywords and patterns in `/recommended-stacks/DEFINITIONS.md`.

Use YOLO (You Only Look Once) strategy:

- Match tags and descriptions against the prompt
- Pick the first good match without user interaction
- For ties, use deterministic ordering (priority field, then order in DEFINITIONS.md)

### 2. Load Stack Documentation

Once a stack is selected (e.g., SIMPLE_WEB_APP):

- Load `/recommended-stacks/<SELECTED-STACK>.md`
- Extract the stack specifications and technologies

### 3. Fetch Latest Documentation via Context7

Use the context7 MCP to get up-to-date documentation for the selected stack:

- Extract technology list from the stack file
- Query context7 for each technology mentioned
- Combine results into comprehensive documentation set

**CRITICAL**: If context7 is unavailable (invalid API key, network error, etc.), fail immediately with error:

```
Error: context7 MCP not available
Please ensure context7 is properly configured in ~/.codex/config.toml
```

### 4. Execute Spec Kit Commands

Run the following commands in sequence, passing outputs forward:

#### a. /specify

```
/specify "<main prompt>"
```

This creates a feature specification from the user's requirements.

#### b. /plan

```
/plan "Using the <SELECTED-STACK> stack with the following technologies and updated documentation: <context7 results>"
```

This creates an implementation plan based on the spec and selected stack.

#### c. /tasks

```
/tasks "Generate the MVP for this project"
```

This breaks down the plan into executable tasks.

### 5. Generate PROJECT-OVERVIEW.md

Create or overwrite `specs/PROJECT-OVERVIEW.md` with a summary containing:

```markdown
# Project Overview – <Project Name from Spec>

## Purpose

- Brief AI-facing guide to this project with links to specs and tasks
- Optimized for quick ingestion and high-signal execution context

## Project Snapshot

- Feature: <from specification>
- Selected Stack: <SELECTED-STACK>
- Technologies: <from stack file>
- Documentation Updated: <timestamp>

## Key Artifacts (absolute paths)

- Spec: <path to spec.md>
- Plan: <path to plan.md>
- Tasks: <path to tasks.md>
- Stack Definition: <path to selected stack file>

---

## Execution Priorities (from plan)

<Extract top 3-5 priorities from plan.md>

### AI Agent Instructions

<Extract key instructions from plan.md>

### Parallelization

<Extract parallelization notes from tasks.md>

---

## Environment & Assumptions

<Extract from plan.md Technical Context>

### Contact Points

- Feature Owner: <from spec>
- Scope: <from spec>

### Change Log Notes

- Keep commits small, one task per commit where possible
```

## Error Handling

### Missing Files

If any required file is missing:

- `/recommended-stacks/DEFINITIONS.md`: Error with instructions to run installer
- `/recommended-stacks/<STACK>.md`: Error with stack name and request to add it
- `~/.codex/config.toml`: Error with configuration instructions

### Context7 Failures

Any context7 error must halt execution:

- Invalid API key
- Network timeout
- Service unavailable

Show clear error message and exit.

### Stack Selection Failures

If no stack matches the prompt:

- Select the most general-purpose stack (lowest priority number)
- Add note in PROJECT-OVERVIEW.md about the selection

## Implementation Notes

1. Always overwrite `specs/PROJECT-OVERVIEW.md` - no prompting
2. Use absolute paths in all generated content
3. Maintain command output for troubleshooting
4. Keep the workflow deterministic and automated
5. No user interaction after initial prompt
