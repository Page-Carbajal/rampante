import { assertEquals, assertExists } from "@std/assert";
import { exists } from "@std/fs";
import { join } from "@std/path";

/**
 * Integration test: first-run install in temp dir
 * Tests the complete installation flow from scratch
 */
Deno.test("Integration: First-run install creates all required files", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampante-first-run-" });
  const originalCwd = Deno.cwd();
  
  try {
    Deno.chdir(testDir);
    
    // Mock home directory for Codex registration
    const mockHome = await Deno.makeTempDir({ prefix: "mock-home-" });
    const originalHome = Deno.env.get("HOME");
    Deno.env.set("HOME", mockHome);
    
    // Create installer CLI (this will be implemented later)
    const installerPath = join(originalCwd, "src/cli/install.ts");
    
    // Run installer
    const result = await new Deno.Command("deno", {
      args: ["run", "--allow-all", installerPath, "install", "codex"],
      stdout: "piped",
      stderr: "piped",
    }).output();
    
    // Verify successful installation
    assertEquals(result.code, 0, "First-run install should succeed");
    
    // Verify rampante/command/rampante.md exists
    const rampanteMdPath = join(testDir, "rampante/command", "rampante.md");
    assertEquals(await exists(rampanteMdPath), true, "rampante.md should be created");
    
    // Verify recommended-stacks/DEFINITIONS.md exists
    const definitionsPath = join(testDir, "recommended-stacks", "DEFINITIONS.md");
    assertEquals(await exists(definitionsPath), true, "DEFINITIONS.md should be created");
    
    // Verify at least one initial stack file exists
    const stackFiles = await Deno.readDir(join(testDir, "recommended-stacks"));
    let hasStackFile = false;
    for await (const file of stackFiles) {
      if (file.name.endsWith(".md") && file.name !== "DEFINITIONS.md") {
        hasStackFile = true;
        break;
      }
    }
    assertEquals(hasStackFile, true, "At least one initial stack file should be created");
    
    // Verify Codex registration
    const codexPromptsDir = join(mockHome, ".codex", "prompts");
    const codexRampantPath = join(codexPromptsDir, "rampante.md");
    assertEquals(await exists(codexRampantPath), true, "rampante.md should be registered with Codex");
    
    // Verify Codex config.toml exists and contains context7 configuration
    const codexConfigPath = join(mockHome, ".codex", "config.toml");
    assertEquals(await exists(codexConfigPath), true, "Codex config.toml should be created");
    
    const configContent = await Deno.readTextFile(codexConfigPath);
    assertEquals(configContent.includes("[mcp_servers.context7]"), true, "Config should contain context7 MCP server");
    assertEquals(configContent.includes("command = \"npx\""), true, "Config should contain npx command");
    assertEquals(configContent.includes("@upstash/context7-mcp"), true, "Config should contain context7-mcp package");
    
  } finally {
    // Cleanup
    if (originalHome) {
      Deno.env.set("HOME", originalHome);
    } else {
      Deno.env.delete("HOME");
    }
    Deno.chdir(originalCwd);
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Integration: First-run install handles missing directories gracefully", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampante-first-run-" });
  const originalCwd = Deno.cwd();
  
  try {
    Deno.chdir(testDir);
    
    // Don't create any directories - installer should create them
    
    const installerPath = join(originalCwd, "src/cli/install.ts");
    
    const result = await new Deno.Command("deno", {
      args: ["run", "--allow-all", installerPath, "install", "codex"],
      stdout: "piped",
      stderr: "piped",
    }).output();
    
    // Should still succeed
    assertEquals(result.code, 0, "Should succeed even with missing directories");
    
    // Verify directories were created
    assertEquals(await exists(join(testDir, "rampante/command")), true, "rampante/command directory should be created");
    assertEquals(await exists(join(testDir, "recommended-stacks")), true, "recommended-stacks directory should be created");
    
  } finally {
    Deno.chdir(originalCwd);
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Integration: First-run install validates file contents", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampante-first-run-" });
  const originalCwd = Deno.cwd();
  
  try {
    Deno.chdir(testDir);
    
    const installerPath = join(originalCwd, "src/cli/install.ts");
    
    const result = await new Deno.Command("deno", {
      args: ["run", "--allow-all", installerPath, "install", "codex"],
      stdout: "piped",
      stderr: "piped",
    }).output();
    
    assertEquals(result.code, 0, "Install should succeed");
    
    // Verify rampante.md contains expected content
    const rampanteContent = await Deno.readTextFile(join(testDir, "rampante/command", "rampante.md"));
    assertEquals(rampanteContent.includes("/rampante"), true, "rampante.md should contain /rampante command");
    assertEquals(rampanteContent.includes("workflow"), true, "rampante.md should contain workflow description");
    
    // Verify DEFINITIONS.md contains expected content
    const definitionsContent = await Deno.readTextFile(join(testDir, "recommended-stacks", "DEFINITIONS.md"));
    assertEquals(definitionsContent.includes("Stack Definitions"), true, "DEFINITIONS.md should contain stack definitions");
    assertEquals(definitionsContent.includes("Description:"), true, "DEFINITIONS.md should contain description fields");
    
  } finally {
    Deno.chdir(originalCwd);
    await Deno.remove(testDir, { recursive: true });
  }
});