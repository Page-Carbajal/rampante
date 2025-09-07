/**
 * Rampante - AI Agent Orchestrator for Spec-Driven Development
 * 
 * A multi-CLI slash command system that automates the complete spec-driven 
 * development workflow using YOLO strategy for stack selection.
 * 
 * @module rampante
 * @version 0.1.0
 * @author Page Carbajal
 * @license MIT
 */

// Export main CLI functionality
export { main } from './src/cli/install.ts';

// Export core services
export { installAssets } from './src/services/install_assets.ts';
export { configureContext7 } from './src/services/context7_config.ts';
export { registerRampante } from './src/services/register_rampante.ts';
export { installScripts } from './src/services/install_scripts.ts';

// Export utilities
export { selectStack, getAvailableStacks, validateStackFile } from './src/lib/stack_selection.ts';
export { Logger, RampanteError, ErrorHandler } from './src/lib/logger.ts';
export { 
  expandHome, 
  ensureDirExists, 
  safeWriteFile, 
  safeCopyFile, 
  safeRemove, 
  pathExists, 
  getAbsolutePath 
} from './src/lib/fs_utils.ts';

// Export types
export type { 
  StackInfo, 
  StackSelectionResult 
} from './src/lib/stack_selection.ts';

// Package metadata
export const VERSION = '0.1.0';
export const NAME = '@page-carbajal/rampante';
export const DESCRIPTION = 'AI Agent Orchestrator for Spec-Driven Development';