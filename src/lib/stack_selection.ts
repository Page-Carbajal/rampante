/**
 * Stack selection helper
 * 
 * Implements YOLO strategy for stack selection:
 * - Match tags from prompt against available stacks
 * - Deterministic tie-breaking by priority (lower wins), then by order in DEFINITIONS.md
 * - Fallback to lowest priority stack if no matches
 * - Extract technologies from selected stack file
 */

import { join } from '@std/path';
import { pathExists } from './fs_utils.ts';

export interface StackInfo {
  name: string;
  description: string;
  tags: string[];
  priority: number;
  useCases: string[];
  order: number; // Order in DEFINITIONS.md file
}

export interface StackSelectionResult {
  selectedStack: string;
  stackFile: string;
  priority: number;
  technologies: string[];
  fallback: boolean;
  matchReason: string;
  tags: string[];
}

/**
 * Select the best stack for a given prompt using YOLO strategy
 */
export async function selectStack(prompt: string, stacksDir?: string, manualStackName?: string): Promise<StackSelectionResult> {
  const baseDir = stacksDir || Deno.cwd();
  const definitionsPath = join(baseDir, 'recommended-stacks', 'DEFINITIONS.md');
  
  if (!await pathExists(definitionsPath)) {
    throw new Error(`DEFINITIONS.md not found at ${definitionsPath}`);
  }
  
  // Parse available stacks
  const stacks = await parseStackDefinitions(definitionsPath);
  
  let bestMatch: StackInfo | null = null;
  let matchedTags: string[] = [];
  let fallback = false;
  let matchReason = '';
  
  // Handle manual stack override
  if (manualStackName) {
    bestMatch = stacks.find(s => s.name === manualStackName) || null;
    if (!bestMatch) {
      // Try case-insensitive match
      bestMatch = stacks.find(s => s.name.toLowerCase() === manualStackName.toLowerCase()) || null;
    }
    
    if (!bestMatch) {
      throw new Error(`Specified stack '${manualStackName}' not found. Available stacks: ${stacks.map(s => s.name).join(', ')}`);
    }
    
    matchReason = `manually specified stack: ${bestMatch.name}`;
    matchedTags = bestMatch.tags;
  } else {
    // YOLO automatic selection
    // Normalize prompt for matching (lowercase, split into words)
    const promptWords = prompt.toLowerCase().split(/\s+/);
    
    // Try to find matching stacks
    let maxMatches = 0;
    
    for (const stack of stacks) {
      const matches = countTagMatches(stack.tags, promptWords);
      
      if (matches.count > 0) {
        // Better match if more tags match, or same matches but better priority/order
        const isBetter = matches.count > maxMatches || 
          (matches.count === maxMatches && 
           (stack.priority < (bestMatch?.priority || Infinity) ||
            (stack.priority === bestMatch?.priority && stack.order < bestMatch.order)));
        
        if (isBetter) {
          bestMatch = stack;
          matchedTags = matches.matchedTags;
          maxMatches = matches.count;
        }
      }
    }
    
    // Fallback to lowest priority stack if no matches
    if (!bestMatch) {
      fallback = true;
      bestMatch = findLowestPriorityStack(stacks);
      matchReason = 'no tag match; fallback to lowest priority';
    } else {
      matchReason = `matched tags: ${matchedTags.join(', ')}`;
    }
  }
  
  if (!bestMatch) {
    throw new Error('No stacks available in DEFINITIONS.md');
  }
  
  // Get stack file path and extract technologies
  const stackFile = join(baseDir, 'recommended-stacks', `${bestMatch.name}.md`);
  
  if (!await pathExists(stackFile)) {
    throw new Error(`Missing stack file: ${stackFile}`);
  }
  
  const technologies = await extractTechnologies(stackFile);
  
  return {
    selectedStack: bestMatch.name,
    stackFile,
    priority: bestMatch.priority,
    technologies,
    fallback,
    matchReason,
    tags: bestMatch.tags,
  };
}

/**
 * Parse stack definitions from DEFINITIONS.md
 */
async function parseStackDefinitions(definitionsPath: string): Promise<StackInfo[]> {
  const content = await Deno.readTextFile(definitionsPath);
  const stacks: StackInfo[] = [];
  const lines = content.split('\n');
  
  let currentStack: Partial<StackInfo> | null = null;
  let order = 0;
  let inUseCases = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Stack header (### STACK_NAME)
    if (trimmed.startsWith('### ') && trimmed.length > 4) {
      if (currentStack && currentStack.name) {
        stacks.push(currentStack as StackInfo);
      }
      
      currentStack = {
        name: trimmed.slice(4).trim(),
        order: order++,
        useCases: [],
      };
      inUseCases = false;
    }
    
    if (!currentStack) continue;
    
    // Description
    if (trimmed.startsWith('- **Description**: ')) {
      currentStack.description = trimmed.slice(19);
    }
    
    // Tags  
    if (trimmed.startsWith('- **Tags**: ')) {
      const tagsText = trimmed.slice(12);
      currentStack.tags = tagsText.split(',').map(tag => tag.trim());
    }
    
    // Priority
    if (trimmed.startsWith('- **Priority**: ')) {
      currentStack.priority = parseInt(trimmed.slice(16));
    }
    
    // Use Cases section start
    if (trimmed.startsWith('- **Use Cases**:')) {
      inUseCases = true;
    }
    
    // Use case items
    if (inUseCases && trimmed.startsWith('  - ')) {
      currentStack.useCases = currentStack.useCases || [];
      currentStack.useCases.push(trimmed.slice(4));
    }
    
    // End of use cases (next section starts)
    if (inUseCases && trimmed.startsWith('###')) {
      inUseCases = false;
    }
  }
  
  // Add the last stack
  if (currentStack && currentStack.name) {
    stacks.push(currentStack as StackInfo);
  }
  
  return stacks;
}

