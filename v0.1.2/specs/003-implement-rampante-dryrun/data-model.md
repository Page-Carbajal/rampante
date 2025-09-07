# Data Model: Rampante Dry-Run Mode

## Entities

### DryRunRequest

- description: A `/rampante` invocation where the first token is `--dry-run`.
- fields:
  - id: string (implicit, not persisted)
  - raw_input: string
  - prompt_content: string (raw_input minus the `--dry-run` token)
  - timestamp: ISO-8601 string
  - target_commands: string[] (e.g., ["/specify", "/plan", "/tasks", ...])

### GeneratedPrompt

- description: A prompt destined for a specific target command.
- fields:
  - command: string (e.g., "/specify")
  - order: number (1-based execution order)
  - text: string (the full prompt body as would be sent)
  - notes: string (optional annotations, warnings)

## Relationships

- DryRunRequest 1 — N GeneratedPrompt (ordered by `order`).

## Validation Rules

- `raw_input` MUST begin with `--dry-run`.
- `prompt_content` MAY be empty; in that case, `target_commands` can be empty and output should include a note.
