#!/usr/bin/env -S deno run --allow-all

/**
 * Rampante CLI Entry Point
 * 
 * This file serves as the main entry point for remote execution.
 * Users can run: deno run -A jsr:@page-carbajal/rampante install codex
 */

import { main } from "./src/cli/install.ts";

// Pass through to the main installer
if (import.meta.main) {
  main();
}