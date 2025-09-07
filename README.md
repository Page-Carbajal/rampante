![RAMPANTE SLASH COMMAND](assets/images/slash-rampante.png)

# `/RAMPANTE`

A YOLO approach to GitHub Spec Kit - The AI agent orchestrator for spec-driven development workflow.

## Overview

Rampante is a multi-CLI slash command system that automates the complete spec-driven development workflow. It intelligently selects technology stacks, fetches up-to-date documentation, and orchestrates the execution of `/specify`, `/plan`, and `/tasks` commands to generate comprehensive project specifications and implementation plans.

**Phase 1** supports: **Codex CLI** (Phase 2 will add Claude Code and Gemini support)

## Installation

### Quick Start

```bash
# Install for Codex CLI (choose one of the following methods)

# Option 1: From JSR (after publishing)
deno run -A --reload jsr:@page-carbajal/rampante/cli install codex

# Option 2: Directly from GitHub
deno run -A https://raw.githubusercontent.com/YOUR_USERNAME/rampante/main/cli.ts install codex

# Option 3: From deno.land (after publishing)
deno run -A https://deno.land/x/rampante/cli.ts install codex
```

### Installation Options

```bash
# Basic installation (idempotent)
deno run --allow-all src/cli/install.ts install codex

# Force reinstall (recreates all assets)
deno run --allow-all src/cli/install.ts install codex --force

# Debug mode (verbose logging)
deno run --allow-all src/cli/install.ts install codex --debug

# Help and options
deno run --allow-all src/cli/install.ts install codex --help
```

### CLI Flags

- **`--force`** (`-f`): Recreate all assets, overwriting existing files
- **`--debug`** (`-d`): Enable detailed debug logging for troubleshooting
- **`--help`** (`-h`): Show comprehensive usage information

### Prerequisites

- **Deno v2.4+**: Required runtime environment
- **Network Access**: For context7 MCP integration via `npx @upstash/context7-mcp`
- **API Key**: Context7 API key for documentation fetching

## What Gets Installed

### Local Project Assets (in current directory)

- **`/recommended-stacks/`**: Technology stack definitions and templates
  - `DEFINITIONS.md` - Stack catalog with priorities and tags
  - 8 predefined stack files (REACT_SPA, CLI_TOOL, PYTHON_API, etc.)
- **`/rampante/command/`**: Slash command definition
  - `rampante.md` - Complete workflow orchestrator
- **`/scripts/`**: Helper utilities
  - `select-stack.sh` - YOLO stack selection logic
  - `generate-project-overview.sh` - Project summary generator

### Global Configuration (Codex CLI)

- **`~/.codex/config.toml`**: Context7 MCP server configuration
- **`~/.codex/prompts/rampante.md`**: Registered slash command

## Usage

### Basic Workflow

```bash
# From your Codex CLI
/rampante "build a user authentication system with React frontend"
```

### Complete 7-Phase Execution

1. **Stack Selection**: Analyzes prompt, selects optimal technology stack using YOLO strategy
2. **Context Loading**: Loads stack-specific configuration and requirements
3. **Documentation Retrieval**: Fetches latest documentation via context7 MCP
4. **Specification**: Generates detailed feature specification (`spec.md`)
5. **Planning**: Creates implementation plan with design artifacts (`plan.md`, `data-model.md`, contracts)
6. **Task Generation**: Produces ordered task list with dependencies (`tasks.md`)
7. **Overview Generation**: Creates AI-friendly project summary (`specs/PROJECT-OVERVIEW.md`)

### Expected Results

After successful execution, you'll have:

- **Feature branch** created (if needed)
- **Complete specification** in `specs/<feature>/spec.md`
- **Implementation plan** in `specs/<feature>/plan.md`
- **Data model** documentation in `specs/<feature>/data-model.md`
- **API contracts** in `specs/<feature>/contracts/`
- **Task breakdown** in `specs/<feature>/tasks.md`
- **Project overview** in `specs/PROJECT-OVERVIEW.md` (always overwrites)

### Performance

