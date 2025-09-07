import { assertEquals } from "@std/assert";
import { exists } from "@std/fs";
import { join } from "@std/path";

/**
 * Integration test: idempotent re-run and --force
 * Tests that re-running the installer doesn't duplicate files
 * Tests that --force flag recreates assets
 */
Deno.test("Integration: Idempotent re-run does not modify existing files", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampante-idempotency-" });
  const originalCwd = Deno.cwd();
  
  try {
    Deno.chdir(testDir);
    
    // Mock home directory
    const mockHome = await Deno.makeTempDir({ prefix: "mock-home-" });
    const originalHome = Deno.env.get("HOME");
    Deno.env.set("HOME", mockHome);
    
    const installerPath = join(originalCwd, "src/cli/install.ts");
    
    // First run
    const result1 = await new Deno.Command("deno", {
      args: ["run", "--allow-all", installerPath, "install", "codex"],
      stdout: "piped",
      stderr: "piped",
    }).output();
    
    assertEquals(result1.code, 0, "First install should succeed");
    
    // Get file modification times after first run
    const rampanteMdPath = join(testDir, "rampante/command", "rampante.md");
    const definitionsPath = join(testDir, "recommended-stacks", "DEFINITIONS.md");
    const codexRampantPath = join(mockHome, ".codex", "prompts", "rampante.md");
    const codexConfigPath = join(mockHome, ".codex", "config.toml");
    
    const rampanteStat1 = await Deno.stat(rampanteMdPath);
    const definitionsStat1 = await Deno.stat(definitionsPath);
    const codexRampantStat1 = await Deno.stat(codexRampantPath);
    const codexConfigStat1 = await Deno.stat(codexConfigPath);
    
    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Second run (should be idempotent)
    const result2 = await new Deno.Command("deno", {
      args: ["run", "--allow-all", installerPath, "install", "codex"],
      stdout: "piped",
      stderr: "piped",
    }).output();
    
    assertEquals(result2.code, 0, "Second install should succeed");
    
    // Verify files weren't modified (same mtime)
    const rampanteStat2 = await Deno.stat(rampanteMdPath);
    const definitionsStat2 = await Deno.stat(definitionsPath);
    const codexRampantStat2 = await Deno.stat(codexRampantPath);
    const codexConfigStat2 = await Deno.stat(codexConfigPath);
    
    assertEquals(rampanteStat1.mtime, rampanteStat2.mtime, "rampante.md should not be modified on re-run");
    assertEquals(definitionsStat1.mtime, definitionsStat2.mtime, "DEFINITIONS.md should not be modified on re-run");
    assertEquals(codexRampantStat1.mtime, codexRampantStat2.mtime, "Codex rampante.md should not be modified on re-run");
    assertEquals(codexConfigStat1.mtime, codexConfigStat2.mtime, "Codex config.toml should not be modified on re-run");
    
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

Deno.test("Integration: --force flag recreates all assets", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampante-force-" });
  const originalCwd = Deno.cwd();
  
  try {
    Deno.chdir(testDir);
    
    // Mock home directory
    const mockHome = await Deno.makeTempDir({ prefix: "mock-home-" });
    const originalHome = Deno.env.get("HOME");
    Deno.env.set("HOME", mockHome);
    
    const installerPath = join(originalCwd, "src/cli/install.ts");
    
    // First run
    const result1 = await new Deno.Command("deno", {
      args: ["run", "--allow-all", installerPath, "install", "codex"],
      stdout: "piped",
      stderr: "piped",
    }).output();
    
    assertEquals(result1.code, 0, "First install should succeed");
    
    // Get file modification times after first run
    const rampanteMdPath = join(testDir, "rampante/command", "rampante.md");
    const definitionsPath = join(testDir, "recommended-stacks", "DEFINITIONS.md");
    const codexRampantPath = join(mockHome, ".codex", "prompts", "rampante.md");
    const codexConfigPath = join(mockHome, ".codex", "config.toml");
    
    const rampanteStat1 = await Deno.stat(rampanteMdPath);
    const definitionsStat1 = await Deno.stat(definitionsPath);
    const codexRampantStat1 = await Deno.stat(codexRampantPath);
    const codexConfigStat1 = await Deno.stat(codexConfigPath);
    
    // Wait to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Force run
    const result2 = await new Deno.Command("deno", {
      args: ["run", "--allow-all", installerPath, "install", "codex", "--force"],
      stdout: "piped",
      stderr: "piped",
    }).output();
    
    assertEquals(result2.code, 0, "Force install should succeed");
    
    // Verify files were recreated (different mtime)
    const rampanteStat2 = await Deno.stat(rampanteMdPath);
    const definitionsStat2 = await Deno.stat(definitionsPath);
    const codexRampantStat2 = await Deno.stat(codexRampantPath);
    const codexConfigStat2 = await Deno.stat(codexConfigPath);
    
    // Files should have been recreated (different mtime)
    assertEquals(rampanteStat1.mtime !== rampanteStat2.mtime, true, "rampante.md should be recreated with --force");
    assertEquals(definitionsStat1.mtime !== definitionsStat2.mtime, true, "DEFINITIONS.md should be recreated with --force");
    assertEquals(codexRampantStat1.mtime !== codexRampantStat2.mtime, true, "Codex rampante.md should be recreated with --force");
    assertEquals(codexConfigStat1.mtime !== codexConfigStat2.mtime, true, "Codex config.toml should be recreated with --force");
    
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

Deno.test("Integration: --force handles partial installations", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampante-partial-" });
  const originalCwd = Deno.cwd();
  
  try {
    Deno.chdir(testDir);
    
    // Mock home directory
    const mockHome = await Deno.makeTempDir({ prefix: "mock-home-" });
    const originalHome = Deno.env.get("HOME");
    Deno.env.set("HOME", mockHome);
    
    const installerPath = join(originalCwd, "src/cli/install.ts");
    
    // Create some files manually to simulate partial installation
    await Deno.mkdir("rampante/command", { recursive: true });
    await Deno.writeTextFile("rampante/command/rampante.md", "# Partial rampante.md\nThis is a partial file.");
    
    // Verify partial file exists
    assertEquals(await exists(join(testDir, "rampante/command", "rampante.md")), true, "Partial rampante.md should exist");
    
    // Force run should recreate everything
    const result = await new Deno.Command("deno", {
      args: ["run", "--allow-all", installerPath, "install", "codex", "--force"],
      stdout: "piped",
      stderr: "piped",
    }).output();
    
    assertEquals(result.code, 0, "Force install should succeed");
    
    // Verify all files exist
    assertEquals(await exists(join(testDir, "rampante/command", "rampante.md")), true, "rampante.md should exist after force");
    assertEquals(await exists(join(testDir, "recommended-stacks", "DEFINITIONS.md")), true, "DEFINITIONS.md should exist after force");
    assertEquals(await exists(join(mockHome, ".codex", "prompts", "rampante.md")), true, "Codex rampante.md should exist after force");
    assertEquals(await exists(join(mockHome, ".codex", "config.toml")), true, "Codex config.toml should exist after force");
    
    // Verify content was replaced (not the partial content)
    const rampanteContent = await Deno.readTextFile(join(testDir, "rampante/command", "rampante.md"));
    assertEquals(rampanteContent.includes("Partial rampante.md"), false, "Partial content should be replaced");
    
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

Deno.test("Integration: Multiple re-runs maintain consistency", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampante-multiple-" });
  const originalCwd = Deno.cwd();
  
  try {
    Deno.chdir(testDir);
    
    // Mock home directory
    const mockHome = await Deno.makeTempDir({ prefix: "mock-home-" });
    const originalHome = Deno.env.get("HOME");
    Deno.env.set("HOME", mockHome);
    
    const installerPath = join(originalCwd, "src/cli/install.ts");
    
    // Run installer multiple times
    for (let i = 0; i < 3; i++) {
      const result = await new Deno.Command("deno", {
        args: ["run", "--allow-all", installerPath, "install", "codex"],
        stdout: "piped",
        stderr: "piped",
      }).output();
      
      assertEquals(result.code, 0, `Install run ${i + 1} should succeed`);
    }
    
    // Verify all files still exist and are consistent
    assertEquals(await exists(join(testDir, "rampante/command", "rampante.md")), true, "rampante.md should exist after multiple runs");
    assertEquals(await exists(join(testDir, "recommended-stacks", "DEFINITIONS.md")), true, "DEFINITIONS.md should exist after multiple runs");
    assertEquals(await exists(join(mockHome, ".codex", "prompts", "rampante.md")), true, "Codex rampante.md should exist after multiple runs");
    assertEquals(await exists(join(mockHome, ".codex", "config.toml")), true, "Codex config.toml should exist after multiple runs");
    
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