/**
 * File system and path utility helpers
 * 
 * Provides utilities for:
 * - Expanding ~ to home directory
 * - Ensuring directories exist
 * - Safe file operations (write, copy, remove)
 */

import { join, resolve, dirname } from '@std/path';
import { ensureDir, exists, copy } from '@std/fs';

/**
 * Expand ~ to home directory path
 */
export function expandHome(path: string): string {
  if (path.startsWith('~/')) {
    const home = Deno.env.get('HOME');
    if (!home) {
      throw new Error('HOME environment variable not set');
    }
    return join(home, path.slice(2));
  }
  return path;
}

/**
 * Ensure directory exists, creating parent directories as needed
 */
export async function ensureDirExists(path: string): Promise<void> {
  const expandedPath = expandHome(path);
  await ensureDir(expandedPath);
}

/**
 * Safely write file, creating parent directories if needed
 */
export async function safeWriteFile(
  path: string, 
  content: string, 
  options?: { force?: boolean }
): Promise<void> {
  const expandedPath = expandHome(path);
  
  // Check if file exists and force is not set
  if (!options?.force && await exists(expandedPath)) {
    // File exists and we're not forcing - this is idempotent behavior
    return;
  }
  
  // Ensure parent directory exists
  await ensureDir(dirname(expandedPath));
  
  // Write the file
  await Deno.writeTextFile(expandedPath, content);
}

/**
 * Safely copy file, creating parent directories if needed
 */
export async function safeCopyFile(
  src: string, 
  dest: string, 
  options?: { force?: boolean }
): Promise<void> {
  const expandedSrc = expandHome(src);
  const expandedDest = expandHome(dest);
  
  // Check if destination exists and force is not set
  if (!options?.force && await exists(expandedDest)) {
    // Destination exists and we're not forcing - this is idempotent behavior
    return;
  }
  
  // Ensure source exists
  if (!await exists(expandedSrc)) {
    throw new Error(`Source file does not exist: ${expandedSrc}`);
  }
  
  // Ensure parent directory exists for destination
  await ensureDir(dirname(expandedDest));
  
  // Copy the file
  await copy(expandedSrc, expandedDest, { overwrite: options?.force });
}

/**
 * Safely remove file or directory
 */
export async function safeRemove(path: string): Promise<void> {
  const expandedPath = expandHome(path);
  
  if (await exists(expandedPath)) {
    await Deno.remove(expandedPath, { recursive: true });
  }
}

/**
 * Check if file or directory exists
 */
export async function pathExists(path: string): Promise<boolean> {
  const expandedPath = expandHome(path);
  return await exists(expandedPath);
}

/**
 * Get the absolute path, expanding ~ if needed
 */
export function getAbsolutePath(path: string): string {
  const expandedPath = expandHome(path);
  return resolve(expandedPath);
}