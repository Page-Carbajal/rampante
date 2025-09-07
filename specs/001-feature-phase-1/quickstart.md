# Quickstart – Multi-CLI Rampante (Phase 1: Codex)

Prerequisites
- Deno v2.4+
- Internet access for context7 MCP via npx

## Install (Phase 1: Codex)

### Basic Installation

```bash
deno run npm:run-rampante install codex
```

### Installation with Options

```bash
# Force reinstall (recreates all assets)
deno run npm:run-rampante install codex --force

# Debug mode (verbose output)
deno run npm:run-rampante install codex --debug

# Combined flags
deno run npm:run-rampante install codex --force --debug
```

### CLI Options

- **`--force`** (`-f`): Recreate all assets (default: idempotent behavior)
- **`--debug`** (`-d`): Enable debug logging with detailed output
- **`--help`** (`-h`): Show usage information and examples

### Verification Steps

1. **Verify context7 configuration** - `~/.codex/config.toml` contains:
   ```toml
   [mcp_servers.context7]
   command = "npx"
   args = ["-y", "@upstash/context7-mcp", "--api-key", "YOUR_API_KEY"]
   ```

2. **Confirm directories/files created in CWD**:
   - `/recommended-stacks/DEFINITIONS.md` (+ 8 initial stack files)
   - `/rampante/command/rampante.md`
   - `/scripts/select-stack.sh` (+ other helper scripts)

3. **Confirm command registration**:
   - Codex: `~/.codex/prompts/rampante.md` exists (copied from `/rampante/command/rampante.md`)

## Use Rampante

### Basic Usage

```bash
# From your Codex CLI
/rampante "build a user authentication system"
```

### Workflow Execution

Rampante executes a 7-phase workflow:
1. **Stack Selection** - Determine project type from prompt and select stack (YOLO strategy)
2. **Context Loading** - Load stack-specific configuration and settings
3. **Documentation Retrieval** - Fetch latest docs for selected technologies via context7 MCP
4. **Specification** - Run `/specify` to create detailed feature specification
5. **Planning** - Run `/plan` to generate implementation plan and design artifacts
6. **Task Generation** - Run `/tasks` to create ordered, dependency-aware task list
7. **Overview Generation** - Create or overwrite `specs/PROJECT-OVERVIEW.md` with complete project summary

### Expected Execution Time
- **Total Duration**: ~2.5-4 minutes for complete workflow
- **Phase 3 (Documentation)**: Longest phase (~30-60 seconds depending on technology count)

## Installation Behavior

### Idempotency and Force Mode

- **Default behavior**: Re-running install adds missing files only (idempotent)
- **Force mode** (`--force`): Drops and recreates all installed folders/files
- **Debug mode** (`--debug`): Shows detailed progress and troubleshooting information

### Supported Files and Assets

The installer creates/manages:
- Stack definitions and templates in `/recommended-stacks/`
- Command file in `/rampante/command/`
- Helper scripts in `/scripts/`
- Configuration in `~/.codex/config.toml`
- Registration in `~/.codex/prompts/`

Troubleshooting
- Deno missing: install Deno v2.4+ (see deno.land)
- Context7 unavailable: process fails with explicit error; verify network and API key
- Permissions: if `~/.codex` not writable, adjust permissions or run with appropriate rights
