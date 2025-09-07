/**
 * Assets installer service
 *
 * Handles installation of:
 * - /rampante/command/rampante.md
 * - /recommended-stacks directory with DEFINITIONS.md and stack files
 *
 * Supports idempotent operations and --force flag
 */

import { join } from "https://deno.land/std@0.208.0/path/mod.ts";
import { safeWriteFile, ensureDirExists, safeRemove } from "../lib/fs_utils.ts";

/**
 * Install all required assets in current directory
 */
export async function installAssets(force = false): Promise<void> {
  const cwd = Deno.cwd();

  try {
    // If force is true, remove existing directories first
    if (force) {
      await safeRemove(join(cwd, "rampante"));
      await safeRemove(join(cwd, "recommended-stacks"));
    }

    // Install rampante command file
    await installRampanteCommand(cwd, force);

    // Install recommended stacks
    await installRecommendedStacks(cwd, force);
  } catch (error) {
    const err = error as Error;
    throw new Error(`Failed to install assets: ${err.message}`);
  }
}

/**
 * Install the rampante.md command file
 */
async function installRampanteCommand(
  cwd: string,
  force: boolean,
): Promise<void> {
  const rampanteDir = join(cwd, "rampante", "command");
  const rampanteFile = join(rampanteDir, "rampante.md");

  // Ensure directory exists
  await ensureDirExists(rampanteDir);

  // Get the repository root (where this script is running from)
  // We need to find the rampante.md template
  const currentScriptPath = new URL(import.meta.url).pathname;
  const repoRoot = currentScriptPath.split("/src/services/")[0];
  const templatePath = join(repoRoot, "rampante", "command", "rampante.md");

  try {
    // Read the template from the repository
    const templateContent = await Deno.readTextFile(templatePath);

    // Write the file (always write to CWD, this is the installation)
    await safeWriteFile(rampanteFile, templateContent, { force });
  } catch (error) {
    const err = error as Error;
    throw new Error(
      `Rampante command template not found at ${templatePath}: ${err.message}`,
    );
  }
}

/**
 * Install recommended stacks directory and files
 */
async function installRecommendedStacks(
  cwd: string,
  force: boolean,
): Promise<void> {
  const stacksDir = join(cwd, "recommended-stacks");

  // Ensure directory exists
  await ensureDirExists(stacksDir);

  // Get the repository root (where this script is running from)
  const currentScriptPath = new URL(import.meta.url).pathname;
  const repoRoot = currentScriptPath.split("/src/services/")[0];
  const sourceStacksDir = join(repoRoot, "recommended-stacks");

  try {
    // Install DEFINITIONS.md
    const definitionsSource = join(sourceStacksDir, "DEFINITIONS.md");
    const definitionsContent = await Deno.readTextFile(definitionsSource);
    const definitionsTarget = join(stacksDir, "DEFINITIONS.md");

    await safeWriteFile(definitionsTarget, definitionsContent, { force });

    // Install all stack files from the repository
    const stackFiles = [
      "CLI_TOOL.md",
      "FULL_STACK_NODE.md",
      "MOBILE_REACT_NATIVE.md",
      "PYTHON_API.md",
      "REACT_SPA.md",
      "SERVERLESS_FUNCTIONS.md",
      "SIMPLE_WEB_APP.md",
      "STATIC_SITE.md",
    ];

    for (const stackFile of stackFiles) {
      const sourceFile = join(sourceStacksDir, stackFile);
      const targetFile = join(stacksDir, stackFile);

      try {
        const stackContent = await Deno.readTextFile(sourceFile);
        await safeWriteFile(targetFile, stackContent, { force });
      } catch (error) {
        // Stack file doesn't exist - skip it with a warning
        console.warn(`Warning: Stack file ${stackFile} not found, skipping...`);
      }
    }
  } catch (error) {
    const err = error as Error;
    throw new Error(`Failed to install recommended stacks: ${err.message}`);
  }
}
