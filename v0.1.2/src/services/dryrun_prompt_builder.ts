/**
 * Dry-Run Prompt Builder Service
 * 
 * Implements the core logic for generating prompts that would be sent to 
 * downstream commands (/specify, /plan, /tasks) without executing them.
 * 
 * Based on research decisions:
 * - Flag must be first token
 * - No aliases supported in v1  
 * - Handle empty content appropriately
 * - Generate prompts for standard rampante flow
 */

import { 
  DryRunRequest, 
  GeneratedPrompt, 
  createDryRunRequest, 
  createGeneratedPrompt 
} from "../models/dryrun.ts";

/**
 * Main function to build dry-run prompts from input string
 */
export function buildDryRunPrompts(input: string): GeneratedPrompt[] {
  // Validate that this is a valid dry-run request
  if (!isDryRunInput(input)) {
    throw new Error("Input does not start with --dry-run flag");
  }
  
  // Create the dry-run request
  const request = createDryRunRequest(input);
  
  // If no content, return empty list
  if (request.prompt_content.length === 0 || isWhitespaceOnly(request.prompt_content)) {
    return [];
  }
  
  // Generate prompts for each target command
  const prompts: GeneratedPrompt[] = [];
  
  for (let i = 0; i < request.target_commands.length; i++) {
    const command = request.target_commands[i];
    const prompt = generatePromptForCommand(command, request.prompt_content, i + 1);
    prompts.push(prompt);
  }
  
  return prompts;
}

/**
 * Check if input starts with --dry-run flag
 */
export function isDryRunInput(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }
  
  // Must start with exactly --dry-run (no aliases in v1)
  return input.startsWith('--dry-run');
}

/**
 * Check if content is only whitespace
 */
function isWhitespaceOnly(content: string): boolean {
  return content.trim().length === 0;
}

/**
 * Generate a prompt for a specific command based on the user's content
 */
function generatePromptForCommand(command: string, content: string, order: number): GeneratedPrompt {
  let text: string;
  let notes: string | undefined;
  
  switch (command) {
    case '/specify':
      text = generateSpecifyPrompt(content);
      break;
      
    case '/plan':
      text = generatePlanPrompt(content);
      notes = "Depends on spec.md being created by /specify";
      break;
      
    case '/tasks':
      text = generateTasksPrompt(content);
      notes = "Depends on plan.md being created by /plan";
      break;
      
    default:
      text = `${command} ${content}`;
      notes = `Unknown command type: ${command}`;
  }
  
  return createGeneratedPrompt(command, order, text, notes);
}

/**
 * Generate the prompt that would be sent to /specify
 */
function generateSpecifyPrompt(content: string): string {
  // The /specify command would typically receive the user's original request
  // to create a specification document
  return content;
}

/**
 * Generate the prompt that would be sent to /plan  
 */
function generatePlanPrompt(content: string): string {
  // The /plan command would typically work from a spec file
  // For dry-run, we simulate what the prompt would look like
  
  // In normal flow, this would reference the actual spec file created by /specify
  // For dry-run, we indicate what the prompt structure would be
  return `/specs/[feature-name]/spec.md`;
}

/**
 * Generate the prompt that would be sent to /tasks
 */
function generateTasksPrompt(content: string): string {
  // The /tasks command would typically work from design documents
  // For dry-run, we simulate what the prompt would look like
  
  // In normal flow, this would reference the actual plan file created by /plan
  // For dry-run, we indicate what the prompt structure would be  
  return `/specs/[feature-name]/plan.md`;
}

/**
 * Validate dry-run input according to research decisions
 */
export function validateDryRunInput(input: string): {valid: boolean, error?: string} {
  if (!input || typeof input !== 'string') {
    return {valid: false, error: "Input must be a non-empty string"};
  }
  
  if (!input.startsWith('--dry-run')) {
    return {valid: false, error: "Flag --dry-run must be the first token"};
  }
  
  // Check for aliases (not supported in v1)
  if (input.startsWith('--dryrun') || input.startsWith('-n')) {
    return {valid: false, error: "Aliases not supported in v1; use --dry-run exactly"};
  }
  
  return {valid: true};
}

/**
 * Extract the user content from dry-run input
 */
export function extractPromptContent(input: string): string {
  if (!isDryRunInput(input)) {
    throw new Error("Not a valid dry-run input");
  }
  
  return input.replace(/^--dry-run\s*/, '').trim();
}