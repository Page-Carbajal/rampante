/**
 * Rampante command registration service
 * 
 * Handles registration of the /rampante command with different CLI targets:
 * - Codex: Copy rampante.md to ~/.codex/prompts/rampante.md
 * 
 * Future phases will support Claude Code, Gemini, etc.
 */

import { join } from 'https://deno.land/std@0.208.0/path/mod.ts';
import { safeCopyFile, ensureDirExists, pathExists, expandHome } from '../lib/fs_utils.ts';

/**
 * Register rampante command with the specified CLI target
 */
export async function registerRampante(cliTarget: string): Promise<void> {
  switch (cliTarget) {
    case 'codex':
      await registerWithCodex();
      break;
    default:
      throw new Error(`Unsupported CLI target for registration: ${cliTarget}`);
  }
}

/**
 * Register rampante command with Codex CLI
 * Copies rampante.md to ~/.codex/prompts/rampante.md
 */
async function registerWithCodex(): Promise<void> {
  const cwd = Deno.cwd();
  const sourceFile = join(cwd, 'rampante', 'command', 'rampante.md');
  const targetDir = expandHome('~/.codex/prompts');
  const targetFile = join(targetDir, 'rampante.md');
  
  // Verify source file exists
  if (!await pathExists(sourceFile)) {
    throw new Error(`Source rampante.md not found at ${sourceFile}. Run asset installation first.`);
  }
  
  // Ensure target directory exists
  await ensureDirExists(targetDir);
  
  // Copy the file (always overwrite for registration)
  await safeCopyFile(sourceFile, targetFile, { force: true });
}

/**
 * Get the registration path for a given CLI target
 */
export function getRegistrationPath(cliTarget: string): string {
  switch (cliTarget) {
    case 'codex':
      return expandHome('~/.codex/prompts/rampante.md');
    default:
      throw new Error(`Unknown CLI target: ${cliTarget}`);
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