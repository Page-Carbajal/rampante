/**
 * Dry-Run Guards
 * 
 * Provides utilities to prevent side effects during dry-run execution.
 * Guards against file system operations, network calls, and other 
 * potentially harmful operations.
 */

import { logger } from "./logger.ts";

/**
 * Global dry-run mode flag
 * Set to true when executing in dry-run mode
 */
let isDryRunActive = false;

/**
 * Set the global dry-run mode
 */
export function setDryRunMode(active: boolean): void {
  isDryRunActive = active;
  if (active) {
    logger.dryRunActivated({ timestamp: new Date().toISOString() });
  }
}

/**
 * Check if currently in dry-run mode
 */
export function getDryRunMode(): boolean {
  return isDryRunActive;
}

/**
 * Guard against side effects during dry-run
 * Throws error if operation is attempted during dry-run
 */
export function guardSideEffect(operation: string, details?: Record<string, unknown>): void {
  if (isDryRunActive) {
    const contextInfo = details ? 
      ` | ${Object.entries(details).map(([k, v]) => `${k}: ${v}`).join(', ')}` : 
      '';
    throw new Error(`Side effect blocked in dry-run mode: ${operation}${contextInfo}`);
  }
}

/**
 * Guard against file system write operations
 */
export function guardFileWrite(path: string, operation: string = "file write"): void {
  guardSideEffect(operation, { path, type: "filesystem" });
}

/**
 * Guard against file system modifications (create, delete, move)
 */
export function guardFileModification(path: string, operation: string): void {
  guardSideEffect(`${operation} file/directory`, { path, type: "filesystem" });
}

/**
 * Guard against network operations
 */
export function guardNetworkCall(url: string, method: string = "GET"): void {
  guardSideEffect("network request", { url, method, type: "network" });
}

/**
 * Guard against process execution
 */
export function guardProcessExecution(command: string, args?: string[]): void {
  guardSideEffect("process execution", { 
    command, 
    args: args?.join(' ') || '', 
    type: "process" 
  });
}

/**
 * Guard against environment modifications
 */
export function guardEnvironmentModification(variable: string, operation: string): void {
  guardSideEffect(`environment ${operation}`, { variable, type: "environment" });
}

/**
 * Safe execution wrapper that respects dry-run mode
 * Returns mock/preview results during dry-run, executes normally otherwise
 */
export async function safeExecute<T>(
  operation: string,
  executor: () => Promise<T>,
  dryRunPreview?: () => Promise<T>
): Promise<T> {
  if (isDryRunActive) {
    logger.debug(`Dry-run preview: ${operation}`);
    if (dryRunPreview) {
      return await dryRunPreview();
    }
    // Return a generic preview result
    return `[DRY RUN] Would execute: ${operation}` as T;
  }
  
  return await executor();
}

/**
 * Create a dry-run context that automatically manages the dry-run state
 */
export async function withDryRunContext<T>(
  isDryRun: boolean,
  operation: () => Promise<T>
): Promise<T> {
  const previousState = isDryRunActive;
  
  try {
    setDryRunMode(isDryRun);
    return await operation();
  } finally {
    setDryRunMode(previousState);
  }
}

/**
 * Wrapper for file system operations that respects dry-run mode
 */
export class DryRunAwareFS {
  /**
   * Write file with dry-run protection
   */
  static async writeFile(
    path: string, 
    content: string, 
    options?: { force?: boolean }
  ): Promise<void> {
    guardFileWrite(path, "write file");
    
    // In normal mode, this would call the actual fs operation
    // For now, just guard - actual integration would call safeWriteFile
    throw new Error("File write operation blocked by dry-run guard");
  }

  /**
   * Create directory with dry-run protection
   */
  static async ensureDir(path: string): Promise<void> {
    guardFileModification(path, "create directory");
    
    throw new Error("Directory creation blocked by dry-run guard");
  }

  /**
   * Remove file/directory with dry-run protection
   */
  static async remove(path: string): Promise<void> {
    guardFileModification(path, "remove");
    
    throw new Error("File/directory removal blocked by dry-run guard");
  }

  /**
   * Copy file with dry-run protection
   */
  static async copy(src: string, dest: string): Promise<void> {
    guardFileModification(dest, "copy file");
    
    throw new Error("File copy operation blocked by dry-run guard");
  }
}

/**
 * Wrapper for process execution that respects dry-run mode
 */
export class DryRunAwareProcess {
  /**
   * Execute command with dry-run protection
   */
  static async run(
    command: string, 
    args: string[] = [], 
    options?: Deno.RunOptions
  ): Promise<Deno.ProcessStatus> {
    guardProcessExecution(command, args);
    
    throw new Error(`Process execution blocked by dry-run guard: ${command} ${args.join(' ')}`);
  }
}

/**
 * Debug utility to log what would happen in dry-run vs normal mode
 */
export function logDryRunPreview(operation: string, details: Record<string, unknown>): void {
  if (isDryRunActive) {
    logger.debug(`[DRY RUN PREVIEW] ${operation} - ${JSON.stringify(details)}`);
  }
}