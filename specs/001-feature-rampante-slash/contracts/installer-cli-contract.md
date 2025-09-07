# CLI Contract: Rampante Installer

## Command Signature

```bash
deno run -A --reload jsr:@page-carbajal/rampante <subcommand> [options] [arguments]
```

## Subcommands

### install

**Purpose**: Install /rampante slash command for specific AI CLI

**Usage**:

```bash
deno run -A --reload jsr:@page-carbajal/rampante install <cli-name>
```

**Arguments**:

- `cli-name`: Target CLI (gemini, codex, cursor, claude-code)

**Options**:

- `--dry-run`: Preview installation without writing files
- `--force`: Overwrite existing installation
- `--version <version>`: Install specific version

**Success Response** (exit code 0):

```
✅ Successfully installed /rampante for Gemini CLI
   Location: ~/.gemini/commands/rampante.toml
   Version: 0.2.0

   Test with: /rampante --help
```

**Error Responses**:

- Exit code 1: CLI not found or unsupported
- Exit code 2: Permission denied
- Exit code 3: Download/extraction failed
- Exit code 4: Template validation failed

### list

**Purpose**: Show supported CLIs and installation status

**Usage**:

```bash
deno run -A --reload jsr:@page-carbajal/rampante list
```

**Response Format**:

```
Rampante Status Report:

  Supported AI CLIs:
  ✅ gemini      - Installed v0.2.0 (~/.gemini/commands/rampante.toml)
  ❌ codex       - Not installed
  ⚠️  cursor     - CLI detected, not installed
  ❓ claude-code - CLI not detected

  Latest Version: 0.2.0
  Installed CLIs: 1/4
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
   Removed: ~/.gemini/commands/rampante.toml
```

### preview

**Purpose**: Show what Spec Kit workflow would generate (dry-run mode)

**Usage**:

```bash
deno run -A --reload jsr:@page-carbajal/rampante preview "Build user authentication"
```

**Response Format** (Markdown):

````markdown
# PREVIEW: Rampante Workflow

## Input

"Build user authentication"

## /specify Command

```text
Build user authentication
```
````

## /plan Command

```text
/specs/003-user-auth/spec.md
```

## /tasks Command

```text
/specs/003-user-auth/plan.md
```

## Estimated Output Files

- /specs/003-user-auth/spec.md
- /specs/003-user-auth/plan.md
- /specs/003-user-auth/tasks.md
- /specs/003-user-auth/research.md
- /specs/003-user-auth/data-model.md
- /specs/003-user-auth/quickstart.md

````

### execute
**Purpose**: Run complete Spec Kit workflow automatically

**Usage**:
```bash
deno run -A --reload jsr:@page-carbajal/rampante execute "Build user authentication"
````

**Response Format**:

```
🚀 Starting Spec Kit workflow...

✅ /specify completed - Generated: /specs/003-user-auth/spec.md
✅ /plan completed - Generated: /specs/003-user-auth/plan.md
✅ /tasks completed - Generated: /specs/003-user-auth/tasks.md

🎉 Workflow completed successfully!

Generated Files:
- /specs/003-user-auth/spec.md
- /specs/003-user-auth/plan.md
- /specs/003-user-auth/tasks.md
- /specs/003-user-auth/research.md
- /specs/003-user-auth/data-model.md
- /specs/003-user-auth/quickstart.md

Next Steps:
- Review generated specification
- Execute tasks from tasks.md
```

## Global Options

- `--help`: Show help information
- `--version`: Show version information
- `--verbose`: Enable detailed logging

## Error Handling

### Prerequisites Validation

```
ERROR: Spec Kit not detected in current directory

Required directories missing: /scripts/, /templates/, /memory/
Install Spec Kit: uvx --from git+https://github.com/Page-Carbajal/spec-kit specify init <project>
```

### Installation Errors

```
ERROR: Permission denied writing to ~/.gemini/commands/
       Try: chmod 755 ~/.gemini/commands/

ERROR: Failed to download package for 'gemini'
       Check internet connection and try again

ERROR: Template validation failed
       Package may be corrupted, try: --force flag to reinstall
```

### Execution Errors

```
ERROR: /specify command failed
       Spec Kit error: [original error message]

ERROR: Workflow interrupted at /plan step
       Partial files generated - see above for cleanup commands
```

## Exit Codes

- 0: Success
- 1: Invalid usage or unsupported operation
- 2: File system permission error
- 3: Network/download error
- 4: Template/package validation error
- 5: Spec Kit integration error
