/**
 * Dry-Run Output Formatter
 * 
 * Formats GeneratedPrompt arrays into the structured Markdown output
 * specified in the CLI contract.
 * 
 * Output structure per contract:
 * - Header: "# DRY RUN: /rampante"
 * - Summary section with commands list
 * - Individual sections for each command with fenced code blocks
 * - Clear indication of execution order
 */

import { GeneratedPrompt } from "../models/dryrun.ts";

/**
 * Format dry-run prompts into structured Markdown output
 * 
 * @param prompts Array of prompts to format (empty array produces empty commands list)
 * @returns Formatted Markdown string matching CLI contract specification
 */
export function formatDryRunMarkdown(prompts: GeneratedPrompt[]): string {
  const sections: string[] = [];
  
  // Header
  sections.push("# DRY RUN: /rampante");
  sections.push("");
  
  // Summary section
  sections.push("## Summary");
  
  if (prompts.length === 0) {
    sections.push("- Commands: []");
    sections.push("");
    sections.push("No downstream prompts generated due to empty content.");
  } else {
    const commandsList = prompts
      .sort((a, b) => a.order - b.order)
      .map(p => p.command)
      .join(", ");
    sections.push(`- Commands: [${commandsList}]`);
  }
  
  sections.push("");
  
  // Individual command sections
  for (const prompt of prompts.sort((a, b) => a.order - b.order)) {
    sections.push(`## ${prompt.command}`);
    sections.push("");
    
    // Add notes if present
    if (prompt.notes) {
      sections.push(`*Note: ${prompt.notes}*`);
      sections.push("");
    }
    
    // Fenced code block with prompt text
    sections.push("```text");
    sections.push(prompt.text);
    sections.push("```");
    sections.push("");
  }
  
  // Remove trailing empty line
  while (sections.length > 0 && sections[sections.length - 1] === "") {
    sections.pop();
  }
  
  return sections.join("\n");
}

/**
 * Format dry-run output for empty content case
 * 
 * @returns Markdown indicating no prompts were generated
 */
export function formatEmptyDryRunMarkdown(): string {
  return formatDryRunMarkdown([]);
}

/**
 * Validate that generated prompts can be properly formatted
 * 
 * @param prompts Array of prompts to validate
 * @returns Validation result with any issues found
 */
export function validatePromptsForFormatting(prompts: GeneratedPrompt[]): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check for duplicate orders
  const orders = prompts.map(p => p.order);
  const duplicateOrders = orders.filter((order, index) => orders.indexOf(order) !== index);
  if (duplicateOrders.length > 0) {
    issues.push(`Duplicate order values found: ${duplicateOrders.join(", ")}`);
  }
  
  // Check for missing or invalid orders
  const invalidOrders = prompts.filter(p => !p.order || p.order < 1);
  if (invalidOrders.length > 0) {
    issues.push(`Invalid order values found: ${invalidOrders.map(p => p.order).join(", ")}`);
  }
  
  // Check for empty commands
  const emptyCommands = prompts.filter(p => !p.command || p.command.trim().length === 0);
  if (emptyCommands.length > 0) {
    issues.push(`Empty command names found: ${emptyCommands.length} prompts`);
  }
  
  // Check for empty text
  const emptyTexts = prompts.filter(p => !p.text || p.text.trim().length === 0);
  if (emptyTexts.length > 0) {
    issues.push(`Empty prompt texts found: ${emptyTexts.length} prompts`);
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Create a preview of the formatted output (first few lines)
 * Useful for debugging or quick validation
 * 
 * @param prompts Array of prompts to preview
 * @param maxLines Maximum number of lines to return
 * @returns Truncated preview of the formatted output
 */
export function previewDryRunMarkdown(prompts: GeneratedPrompt[], maxLines: number = 10): string {
  const fullOutput = formatDryRunMarkdown(prompts);
  const lines = fullOutput.split("\n");
  
  if (lines.length <= maxLines) {
    return fullOutput;
  }
  
  const preview = lines.slice(0, maxLines).join("\n");
  return `${preview}\n\n[... ${lines.length - maxLines} more lines]`;
}

/**
 * Extract command sections from formatted markdown
 * Useful for testing or processing individual sections
 * 
 * @param markdown Formatted dry-run markdown
 * @returns Map of command names to their section content
 */
export function extractCommandSections(markdown: string): Map<string, string> {
  const sections = new Map<string, string>();
  const lines = markdown.split("\n");
  
  let currentCommand: string | null = null;
  let currentSection: string[] = [];
  
  for (const line of lines) {
    // Check if this is a command header (## /command)
    const commandMatch = line.match(/^## (\/\w+)$/);
    
    if (commandMatch) {
      // Save previous section if it exists
      if (currentCommand && currentSection.length > 0) {
        sections.set(currentCommand, currentSection.join("\n").trim());
      }
      
      // Start new section
      currentCommand = commandMatch[1];
      currentSection = [];
    } else if (currentCommand) {
      // Add line to current section
      currentSection.push(line);
    }
  }
  
  // Save final section
  if (currentCommand && currentSection.length > 0) {
    sections.set(currentCommand, currentSection.join("\n").trim());
  }
  
  return sections;
}