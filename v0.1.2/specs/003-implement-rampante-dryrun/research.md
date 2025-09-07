# Research: Rampante Dry-Run Mode

## Decisions

- Decision: Trigger only when `--dry-run` is the first token
  - Rationale: Prevents accidental activation when the phrase appears in natural language; aligns with “starts with --dry-run” requirement
  - Alternatives considered: Accept anywhere in prompt; Accept after command name regardless of position

- Decision: Do not support synonyms in v1 (`--dryrun`, `-n` not recognized)
  - Rationale: Keeps scope small and predictable; avoids ambiguity with other flags
  - Alternatives considered: Accept common aliases; Accept any case-insensitive variant

- Decision: If no subcommands would be invoked (e.g., empty remaining prompt), return an empty list with a clear note
  - Rationale: Avoids guessing behavior; maintains “no execution” guarantee
  - Alternatives considered: Fallback to default flow; Emit an error

- Decision: Output format is human-readable Markdown with clear sections per command and fenced code blocks for prompts
  - Rationale: Readability in CLI; easy to copy/paste; tooling-friendly
  - Alternatives considered: JSON-only; Mixed JSON+Markdown

- Decision: Do not truncate long prompts; include full content with section delimiters
  - Rationale: Fidelity over brevity; copying prompts is a primary use case
  - Alternatives considered: Pagination; Truncation with a toggle

- Decision: Interaction with other flags — `--dry-run` must be first; any following flags/args are treated as normal input for prompt generation
  - Rationale: Avoids ambiguous parsing; keeps implementation simple
  - Alternatives considered: Parse flags anywhere; allow multiple flags before content

- Decision: Scope limited to `/rampante` only for v1
  - Rationale: Minimize blast radius; gather user feedback before expanding
  - Alternatives considered: Support global dry-run across commands

## Open Questions (deferred)

None for v1. Future versions may address alias support and machine-readable output option.

## References

- Spec: /Users/dubois/Source/repos/ai/rampante/specs/003-implement-rampante-dryrun/spec.md
