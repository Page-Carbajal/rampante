/**
 * Context7 configuration writer service
 *
 * Handles configuration of context7 MCP for different CLI targets:
 * - Codex: ~/.codex/config.toml
 *
 * Creates config files if missing and adds mcp_servers.context7 section
 */

import { join } from "https://deno.land/std@0.208.0/path/mod.ts";
import {
  ensureDirExists,
  safeWriteFile,
  pathExists,
  expandHome,
} from "../lib/fs_utils.ts";

interface Context7Config {
  command: string;
  args: string[];
}

const CONTEXT7_CONFIG: Context7Config = {
  command: "npx",
  args: ["-y", "@upstash/context7-mcp", "--api-key", "YOUR_API_KEY"],
};

/**
 * Configure context7 for the specified CLI target
 */
export async function configureContext7(cliTarget: string): Promise<void> {
  switch (cliTarget) {
    case "codex":
      await configureCodexContext7();
      break;
    default:
      throw new Error(`Unsupported CLI target for context7: ${cliTarget}`);
  }
}

/**
 * Configure context7 for Codex CLI (~/.codex/config.toml)
 */
async function configureCodexContext7(): Promise<void> {
  const configPath = expandHome("~/.codex/config.toml");
  const configDir = expandHome("~/.codex");

  // Ensure .codex directory exists
  await ensureDirExists(configDir);

  let tomlContent = "";

  // Read existing config if it exists
  if (await pathExists(configPath)) {
    tomlContent = await Deno.readTextFile(configPath);
  }

  // Check if context7 MCP server already configured
  if (tomlContent.includes("[mcp_servers.context7]")) {
    // Already configured - idempotent behavior
    return;
  }

  // Add context7 MCP server configuration
  const context7Section = `
[mcp_servers.context7]
command = "${CONTEXT7_CONFIG.command}"
args = ${JSON.stringify(CONTEXT7_CONFIG.args)}
`;

  // Append to existing content or create new
  const updatedContent = tomlContent.trim() + "\n" + context7Section;

  // Write updated config
  await safeWriteFile(configPath, updatedContent, { force: true });
}

/**
 * Get the config path for a given CLI target
 */
export function getConfigPath(cliTarget: string): string {
  switch (cliTarget) {
    case "codex":
      return expandHome("~/.codex/config.toml");
    default:
      throw new Error(`Unknown CLI target: ${cliTarget}`);
  }
}

/**
 * Verify context7 configuration exists and is valid
 */
export async function verifyContext7Config(
  cliTarget: string,
): Promise<boolean> {
  try {
    const configPath = getConfigPath(cliTarget);

    if (!(await pathExists(configPath))) {
      return false;
    }

    const content = await Deno.readTextFile(configPath);
    return content.includes("[mcp_servers.context7]");
  } catch {
    return false;
  }
}
