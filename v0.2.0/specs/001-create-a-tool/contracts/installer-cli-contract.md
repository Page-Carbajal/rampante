# CLI Contract: Rampante Installer

## Command Signature

```bash
deno run -A --reload jsr:@page-carbajal/rampante <command> [options]
```

## Subcommands

### install-for

**Purpose**: Install /rampante slash command for specific AI CLI

**Usage**:

```bash
deno run -A --reload jsr:@page-carbajal/rampante install-for <cli-name>
```

**Arguments**:

- `cli-name`: Target CLI (gemini, codex, cursor, claude-code)

**Options**:

- `--dry-run`: Preview installation without writing files
- `--force`: Overwrite existing installation

**Success Response** (exit code 0):

```
✅ Successfully installed /rampante for Gemini CLI
   Config: /Users/user/.gemini/commands/rampante.toml

   Test with: /rampante --help
```

**Error Responses**:

- Exit code 1: CLI not found or not supported
- Exit code 2: Permission denied
- Exit code 3: Template error

### list

**Purpose**: List supported AI CLIs and their installation status

**Usage**:

```bash
deno run -A --reload jsr:@page-carbajal/rampante list
```

**Response Format**:

```
Supported AI CLIs:
  ✅ gemini    - Installed (/Users/user/.gemini/commands/rampante.toml)
  ❌ codex     - Not installed
  ⚠️  cursor   - Detected but not installed
  ❓ claude-code - Not detected
```

### uninstall

**Purpose**: Remove /rampante slash command from specific CLI

**Usage**:

```bash
deno run -A --reload jsr:@page-carbajal/rampante uninstall <cli-name>
```

**Success Response**:

```
✅ Successfully removed /rampante from Gemini CLI
   Removed: /Users/user/.gemini/commands/rampante.toml
```

## Error Handling

### Common Error Messages

```
ERROR: Unsupported CLI 'unknown-cli'
       Supported: gemini, codex, cursor, claude-code

ERROR: Permission denied writing to /Users/user/.gemini/commands/
       Try: chmod 755 /Users/user/.gemini/commands/

ERROR: Template processing failed
       Invalid parameter substitution in gemini template
```

## Exit Codes

- 0: Success
- 1: Invalid usage or unsupported CLI
- 2: File system permission error
- 3: Template processing error
- 4: CLI detection failed
