# CLI Contract: Rampante Dry-Run

## Command

`/rampante --dry-run <prompt...>`

## Behavior

- Detects `--dry-run` as the first token; generates prompts for downstream commands without executing them.
- Returns a structured, human-readable Markdown output organized by target command.

## Input

- `--dry-run` (required, first token)
- `<prompt...>` (optional) remaining text used to generate child-command prompts

## Output (Markdown)

````
# DRY RUN: /rampante

## Summary
- Commands: [/specify, /plan, /tasks]

## /specify
```text
<prompt that would be sent to /specify>
````

## /plan

```text
<prompt that would be sent to /plan>
```

## /tasks

```text
<prompt that would be sent to /tasks>
```

```

## Exit Codes
- `0` Success (generated prompts)
- `2` Invalid usage (flag not first token)

## Examples
```

/rampante --dry-run Build a dark mode toggle for the app

```
Outputs the three prompts that would be sent to `/specify`, `/plan`, and `/tasks` for the provided content.

## Notes
- No commands are executed; no side effects occur.
- In v1, only the exact `--dry-run` flag is supported.
```
