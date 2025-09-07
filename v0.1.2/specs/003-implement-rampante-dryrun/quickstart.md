# Quickstart: Rampante Dry-Run Mode

## Prerequisites

- Current branch: `003-implement-rampante-dryrun`
- Rampante CLI installed per repository README

## Try It

1. Basic dry run
   - Command: `/rampante --dry-run Implement CSV export for admin reports`
   - Expect: Markdown output with sections for `/specify`, `/plan`, `/tasks` (no execution)

2. Normal execution (no dry-run)
   - Command: `/rampante Implement CSV export for admin reports`
   - Expect: Normal behavior (runs downstream commands as documented)

3. Empty prompt after flag
   - Command: `/rampante --dry-run`
   - Expect: A summary indicating no downstream commands/prompts could be generated

## Troubleshooting

- Ensure `--dry-run` is the very first token.
- Only `--dry-run` is supported in v1 (no aliases).
