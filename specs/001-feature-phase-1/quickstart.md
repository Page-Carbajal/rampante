# Quickstart – Multi-CLI Rampant (Phase 1: Codex)

Prerequisites
- Deno v2.4+
- Internet access for context7 MCP via npx

Install (Phase 1: Codex)
1. In your project directory, run: `deno run npm:run-rampant install codex`
2. Verify `~/.codex/config.toml` contains the context7 block:
   - `[mcp_servers.context7]`
   - `command = "npx"`
   - `args = ["-y", "@upstash/context7-mcp", "--api-key", "YOUR_API_KEY"]`
3. Confirm directories/files created in CWD:
   - `/recommended-stacks/DEFINITIONS.md` (+ initial stack files)
   - `/rampant-command/rampant.md`
4. Confirm command registration:
   - Codex: `~/.codex/prompts/rampant.md` exists (copied from `/rampant-command/rampant.md`).

Use Rampant
1. From your CLI, run: `/rampant "<main prompt>"`
2. Rampant will:
   - Determine project type from prompt and select stack (YOLO)
   - Fetch latest docs for the selected stack via context7 MCP
   - Run `/specify`, `/plan`, `/tasks`
   - Write or overwrite `specs/PROJECT-OVERVIEW.md`

Idempotency and Force
- Re-running install adds missing files only
- Use `--force` to drop and recreate installed folders/files

Troubleshooting
- Deno missing: install Deno v2.4+ (see deno.land)
- Context7 unavailable: process fails with explicit error; verify network and API key
- Permissions: if `~/.codex` not writable, adjust permissions or run with appropriate rights
