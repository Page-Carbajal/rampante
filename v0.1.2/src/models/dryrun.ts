/**
 * Data Models: Rampante Dry-Run Mode
 * 
 * Based on: /specs/003-implement-rampante-dryrun/data-model.md
 * 
 * Defines the core entities for dry-run functionality:
 * - DryRunRequest: Represents a /rampante invocation with --dry-run flag
 * - GeneratedPrompt: Represents a prompt destined for a specific target command
 */

/**
 * A `/rampante` invocation where the first token is `--dry-run`.
 */
export interface DryRunRequest {
  /** Implicit identifier, not persisted */
  readonly id: string;
  
  /** The complete raw input as provided by user */
  readonly raw_input: string;
  
  /** The prompt content (raw_input minus the `--dry-run` token) */
  readonly prompt_content: string;
  
  /** ISO-8601 timestamp of when the request was created */
  readonly timestamp: string;
  
  /** Target commands that prompts will be generated for */
  readonly target_commands: readonly string[];
}

/**
 * A prompt destined for a specific target command.
 */
export interface GeneratedPrompt {
  /** The target command (e.g., "/specify", "/plan", "/tasks") */
  readonly command: string;
  
  /** 1-based execution order */
  readonly order: number;
  
  /** The full prompt body as would be sent to the command */
  readonly text: string;
  
  /** Optional annotations or warnings */
  readonly notes?: string;
}

/**
 * Validation function for DryRunRequest
 */
export function validateDryRunRequest(request: Partial<DryRunRequest>): request is DryRunRequest {
  if (!request.raw_input || typeof request.raw_input !== 'string') {
    return false;
  }
  
  // raw_input MUST begin with --dry-run
  if (!request.raw_input.startsWith('--dry-run')) {
    return false;
  }
  
  // All required fields must be present
  return !!(
    request.id &&
    request.prompt_content !== undefined &&
    request.timestamp &&
    Array.isArray(request.target_commands)
  );
}

/**
 * Validation function for GeneratedPrompt
 */
export function validateGeneratedPrompt(prompt: Partial<GeneratedPrompt>): prompt is GeneratedPrompt {
  return !!(
    prompt.command &&
    typeof prompt.command === 'string' &&
    typeof prompt.order === 'number' &&
    prompt.order >= 1 &&
    prompt.text &&
    typeof prompt.text === 'string'
  );
}

/**
 * Factory function to create a DryRunRequest from raw input
 */
export function createDryRunRequest(rawInput: string): DryRunRequest {
  if (!rawInput.startsWith('--dry-run')) {
    throw new Error('Invalid DryRunRequest: raw_input must begin with --dry-run');
  }
  
  // Extract prompt content (everything after --dry-run and optional whitespace)
  const promptContent = rawInput.replace(/^--dry-run\s*/, '').trim();
  
  // Default target commands for rampante flow
  const targetCommands = promptContent.length > 0 
    ? ['/specify', '/plan', '/tasks'] 
    : []; // Empty if no content to process
  
  return {
    id: crypto.randomUUID(),
    raw_input: rawInput,
    prompt_content: promptContent,
    timestamp: new Date().toISOString(),
    target_commands: targetCommands
  };
}

/**
 * Factory function to create a GeneratedPrompt
 */
export function createGeneratedPrompt(
  command: string,
  order: number,
  text: string,
  notes?: string
): GeneratedPrompt {
  const prompt: GeneratedPrompt = {
    command,
    order,
    text,
    ...(notes && { notes })
  };
  
  if (!validateGeneratedPrompt(prompt)) {
    throw new Error(`Invalid GeneratedPrompt: ${JSON.stringify(prompt)}`);
  }
  
  return prompt;
}