/**
 * Rampante command registration service
 * 
 * Handles registration of the /rampante command with different CLI targets:
 * - Codex: Copy rampante.md to ~/.codex/prompts/rampante.md
 * 
 * Future phases will support Claude Code, Gemini, etc.
 */

import { join } from '@std/path';
import { safeCopyFile, ensureDirExists, pathExists, expandHome } from '../lib/fs_utils.ts';
import { logger, RampanteError, ErrorHandler } from '../lib/logger.ts';

/**
 * Register rampante command with the specified CLI target
 */
export async function registerRampante(cliTarget: string): Promise<void> {
  const registerLogger = logger.scope("Register");
  
  return await ErrorHandler.withContext(
    async () => {
      registerLogger.debug(`Registering rampante command with ${cliTarget}`);
      
      switch (cliTarget) {
        case 'codex':
          await registerWithCodex();
          registerLogger.success(`Rampante command registered with ${cliTarget}`);
          break;
        default:
          throw new RampanteError(
            `Unsupported CLI target for registration: ${cliTarget}`,
            "UNSUPPORTED_CLI_TARGET",
            { cliTarget, supportedTargets: ["codex"] }
          );
      }
    },
    `Failed to register rampante command with ${cliTarget}`,
    registerLogger,
  );
}

/**
 * Register rampante command with Codex CLI
 * Copies rampante.md to ~/.codex/prompts/rampante.md
 */
async function registerWithCodex(): Promise<void> {
  const registerLogger = logger.scope("CodexRegister");
  const cwd = Deno.cwd();
  const sourceFile = join(cwd, 'rampante', 'command', 'rampante.md');
  const targetDir = expandHome('~/.codex/prompts');
  const targetFile = join(targetDir, 'rampante.md');
  
  return await ErrorHandler.withContext(
    async () => {
      registerLogger.debug(`Copying ${sourceFile} to ${targetFile}`);
      
      // Verify source file exists
      if (!await pathExists(sourceFile)) {
        throw new RampanteError(
          `Source rampante.md not found at ${sourceFile}. Run asset installation first.`,
          "SOURCE_FILE_MISSING",
          { sourceFile, expectedLocation: sourceFile }
        );
      }
      
      // Ensure target directory exists
      await ensureDirExists(targetDir);
      
      // Copy the file (always overwrite for registration)
      await safeCopyFile(sourceFile, targetFile, { force: true });
      
      registerLogger.info("Rampante command file copied to Codex prompts directory");
    },
    "Failed to register with Codex",
    registerLogger,
  );
}

/**
 * Get the registration path for a given CLI target
 */
export function getRegistrationPath(cliTarget: string): string {
  switch (cliTarget) {
    case 'codex':
      return expandHome('~/.codex/prompts/rampante.md');
    default:
      throw new RampanteError(
        `Unknown CLI target: ${cliTarget}`,
        "UNKNOWN_CLI_TARGET",
        { cliTarget, supportedTargets: ["codex"] }
      );
  }
}

/**
 * Verify rampante command registration exists
 */
export async function verifyRegistration(cliTarget: string): Promise<boolean> {
  try {
    const registrationPath = getRegistrationPath(cliTarget);
    return await pathExists(registrationPath);
  } catch {
    return false;
  }
}

/**
 * Get list of supported CLI targets for registration
 */
export function getSupportedTargets(): string[] {
  return ['codex'];
}