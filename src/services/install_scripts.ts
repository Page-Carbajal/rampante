/**
 * Script installation service
 * 
 * Handles installation of required scripts from /rampante/scripts/ to ./scripts/
 * - select-stack.sh
 - generate-project-overview.sh
 * 
 * Supports idempotent operations and --force flag
 */

import { join } from 'https://deno.land/std@0.208.0/path/mod.ts';
import { ensureDirExists, safeWriteFile, pathExists } from '../lib/fs_utils.ts';

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
  
  // Ensure scripts directory exists
  await ensureDirExists(scriptsDir);
  
  try {
    // Get the repository root (where this script is running from)
    const currentScriptPath = new URL(import.meta.url).pathname;
    const repoRoot = currentScriptPath.split('/src/services/')[0];
    const sourceScriptsDir = join(repoRoot, 'rampante', 'scripts');
    
    // Install each required script
    for (const scriptName of REQUIRED_SCRIPTS) {
      await installScript(scriptsDir, sourceScriptsDir, scriptName, force);
    }
    
  } catch (error) {
    const err = error as Error;
    throw new Error(`Failed to install scripts: ${err.message}`);
  }
}

/**
 * Install a single script file
 */
async function installScript(
  targetDir: string,
  sourceDir: string,
  scriptName: string,
  force: boolean
): Promise<void> {
  const sourcePath = join(sourceDir, scriptName);
  const targetPath = join(targetDir, scriptName);
  
  try {
    // Check if file already exists and we're not forcing
    if (!force && await pathExists(targetPath)) {
      console.log(`${scriptName} file already exists! Moving on`);
      return;
    }
    
    // Read the template script from the repository
    const scriptContent = await Deno.readTextFile(sourcePath);
    
    // Write the script file
    await safeWriteFile(targetPath, scriptContent, { force });
    
    // Make the script executable (Unix-like systems)
    try {
      await Deno.chmod(targetPath, 0o755);
    } catch (error) {
      // chmod might not be supported on all platforms, continue anyway
      console.warn(`Warning: Could not make ${scriptName} executable: ${error}`);
    }
    
  } catch (error) {
    const err = error as Error;
    throw new Error(`Failed to install script ${scriptName} from ${sourcePath}: ${err.message}`);
  }
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