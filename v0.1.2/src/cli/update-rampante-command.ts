#!/usr/bin/env -S deno run --allow-read --allow-write
/**
 * Rampante Command Updater
 *
 * Purpose: Backup the existing rampante command definition and write a
 * simplified version that removes stack selection.
 */

import { join, dirname, fromFileUrl } from "@std/path";
import { exists } from "@std/fs";

function printHelp() {
  console.log(`Rampante Command Updater

Usage:
  deno run --allow-read --allow-write src/cli/update-rampante-command.ts [options]

Options:
  --help            Show this help message and exit
  --root <dir>      Repository root to operate on (default: current working dir)

Description:
  Creates a timestamped backup of rampante/command/rampante.md and writes a
  simplified orchestrator definition without stack selection.
`);
}

async function readText(filePath: string): Promise<string> {
  return await Deno.readTextFile(filePath);
}

async function writeText(filePath: string, content: string): Promise<void> {
  await Deno.writeTextFile(filePath, content);
}

async function ensureDir(dirPath: string): Promise<void> {
  try {
    const st = await Deno.stat(dirPath);
    if (!st.isDirectory) throw new Error(`${dirPath} exists and is not a directory`);
  } catch (_e) {
    await Deno.mkdir(dirPath, { recursive: true });
  }
}

async function backupCommandFile(commandFile: string): Promise<string | null> {
  if (!(await exists(commandFile))) return null; // nothing to backup
  const dir = dirname(commandFile);
  const epoch = Math.floor(Date.now() / 1000);
  let candidate = join(dir, `rampante.${epoch}.md`);
  let counter = 0;
  while (await exists(candidate)) {
    counter += 1;
    candidate = join(dir, `rampante.${epoch}-${counter}.md`);
  }
  // Copy original to backup
  await Deno.copyFile(commandFile, candidate);
  return candidate;
}

async function run(): Promise<number> {
  // Parse args
  const argv = [...Deno.args];
  if (argv.includes("--help")) {
    printHelp();
    return 0;
  }
  let root = Deno.cwd();
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--root") {
      const val = argv[i + 1];
      if (!val) {
        console.error("ERROR: --root requires a directory path");
        return 2;
      }
      root = val;
      i += 1;
    }
  }

  // Resolve paths
  const scriptsDir = join(root, "scripts");
  const cmdDir = join(root, "rampante", "command");
  const commandFile = join(cmdDir, "rampante.md");
  // Prefer template from --root; fall back to repository template next to this script
  const templateInRoot = join(root, "templates", "rampante-command-simplified.md");
  const scriptRepoRoot = dirname(dirname(dirname(fromFileUrl(import.meta.url))));
  const templateInRepo = join(scriptRepoRoot, "templates", "rampante-command-simplified.md");
  const templateFile = (await exists(templateInRoot)) ? templateInRoot : templateInRepo;

  // Pre-flight checks
  if (!(await exists(scriptsDir))) {
    console.error("ERROR: Missing required directory: /scripts relative to root");
    return 3;
  }
  if (!(await exists(templateFile))) {
    console.error(`ERROR: Template not found: ${templateFile}`);
    return 4;
  }

  await ensureDir(cmdDir);

  // Create backup if original exists
  let backupPath: string | null = null;
  try {
    backupPath = await backupCommandFile(commandFile);
  } catch (e) {
    console.error("ERROR: Failed to create backup before modification:", e.message);
    return 5;
  }

  // Read simplified template and write as new command
  const content = await readText(templateFile);
  if (content.includes("select-stack.sh")) {
    console.error("ERROR: Simplified template must not reference select-stack.sh");
    return 6;
  }
  await writeText(commandFile, content);

  // Verify no forbidden references
  const written = await readText(commandFile);
  if (written.includes("select-stack.sh")) {
    console.error("ERROR: Updated command contains forbidden reference to select-stack.sh");
    return 7;
  }

  console.log("Rampante command updated successfully:\n" +
    `- Root: ${root}\n` +
    `- Command: ${commandFile}\n` +
    `- Backup: ${backupPath ?? "(none)"}\n` +
    `- Template: ${templateFile}`);

  return 0;
}

if (import.meta.main) {
  run().then((code) => Deno.exit(code));
}
