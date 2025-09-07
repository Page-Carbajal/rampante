/**
 * Assets installer service
 *
 * Handles installation of:
 * - /rampante/command/rampante.md
 * - /recommended-stacks directory with DEFINITIONS.md and stack files
 *
 * Supports idempotent operations and --force flag
 */

import { join } from "@std/path";
import { safeWriteFile, ensureDirExists, safeRemove } from "../lib/fs_utils.ts";
import { logger, RampanteError, ErrorHandler } from "../lib/logger.ts";

/**
 * Install all required assets in current directory
 */
export async function installAssets(force = false): Promise<void> {
  const cwd = Deno.cwd();
  const assetLogger = logger.scope("Assets");

  return await ErrorHandler.withContext(
    async () => {
      assetLogger.debug(`Installing assets in ${cwd}, force=${force}`);

      // If force is true, remove existing directories first
      if (force) {
        assetLogger.info("Force mode enabled, removing existing assets...");
        await safeRemove(join(cwd, "rampante"));
        await safeRemove(join(cwd, "recommended-stacks"));
      }

      // Install rampante command file
      await installRampanteCommand(cwd, force);

      // Install recommended stacks
      await installRecommendedStacks(cwd, force);

      assetLogger.success("All assets installed successfully");
    },
    "Failed to install assets",
    assetLogger,
  );
}

/**
 * Install the rampante.md command file
 */
async function installRampanteCommand(
  cwd: string,
  force: boolean,
): Promise<void> {
  const assetLogger = logger.scope("RampanteCommand");
  const rampanteDir = join(cwd, "rampante", "command");
  const rampanteFile = join(rampanteDir, "rampante.md");

  return await ErrorHandler.withContext(
    async () => {
      assetLogger.debug(`Installing rampante command to ${rampanteFile}`);

      // Ensure directory exists
      await ensureDirExists(rampanteDir);

      // Get the repository root (where this script is running from)
      // We need to find the rampante.md template
      const currentScriptPath = new URL(import.meta.url).pathname;
      const repoRoot = currentScriptPath.split("/src/services/")[0];
      const templatePath = join(repoRoot, "rampante", "command", "rampante.md");

      assetLogger.debug(`Reading template from ${templatePath}`);

      // Read the template from the repository
      const templateContent = await Deno.readTextFile(templatePath);

      // Write the file (always write to CWD, this is the installation)
      await safeWriteFile(rampanteFile, templateContent, { force });

      assetLogger.info("Rampante command file installed");
    },
    `Failed to install rampante command template`,
    assetLogger,
  );
}

/**
 * Install recommended stacks directory and files
 */
async function installRecommendedStacks(
  cwd: string,
  force: boolean,
): Promise<void> {
  const assetLogger = logger.scope("RecommendedStacks");
  const stacksDir = join(cwd, "recommended-stacks");

  return await ErrorHandler.withContext(
    async () => {
      assetLogger.debug(`Installing recommended stacks to ${stacksDir}`);

      // Ensure directory exists
      await ensureDirExists(stacksDir);

      // Get the repository root (where this script is running from)
      const currentScriptPath = new URL(import.meta.url).pathname;
      const repoRoot = currentScriptPath.split("/src/services/")[0];
      const sourceStacksDir = join(repoRoot, "recommended-stacks");

      assetLogger.debug(`Reading stacks from ${sourceStacksDir}`);

      // Install DEFINITIONS.md
      const definitionsSource = join(sourceStacksDir, "DEFINITIONS.md");
      const definitionsContent = await Deno.readTextFile(definitionsSource);
      const definitionsTarget = join(stacksDir, "DEFINITIONS.md");

      await safeWriteFile(definitionsTarget, definitionsContent, { force });
      assetLogger.info("Installed DEFINITIONS.md");

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

      let installedCount = 0;
      for (const stackFile of stackFiles) {
        const sourceFile = join(sourceStacksDir, stackFile);
        const targetFile = join(stacksDir, stackFile);

        try {
          const stackContent = await Deno.readTextFile(sourceFile);
          await safeWriteFile(targetFile, stackContent, { force });
          installedCount++;
          assetLogger.debug(`Installed ${stackFile}`);
        } catch (error) {
          // Stack file doesn't exist - skip it with a warning
          assetLogger.warn(`Stack file ${stackFile} not found, skipping...`);
        }
      }

      assetLogger.info(`Installed ${installedCount} stack definition files`);
    },
    "Failed to install recommended stacks",
    assetLogger,
  );
}
