#!/usr/bin/env -S deno run --allow-read --allow-write
/**
 * Rampante Command Updater (scaffold)
 *
 * Purpose: Backup the existing rampante command definition and write a
 * simplified version that removes stack selection. This scaffold only
 * provides the CLI surface and help output; implementation will be added
 * in subsequent tasks (see specs/002-feature-simplify-rampant/tasks.md).
 */

function printHelp() {
  console.log(`Rampante Command Updater (scaffold)

Usage:
  deno run --allow-read --allow-write src/cli/update_rampante_command.ts [options]

Options:
  --help           Show this help message and exit

Description:
  Creates a timestamped backup of rampante/command/rampante.md and writes a
  simplified orchestrator definition without stack selection. This scaffold
  currently prints help only. Implementation will be added in later tasks.
`);
}

if (import.meta.main) {
  const args = new Set(Deno.args);
  if (args.has("--help") || args.size === 0) {
    printHelp();
    Deno.exit(0);
  }

  console.error("ERROR: Not implemented yet. See tasks in specs/002-feature-simplify-rampant/tasks.md");
  Deno.exit(2);
}

