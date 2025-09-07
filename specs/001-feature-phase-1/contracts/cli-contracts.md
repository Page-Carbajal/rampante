# CLI Contracts – Multi-CLI Rampant (Phase 1: Codex)

## Command: Installer

- Name: `deno run npm:run-rampant install <cli>`
- Phase 1 Supported `<cli>`: `codex`
- Preconditions:
  - Deno v2.4+
  - Network access
- Behaviors (Codex):
  - Ensure `~/.codex/config.toml` exists and contains:
    - `[mcp_servers.context7]`
    - `command = "npx"`
    - `args = ["-y", "@upstash/context7-mcp", "--api-key", "YOUR_API_KEY"]`
  - Create in CWD if missing:
    - `/recommended-stacks/DEFINITIONS.md` and initial stack files
    - `/rampant-command/rampant.md`
  - Register `/rampant` by copying `/rampant-command/rampant.md` to `~/.codex/prompts/rampant.md`
  - Idempotent: do not duplicate files; `--force` removes and recreates installed assets
- Errors:
  - Unsupported `<cli>` → non-zero exit, message: "target not yet supported"
  - Context7 unavailable → non-zero exit, message: "context7 MCP not available"
  - Permission denied (home dir) → non-zero exit, actionable guidance

## Command: Rampant Runner

- Name: `/rampant "<main prompt>"`
- Behaviors:
  - Determine project type from prompt via `/recommended-stacks/DEFINITIONS.md`
  - Select stack (YOLO, deterministic tie-break)
  - Load `/recommended-stacks/<SELECTED-STACK>.md`
  - Fetch latest docs for stack via context7 MCP
  - Run `/specify` (with main prompt)
  - Run `/plan` (with selected stack + updated docs)
  - Run `/tasks` (with prompt "Generate the MVP for this project")
  - Write `specs/PROJECT-OVERVIEW.md` (always overwrite)
- Errors:
  - Missing definitions/stack doc → non-zero exit with remediation
  - Context7 unavailable → non-zero exit, message as above
