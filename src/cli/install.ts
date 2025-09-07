#!/usr/bin/env -S deno run --allow-all

/**
 * Rampante Installer CLI
 *
 * Entry point for `deno run npm:run-rampante install <cli>`
 * Phase 1 supports: codex
 *
 * Usage:
 *   deno run npm:run-rampante install codex
 *   deno run npm:run-rampante install codex --force
 */

import { parse as parseArgs } from "https://deno.land/std@0.208.0/flags/mod.ts";
import { installAssets } from "../services/install_assets.ts";
import { configureContext7 } from "../services/context7_config.ts";
import { registerRampante } from "../services/register_rampante.ts";
import { installScripts } from "../services/install_scripts.ts";

const SUPPORTED_CLIS = ["codex"];

interface CliArgs {
  _: string[];
  force?: boolean;
  help?: boolean;
}

function showUsage() {
  console.log(`
Rampante Installer CLI

Usage:
  deno run npm:run-rampante install <cli> [options]

Supported CLIs (Phase 1):
  codex    - Install for OpenAI Codex CLI

Options:
  --force  - Recreate all assets (default: idempotent)
  --help   - Show this help message

Examples:
  deno run npm:run-rampante install codex
  deno run npm:run-rampante install codex --force
`);
}

function showError(message: string): never {
  console.error(`Error: ${message}`);
  Deno.exit(1);
}

function validateArgs(args: CliArgs) {
  if (args.help) {
    showUsage();
    Deno.exit(0);
  }

  // Expected format: ['install', '<cli>']
  if (args._.length < 2) {
    showError("Missing CLI target. Use --help for usage.");
  }

  if (args._[0] !== "install") {
    showError('First argument must be "install"');
  }

  const cliTarget = args._[1] as string;
  if (!SUPPORTED_CLIS.includes(cliTarget)) {
    showError(
      `CLI target "${cliTarget}" target not yet supported. Phase 1 supports: ${SUPPORTED_CLIS.join(", ")}`,
    );
  }

  return {
    command: args._[0] as string,
    cliTarget,
    force: args.force || false,
  };
}

async function main() {
  try {
    const args = parseArgs(Deno.args, {
      boolean: ["force", "help"],
      alias: {
        f: "force",
        h: "help",
      },
    }) as CliArgs;

    const { cliTarget, force } = validateArgs(args);

    console.log(`Installing Rampante for ${cliTarget}...`);

    // Step 1: Install assets (rampante.md, recommended-stacks)
    console.log("Installing assets...");
    await installAssets(force);

    // Step 2: Install required scripts (select-stack.sh, generate-project-overview.sh)
    console.log("Installing scripts...");
    await installScripts(force);

    // Step 3: Configure context7 for the target CLI
    console.log("Configuring context7...");
    await configureContext7(cliTarget);

    // Step 4: Register rampante command with target CLI
    console.log("Registering rampante command...");
    await registerRampante(cliTarget);

    console.log(`✅ Rampante successfully installed for ${cliTarget}`);
    console.log("You can now use the /rampante command in your CLI");
  } catch (error) {
    const err = error as Error;
    console.error(`Error: ${err.message}`);
    Deno.exit(1);
  }
}

// Only run main if this script is executed directly
if (import.meta.main) {
  await main();
}

export { main };
