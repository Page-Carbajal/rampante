# Feature Specification: Phase 1 – Multi-CLI Rampant Slash Command (Codex first)

- **Feature Branch**: `001-feature-phase-1`
- **Created**: 2025-09-07
- **Status**: Draft
- **Input**: Updated definition: "Provide a Deno-invoked entry command `deno run npm:run-rampant install <cli>` (Deno v2.4+) that configures context7, installs `/recommended-stacks` and all stack files in the current directory, and installs a unified slash/command named `/rampant` for the target CLI. Phase 1 implements `<cli>=codex` (copy `/rampant-command/rampant.md` to `~/.codex/prompts`). Future phases add: gemini, claude-code, cursor, etc. The `/rampant` command triggers the entire Spec Kit flow from a single prompt."

## Execution Flow (main)

```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines

- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements

- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation

When creating this spec from a user prompt:

1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a developer, I can install and configure the `/rampant` command for my CLI using `deno run npm:run-rampant install <cli>` (Phase 1: `<cli>=codex`). This sets up context7, installs `/recommended-stacks` and `/rampant-command/rampant.md` in the current directory, and registers the `/rampant` command for the target CLI (for Codex: copy to `~/.codex/prompts`).

Then I can run `/rampant <main prompt>` to execute the end-to-end Spec Kit workflow: determine project type, select a recommended stack, fetch latest docs via context7, run `/specify`, `/plan`, and `/tasks`, and produce `specs/PROJECT-OVERVIEW.md` for stakeholders.

### Acceptance Scenarios

1. **Given** I have not installed the toolchain, **When** I run `deno run npm:run-rampant install <CLI>` on Deno v2.4+, **Then** context7 is configured for the given CLI. E.g. `~/.codex/config.toml` for Open AI's Codex CLI, `/recommended-stacks` (including `DEFINITIONS.md` and stack files) and `/rampant-command/rampant.md` are installed in the current directory, and the `/rampant` CLI slash command is registered to the appropriate location. E.g. (by copying `/rampant-command/rampant.md` to `~/.codex/prompts`) for Open AI's Codex CLI.
2. **Given** installation is complete, **When** I invoke `/rampant <main prompt>`, **Then** the system identifies the project type from the prompt using `/recommended-stacks/DEFINITIONS.md` and selects the correct stack.
3. **Given** a selected stack name (SELECTED-STACK), **When** `/rampant` executes, **Then** the system loads `/recommended-stacks/SELECTED-STACK.md` and uses context7 to fetch the latest documentation for that stack.
4. **Given** the main prompt, selected stack, and latest docs, **When** `/rampant` runs, **Then** it executes `/specify` with the main prompt, `/plan` with the selected stack plus updated docs, and `/tasks` with the prompt "Generate the MVP for this project".
5. **Given** those results, **When** processing completes, **Then** the system generates `specs/PROJECT-OVERVIEW.md` summarizing the plan, tasks, and stack specs.

### Edge Cases

**Cross-CLI (Phase 1: Codex; Phase 2: Claude Code, Gemini)**

- Missing or unreadable `~/.codex/config.toml` (Codex): create or update context7 entries; if permission denied, report clear guidance. For other CLIs, use their equivalent config path in later phases.
- `/recommended-stacks/DEFINITIONS.md` absent or malformed: create a starter template and warn.
- Ambiguous project type (multiple matching stacks): YOLO selection with deterministic tie-break (no prompting).
- SELECTED-STACK file missing (e.g., `/recommended-stacks/<NAME>.md` not found): fail gracefully with instructions to add or regenerate the file.
- Context7 MCP unavailable or network failure: fail hard with a clear error message; do not continue.
- Existing `specs/PROJECT-OVERVIEW.md`: always overwrite.
- Re-running installation command is idempotent (add missing only); support `--force` to drop and recreate folders/files.
- `deno` unavailable: require Deno v2.4+ and provide installation guidance.
- Installing for unsupported CLIs in Phase 1 (e.g., `gemini`, `claude-code`, `cursor`): return a clear "target not yet supported" error while preserving installed assets.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a Deno-invoked entry command `deno run npm:run-rampant install <cli>` (requires Deno v2.4+) that performs initial setup for the specified CLI; Phase 1 supports `<cli>=codex`.
- **FR-002**: System MUST ensure context7 is configured in `~/.codex/config.toml`; if missing, create the file and add the following:
  - `[mcp_servers.context7]` with `command = "npx"` and `args = ["-y", "@upstash/context7-mcp", "--api-key", "YOUR_API_KEY"]`.
- **FR-003**: System MUST install or ensure presence of `/recommended-stacks` folder with a `DEFINITIONS.md` that lists available stacks and ship with a minimal initial set of stack definition files.
- **FR-004**: System MUST install or ensure presence of `/rampant-command/` folder with a `rampant.md` file which is then used to register the slash/command for the given CLI.
- **FR-005**: For Codex, System MUST expose a slash command named `/rampant` by copying `/rampant-command/rampant.md` to `~/.codex/prompts`.
- **FR-006**: System MUST analyze the main prompt and determine the most appropriate project type/stack using `/recommended-stacks/DEFINITIONS.md` with a YOLO strategy (no user prompting).
- **FR-007**: When multiple stacks match, System MUST auto-pick the top match deterministically (e.g., highest score; ties broken by order in `DEFINITIONS.md`).
- **FR-008**: System MUST load `/recommended-stacks/SELECTED-STACK.md` where `SELECTED-STACK` matches the chosen stack name from definitions.
- **FR-009**: System MUST use context7 MCP to retrieve the latest documentation relevant to the SELECTED-STACK before planning; if context7/network is unavailable, fail with a clear error message.
- **FR-010**: System MUST run `/specify` with the main prompt and capture outputs for later summarization.
- **FR-011**: System MUST run `/plan` using the SELECTED-STACK plus its updated documentation and capture outputs.
- **FR-012**: System MUST run `/tasks` with the prompt "Generate the MVP for this project" and capture outputs.
- **FR-013**: System MUST generate `specs/PROJECT-OVERVIEW.md` that summarizes `/plan` results, `/tasks` output, and the stack specifications used; when this file exists, always overwrite.
- **FR-014**: Setup operations MUST be idempotent; on re-run add only missing files/folders; a `--force` flag MUST drop and recreate installed folders/files.
- **FR-015**: System MUST provide clear user feedback and warnings when stack selection is ambiguous or when documentation refresh fails.
 
Phase 2 priorities (planning):
- **FR-018**: Add support for `<cli>=claude-code` with equivalent installation, context7 configuration, and `/rampant` registration semantics (exact registration path and conventions to be defined during Phase 2).
- **FR-019**: Add support for `<cli>=gemini` with equivalent installation, context7 configuration, and `/rampant` registration semantics (exact registration path and conventions to be defined during Phase 2).
- **FR-016**: The architecture MUST support additional CLI targets (Gemini, Claude Code, Cursor) in later phases without changing the core Spec Kit workflow; keep `/rampant` as the cross-CLI command name.
- **FR-017**: If a non-implemented CLI target is specified in Phase 1, the system MUST return a clear "target not yet supported" message and exit without side effects.

_Clarifications resolved:_

- Deno version: v2.4+ required.
- Entry command: `deno run npm:run-rampant install <cli>` (Phase 1: `<cli>=codex`).
- Slash command registration: copy to the appropriate CLI placement. E.g. `/rampant-command/rampant.md` to `~/.codex/prompts` for Open AI's Codex CLI.
- Overwrite policy: always overwrite `specs/PROJECT-OVERVIEW.md`; for installed assets, add missing on re-runs; `--force` to drop/recreate.
- Stack selection: YOLO (no prompts); deterministic auto-pick when ties.
- Installation path: install `/recommended-stacks` in the current directory; create `~/.codex/config.toml` if missing.
- Context7 behavior: configure as specified; fail hard if unavailable.
- Multi-CLI scope: design supports future targets (Gemini, Claude Code, Cursor) with the same `/rampant` command name across CLIs.

### Key Entities _(include if feature involves data)_

- **CLI Target**: The chosen CLI environment (e.g., codex [Phase 1], gemini, claude-code, cursor); attributes include name and command registration path.
- **Project Type (Derived)**: The inferred category of the project from the user’s main prompt; attributes include name and rationale.
- **Selected Stack**: The stack name chosen from `DEFINITIONS.md`; attributes include stack name and link to `/recommended-stacks/<NAME>.md`.
- **Documentation Source**: The context7 documentation set associated with the selected stack; attributes include retrieval timestamp and scope.
- **Spec Outputs**: Artifacts from `/specify`, `/plan`, `/tasks`; attributes include references used to generate `specs/PROJECT-OVERVIEW.md`.

---

## Review & Acceptance Checklist

_GATE: Automated checks run during main() execution_

### Content Quality

- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

### Requirement Completeness

- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

---

## Execution Status

_Updated by main() during processing_

- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed

---
