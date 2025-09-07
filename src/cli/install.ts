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

import { parse as parseArgs } from "@std/flags";
import { installAssets } from "../services/install_assets.ts";
import { configureContext7 } from "../services/context7_config.ts";
import { registerRampante } from "../services/register_rampante.ts";
import { installScripts } from "../services/install_scripts.ts";
import { Logger, ErrorHandler } from "../lib/logger.ts";

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
  --force   - Recreate all assets (default: idempotent)
  --debug   - Enable debug logging
  --help    - Show this help message

Examples:
  deno run npm:run-rampante install codex
  deno run npm:run-rampante install codex --force
  deno run npm:run-rampante install codex --debug
`);
}

function showError(message: string, logger: Logger): never {
  logger.error(message);
  Deno.exit(1);
}

function validateArgs(args: CliArgs, logger: Logger) {
  if (args.help) {
    showUsage();
    Deno.exit(0);
  }

  // Expected format: ['install', '<cli>']
  if (args._.length < 2) {
    showError("Missing CLI target. Use --help for usage.", logger);
  }

  if (args._[0] !== "install") {
    showError('First argument must be "install"', logger);
  }

  const cliTarget = args._[1] as string;
  if (!SUPPORTED_CLIS.includes(cliTarget)) {
    showError(
      `CLI target "${cliTarget}" not yet supported. Phase 1 supports: ${SUPPORTED_CLIS.join(", ")}`,
      logger
    );
  }

  return {
    command: args._[0] as string,
    cliTarget,
    force: args.force || false,
  };
}

async function main() {
  // Create logger - check for debug flag in args first
  const hasDebug = Deno.args.includes("--debug") || Deno.args.includes("-d");
  const logger = new Logger({ debug: hasDebug });
  
  try {
    const args = parseArgs(Deno.args, {
      boolean: ["force", "help", "debug"],
      alias: {
        f: "force",
        h: "help",
        d: "debug",
      },
    }) as CliArgs & { debug?: boolean };

    const { cliTarget, force } = validateArgs(args, logger);

    logger.info(`Installing Rampante for ${cliTarget}...`);
    if (force) {
      logger.warn("Force mode enabled - existing files will be overwritten");
    }

    // Step 1: Install assets (rampante.md, recommended-stacks)
    logger.info("Installing assets...");
    await installAssets(force);

    // Step 2: Install required scripts (select-stack.sh, generate-project-overview.sh)
    logger.info("Installing scripts...");
    await installScripts(force);

    // Step 3: Configure context7 for the target CLI
    logger.info("Configuring context7...");
    await configureContext7(cliTarget);

    // Step 4: Register rampante command with target CLI
    logger.info("Registering rampante command...");
    await registerRampante(cliTarget);

    logger.success(`Rampante successfully installed for ${cliTarget}`);
    logger.info("You can now use the /rampante command in your CLI");
  } catch (error) {
    ErrorHandler.handleCliError(error, logger);
  }
}

// Only run main if this script is executed directly
if (import.meta.main) {
  await main();
}

export { main };