/**
 * Count how many tags from a stack match words in the prompt
 */
function countTagMatches(stackTags: string[], promptWords: string[]): { count: number; matchedTags: string[] } {
  const matchedTags: string[] = [];
  
  for (const tag of stackTags) {
    const tagLower = tag.toLowerCase();
    
    // Check if any prompt word matches this tag
    for (const word of promptWords) {
      const wordLower = word.toLowerCase();
      
      // Skip very short words to avoid false matches
      if (wordLower.length < 2) continue;
      
      let isMatch = false;
      
      // Exact match has highest priority
      if (wordLower === tagLower) {
        isMatch = true;
      } 
      // For compound tags (with hyphens), check if word matches a component
      else if (tagLower.includes('-')) {
        const tagParts = tagLower.split('-');
        isMatch = tagParts.some(part => part.length >= 3 && wordLower === part);
      }
      // For simple tags, allow substring matching if tag is long enough
      else if (tagLower.length >= 4 && wordLower.length >= 3) {
        isMatch = wordLower.includes(tagLower) || tagLower.includes(wordLower);
      }
      
      if (isMatch && !matchedTags.includes(tag)) {
        matchedTags.push(tag);
        break; // Found a match for this tag, move to next tag
      }
    }
  }
  
  return {
    count: matchedTags.length,
    matchedTags,
  };
}

/**
 * Find the stack with lowest priority (and lowest order for ties)
 */
function findLowestPriorityStack(stacks: StackInfo[]): StackInfo | null {
  if (stacks.length === 0) return null;
  
  let lowest = stacks[0];
  
  for (const stack of stacks.slice(1)) {
    if (stack.priority < lowest.priority || 
        (stack.priority === lowest.priority && stack.order < lowest.order)) {
      lowest = stack;
    }
  }
  
  return lowest;
}

/**
 * Extract technologies from a stack file
 * Prefers "## Context7 Documentation" section, falls back to "## Core Technologies"
 */
async function extractTechnologies(stackFile: string): Promise<string[]> {
  const content = await Deno.readTextFile(stackFile);
  const lines = content.split('\n');
  
  let inContext7 = false;
  let inCoreTech = false;
  const context7Tech: string[] = [];
  const coreTech: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Section headers
    if (trimmed.startsWith('## Context7 Documentation')) {
      inContext7 = true;
      inCoreTech = false;
      continue;
    }
    
    if (trimmed.startsWith('## Core Technologies')) {
      inCoreTech = true;
      inContext7 = false;
      continue;
    }
    
    // Other section headers end current section
    if (trimmed.startsWith('## ') && 
        !trimmed.startsWith('## Context7 Documentation') && 
        !trimmed.startsWith('## Core Technologies')) {
      inContext7 = false;
      inCoreTech = false;
      continue;
    }
    
    // Extract **bold** items from current section
    if (inContext7 || inCoreTech) {
      const boldMatches = line.match(/\*\*([^*]+)\*\*/g);
      if (boldMatches) {
        for (const match of boldMatches) {
          const tech = match.slice(2, -2).trim(); // Remove ** from both ends
          if (tech) {
            if (inContext7) {
              context7Tech.push(tech);
            } else if (inCoreTech) {
              coreTech.push(tech);
            }
          }
        }
      }
    }
  }
  
  // Prefer Context7 Documentation list, fallback to Core Technologies
  return context7Tech.length > 0 ? context7Tech : coreTech;
}

/**
 * Get all available stacks from DEFINITIONS.md
 */
export async function getAvailableStacks(stacksDir?: string): Promise<StackInfo[]> {
  const baseDir = stacksDir || Deno.cwd();
  const definitionsPath = join(baseDir, 'recommended-stacks', 'DEFINITIONS.md');
  
  if (!await pathExists(definitionsPath)) {
    throw new Error(`DEFINITIONS.md not found at ${definitionsPath}`);
  }
  
  return await parseStackDefinitions(definitionsPath);
}

/**
 * Validate that a stack file exists for a given stack name
 */
export async function validateStackFile(stackName: string, stacksDir?: string): Promise<boolean> {
  const baseDir = stacksDir || Deno.cwd();
  const stackFile = join(baseDir, 'recommended-stacks', `${stackName}.md`);
  return await pathExists(stackFile);
}