- **Total Duration**: ~2.5-4 minutes for complete workflow
- **Documentation Phase**: ~30-60 seconds (depends on selected technologies)
- **Local Operations**: ~30 seconds total for all other phases

## Stack Selection (YOLO Strategy)

Rampante uses an intelligent "YOLO" (You Only Look Once) approach for stack selection:

### Available Stacks

- **SIMPLE_WEB_APP** (Priority 1) - Basic web applications
- **REACT_SPA** (Priority 2) - Modern single-page applications
- **CLI_TOOL** (Priority 3) - Command-line utilities
- **PYTHON_API** (Priority 4) - Python-based REST APIs
- **FULL_STACK_NODE** (Priority 5) - Complete Node.js applications
- **GITHUB-WORKFLOWS** (Priority 9) - CI/CD with GitHub Actions
- **And more...** (9 total predefined stacks)

### Selection Logic

1. **Tag Matching**: Matches keywords in your prompt against stack tags
2. **Priority Ranking**: Lower priority numbers win in ties
3. **Deterministic Tie-Breaking**: Uses order in DEFINITIONS.md for final ties
4. **Fallback Strategy**: Selects most general-purpose stack if no matches found

### Manual Stack Override

You can bypass automatic selection by specifying a stack manually:

```bash
/rampante --use-stack REACT_SPA "Build a dashboard"
```

This forces the use of the REACT_SPA stack regardless of prompt content.

### Stack Selection Transparency

Rampante now provides clear feedback about stack selection:
- **Which stack was selected** and its priority level
- **Why it was selected** (matched tags, manual override, or fallback)
- **What technologies** will be documented via Context7

Example output:
```
Stack Selection Result:
- Selected: REACT_SPA
- Reason: matched tags: react
- Priority: 2
- Technologies: React, React Router, React Query
- Tags: web, frontend, react, spa, javascript, typescript
```

### Context7 Documentation Filtering

Documentation retrieval is now strictly limited to technologies defined in the selected stack:
- **Only stack technologies** are documented via Context7
- **No external technologies** are fetched outside the stack definition
- **Clear reporting** of which technologies were successfully documented

Example output:
```
Context7 Documentation Summary:
- Stack Technologies: 3 technologies from REACT_SPA
- Successfully Documented: 3 technologies
- Technologies: React, React Router, React Query
- Failed to Document: (none)
```

## Troubleshooting

### Common Issues

**Installation Fails**:

```bash
# Check Deno version
deno --version

# Run with debug mode
deno run --allow-all src/cli/install.ts install codex --debug
```

**Context7 Unavailable**:

```bash
# Verify network connectivity
ping api.upstash.com

# Check config file exists
cat ~/.codex/config.toml
```

**Command Not Found After Installation**:

```bash
# Verify registration
ls ~/.codex/prompts/rampante.md

# Reinstall with force
deno run --allow-all src/cli/install.ts install codex --force
```

### Debug Mode

Enable debug logging to see detailed execution:

```bash
deno run --allow-all src/cli/install.ts install codex --debug
```

Debug output includes:

- File creation/copying operations
- Directory structure validation
- Configuration file modifications
- Registration status and paths
- Error context and recovery suggestions

## Idempotency

Rampante is designed for safe re-execution:

- **Default behavior**: Adds only missing files, preserves existing content
- **Force mode**: Completely recreates all assets
- **Smart detection**: Skips operations that have already been completed

## Development

### Project Structure

```
src/
├── cli/           # CLI entry points
├── services/      # Core installation services
├── lib/           # Shared utilities and helpers
└── tests/         # Comprehensive test suite

rampante/
├── command/       # Slash command definitions
└── scripts/       # Workflow execution scripts

recommended-stacks/ # Technology stack definitions
```

### Testing

```bash
# Run all tests
deno test --allow-all

# Run specific test suites
deno test --allow-all tests/unit/
deno test --allow-all tests/integration/
deno test --allow-all tests/contract/
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Follow TDD principles: Write tests first
4. Implement your changes
5. Ensure all tests pass: `deno test --allow-all`
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
