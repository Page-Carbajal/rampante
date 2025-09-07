/**
 * Script installation service
 * 
 * Handles installation of required scripts from /rampante/scripts/ to ./scripts/
 * - select-stack.sh
 - generate-project-overview.sh
 * 
 * Supports idempotent operations and --force flag
 */

import { join } from '@std/path';
import { ensureDirExists, safeWriteFile, pathExists } from '../lib/fs_utils.ts';
import { logger, RampanteError, ErrorHandler } from '../lib/logger.ts';

const REQUIRED_SCRIPTS = [
  'select-stack.sh',
  'generate-project-overview.sh',
];

/**
 * Install required scripts in current directory
 */
export async function installScripts(force = false): Promise<void> {
  const cwd = Deno.cwd();
  const scriptsDir = join(cwd, 'scripts');
  const scriptsLogger = logger.scope("Scripts");
  
  return await ErrorHandler.withContext(
    async () => {
      scriptsLogger.debug(`Installing scripts to ${scriptsDir}, force=${force}`);
      
      // Ensure scripts directory exists
      await ensureDirExists(scriptsDir);
      
      // Get the repository root (where this script is running from)
      const currentScriptPath = new URL(import.meta.url).pathname;
      const repoRoot = currentScriptPath.split('/src/services/')[0];
      const sourceScriptsDir = join(repoRoot, 'rampante', 'scripts');
      
      scriptsLogger.debug(`Reading scripts from ${sourceScriptsDir}`);
      
      // Install each required script
      let installedCount = 0;
      for (const scriptName of REQUIRED_SCRIPTS) {
        const wasInstalled = await installScript(scriptsDir, sourceScriptsDir, scriptName, force);
        if (wasInstalled) {
          installedCount++;
        }
      }
      
      scriptsLogger.success(`Installed ${installedCount}/${REQUIRED_SCRIPTS.length} scripts`);
    },
    "Failed to install scripts",
    scriptsLogger,
  );
}

/**
 * Install a single script file
 */
async function installScript(
  targetDir: string,
  sourceDir: string,
  scriptName: string,
  force: boolean
): Promise<boolean> {
  const scriptsLogger = logger.scope("ScriptInstall");
  const sourcePath = join(sourceDir, scriptName);
  const targetPath = join(targetDir, scriptName);
  
  return await ErrorHandler.withContext(
    async () => {
      scriptsLogger.debug(`Installing ${scriptName} from ${sourcePath} to ${targetPath}`);
      
      // Check if file already exists and we're not forcing
      if (!force && await pathExists(targetPath)) {
        scriptsLogger.info(`${scriptName} already exists, skipping`);
        return false;
      }
      
      // Read the template script from the repository
      const scriptContent = await Deno.readTextFile(sourcePath);
      
      // Write the script file
      await safeWriteFile(targetPath, scriptContent, { force });
      
      // Make the script executable (Unix-like systems)
      try {
        await Deno.chmod(targetPath, 0o755);
        scriptsLogger.debug(`Made ${scriptName} executable`);
      } catch (error) {
        // chmod might not be supported on all platforms, continue anyway
        scriptsLogger.warn(`Could not make ${scriptName} executable: ${error}`);
      }
      
      scriptsLogger.info(`Installed ${scriptName}`);
      return true;
    },
    `Failed to install script ${scriptName}`,
    scriptsLogger,
  );
}

/**
 * Verify all required scripts are installed and executable
 */
export async function verifyScripts(): Promise<boolean> {
  const cwd = Deno.cwd();
  const scriptsDir = join(cwd, 'scripts');
  
  try {
    for (const scriptName of REQUIRED_SCRIPTS) {
      const scriptPath = join(scriptsDir, scriptName);
      
      if (!await pathExists(scriptPath)) {
        return false;
      }
      
      // Check if file is readable
      try {
        const content = await Deno.readTextFile(scriptPath);
        if (content.length === 0) {
          return false;
        }
      } catch {
        return false;
      }
    }
    
    return true;
    
  } catch {
    return false;
  }
}

/**
 * Get list of required scripts
 */
export function getRequiredScripts(): string[] {
  return [...REQUIRED_SCRIPTS];
}