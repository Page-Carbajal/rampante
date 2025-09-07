# Feature Specification: Implement /rampante Dryrun support

**Feature Branch**: `003-implement-rampante-dryrun`
**Created**: 2025-09-07
**Status**: Draft
**Input**: User description: "Implement `/rampante` Dryrun support when the prompt starts with --dry-run. Execute returns the prompts which will be passed to every command like `/specify` `/plan` and `/tasks` and the sub commands without ever actually calling them."

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

As a CLI user running the `/rampante` command, when I prefix my prompt with `--dry-run`, I see the exact prompts that would be sent to each relevant subcommand (e.g., `/specify`, `/plan`, `/tasks`, and any involved sub-commands) without those commands actually executing.

### Acceptance Scenarios

1. **Given** a valid `/rampante` prompt that begins with `--dry-run`, **When** the command is executed, **Then** the system returns a structured list of generated prompts for each relevant command in the flow and does not execute any commands.
2. **Given** a `/rampante` prompt without `--dry-run`, **When** the command is executed, **Then** the system proceeds with normal execution and does not return the generated prompts list.
3. **Given** a `--dry-run` prompt with additional arguments or content after the flag, **When** executed, **Then** the system uses the remaining prompt content to generate the same prompts it would normally produce, and returns them without executing.

### Edge Cases

- What happens when the prompt includes `--dry-run` not at the start? [NEEDS CLARIFICATION]
- How should the system behave if no subcommands would be invoked (empty prompt or unsupported flow)? [NEEDS CLARIFICATION]
- How are extremely long prompts summarized or paginated to remain readable? [NEEDS CLARIFICATION]
- Should `--dry-run` support synonyms (e.g., `--dryrun`, `-n`) or only the exact flag? [NEEDS CLARIFICATION]
- How should errors that would occur during generation (e.g., invalid prompt) be represented in dry run output? [NEEDS CLARIFICATION]
- Does dry run apply exclusively to `/rampante` or to other top-level commands as well? [NEEDS CLARIFICATION]

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST detect when the user prompt for `/rampante` starts with `--dry-run` and enable dry-run behavior for that invocation.
- **FR-002**: In dry-run mode, the system MUST generate the same set of prompts that would be sent to each relevant command (e.g., `/specify`, `/plan`, `/tasks`, and sub-commands) for the given input.
- **FR-003**: In dry-run mode, the system MUST NOT execute any commands; it MUST only return/show the generated prompts.
- **FR-004**: The system MUST present the generated prompts in a clear, structured format that identifies the intended target command for each prompt.
- **FR-005**: The system MUST ensure normal execution occurs when the prompt does not start with `--dry-run`.
- **FR-006**: The system SHOULD make it clear in the output that dry-run mode is active to avoid confusion with real execution.
- **FR-007**: The system SHOULD handle additional user-provided prompt content following `--dry-run` and use it as the basis for prompt generation.
- **FR-008**: The system SHOULD provide a concise summary of which commands would be invoked and in which order, alongside their associated prompts.
- **FR-009**: The system MUST avoid any side effects or persistent changes during a dry run.
- **FR-010**: The system SHOULD surface any validation issues with the input prompt in a non-blocking way (e.g., mark them in the output) without executing commands.
- **FR-011**: The system MUST make clear how dry-run mode interacts with other flags or options when present. [NEEDS CLARIFICATION]

### Key Entities _(include if feature involves data)_

- **Dry-Run Request**: A user invocation of `/rampante` prefixed with `--dry-run`; includes the raw prompt content used for generation.
- **Generated Prompt**: A textual prompt associated with a specific target command (e.g., `/specify`, `/plan`, `/tasks`); includes the target command name and the full prompt text.

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
