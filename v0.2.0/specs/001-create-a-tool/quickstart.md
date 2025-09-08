# Quickstart: Rampante CLI-Agnostic Installer

## Prerequisites

- Deno installed on your system
- At least one supported AI CLI (Gemini, Codex, Cursor, Claude Code)
- Existing project with Spec Kit installed

## Quick Start

### 1. Install Rampante for Your AI CLI

**For Gemini CLI**:

```bash
deno run -A --reload jsr:@page-carbajal/rampante install-for gemini
```

**For Codex**:

```bash
deno run -A --reload jsr:@page-carbajal/rampante install-for codex
```

**For Multiple CLIs**:

```bash
deno run -A --reload jsr:@page-carbajal/rampante install-for gemini
deno run -A --reload jsr:@page-carbajal/rampante install-for codex
deno run -A --reload jsr:@page-carbajal/rampante install-for cursor
```

### 2. Verify Installation

```bash
deno run -A --reload jsr:@page-carbajal/rampante list
```

Expected output:

```
Supported AI CLIs:
  ✅ gemini    - Installed (/Users/user/.gemini/commands/rampante.toml)
  ❌ codex     - Not installed
  ❌ cursor    - Not installed
  ❓ claude-code - Not detected
```

### 3. Test the Slash Command

**Navigate to a Spec Kit project**:

```bash
cd /path/to/your/spec-kit-project
```

**Open your AI CLI and test**:

```
/rampante --dry-run "Add user authentication"
```

**Expected result**: Preview of what `/specify`, `/plan`, and `/tasks` would generate

### 4. Run Full Workflow

```
/rampante "Add user authentication"
```

**Expected result**: Complete Spec Kit workflow execution

## Integration Test Scenarios

### Scenario 1: Fresh Installation

**Given**: Clean system with no previous Rampante installation
**When**: Install for Gemini CLI
**Then**:

- `/rampante` command available in Gemini
- Dry-run shows proper preview format
- Normal mode executes Spec Kit workflow

**Validation Steps**:

1. `deno run -A --reload jsr:@page-carbajal/rampante install-for gemini`
2. Open Gemini CLI in Spec Kit project
3. Run `/rampante --help` (should work)
4. Run `/rampante --dry-run "test feature"`
5. Verify preview format matches contract

### Scenario 2: Multi-CLI Installation

**Given**: System with multiple AI CLIs
**When**: Install Rampante for all CLIs
**Then**: Each CLI has functional `/rampante` command

**Validation Steps**:

1. Install for each CLI: `install-for gemini codex cursor`
2. Test `/rampante` in each CLI environment
3. Verify identical behavior across CLIs

### Scenario 3: Dry-Run Preview

**Given**: Rampante installed and Spec Kit project ready
**When**: Run `/rampante --dry-run "Build a todo app"`
**Then**: Receive structured preview without file creation

**Expected Preview**:

````markdown
# DRY RUN: /rampante

## Summary

- Commands: [/specify, /plan, /tasks]

## /specify

```text
Build a todo app
```
````

## /plan

```text
/specs/[feature-name]/spec.md
```

## /tasks

```text
/specs/[feature-name]/plan.md
```

```

### Scenario 4: Full Workflow Execution
**Given**: Spec Kit project with `/rampante` installed
**When**: Run `/rampante "Implement user profiles"`
**Then**: Complete spec → plan → tasks workflow

**Validation Steps**:
1. Capture initial directory state
2. Run `/rampante "Implement user profiles"`
3. Verify files created:
   - `/specs/###-implement-user/spec.md`
   - `/specs/###-implement-user/plan.md`
   - `/specs/###-implement-user/tasks.md`
4. Verify content quality and completeness

### Scenario 5: Error Handling
**Given**: Directory without Spec Kit
**When**: Run `/rampante "any prompt"`
**Then**: Clear error message about missing Spec Kit

**Expected Error**:
```

❌ ERROR: Spec Kit not found in current directory

Required: /scripts/, /templates/, /memory/ directories
Install: uvx --from git+https://github.com/Page-Carbajal/spec-kit specify init <project>

````

## Troubleshooting

### Permission Issues
```bash
# Fix Gemini CLI permissions
chmod 755 ~/.gemini/commands/
````

### Template Not Working

```bash
# Reinstall with force flag
deno run -A --reload jsr:@page-carbajal/rampante install-for gemini --force
```

### Clean Uninstall

```bash
# Remove from specific CLI
deno run -A --reload jsr:@page-carbajal/rampante uninstall gemini

# Or remove files manually
rm ~/.gemini/commands/rampante.toml
```

## Performance Expectations

- Installation: < 5 seconds
- Dry-run preview: < 2 seconds
- Full workflow: Depends on Spec Kit performance
- Memory usage: < 50MB peak
