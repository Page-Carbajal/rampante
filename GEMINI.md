# Gemini Code Assist Context

This document provides context for the Gemini Code Assist AI to understand the Rampante project.

## Project Overview

Rampante is a multi-CLI slash command system that automates the spec-driven development workflow. It orchestrates the execution of `/specify`, `/plan`, and `/tasks` commands to generate comprehensive project specifications and implementation plans. The simplified orchestrator removes stack selection and live documentation retrieval.

The project is built with Deno and TypeScript.

## Building and Running

### Deno Tasks

The `deno.json` file defines the following tasks:

*   `deno task dev`: Run the main CLI script.
*   `deno task test`: Run all tests.
*   `deno task test:contract`: Run contract tests.
*   `deno task test:integration`: Run integration tests.
*   `deno task test:unit`: Run unit tests.
*   `deno task test:performance`: Run performance tests.
*   `deno task lint`: Lint the codebase.
*   `deno task fmt`: Format the codebase.
*   `deno task check`: Type-check the main CLI script.

### Running the CLI

The main entry point for the CLI is `src/cli/main.ts`. You can run it with:

```bash
deno run -A src/cli/main.ts
```

## Development Conventions

### Formatting

The project uses `deno fmt` for code formatting. The configuration is in `deno.json`:

*   `useTabs`: false
*   `lineWidth`: 100
*   `indentWidth`: 2
*   `semiColons`: true
*   `singleQuote`: false
*   `proseWrap`: "preserve"

### Linting

The project uses `deno lint` with the recommended rules.

### Testing

The project has a comprehensive test suite with unit, integration, and contract tests. All tests can be run with `deno task test`.

### Project Structure

*   `src/`: Contains the main source code.
    *   `cli/`: CLI entry points.
    *   `services/`: Core installation services.
    *   `lib/`: Shared utilities and helpers.
*   `tests/`: Contains the test suite.
    *   `contract/`: Contract tests.
    *   `integration/`: Integration tests.
    *   `unit/`: Unit tests.
