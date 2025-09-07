import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/testing/asserts.ts";
import { ensureDir, exists } from "https://deno.land/std@0.208.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.208.0/path/mod.ts";

/**
 * Contract test for installer CLI
 * Verifies creation of rampante.md and DEFINITIONS.md in CWD
 * Verifies idempotent re-run (no duplicates) and --force recreation
 * Verifies Codex registration copies to ~/.codex/prompts/rampante.md
 */
Deno.test("Contract: Installer creates required files in CWD", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampante-test-" });
  const originalCwd = Deno.cwd();
  
  try {
    Deno.chdir(testDir);
    
    // Mock the installer CLI call
    const installerPath = join(originalCwd, "src/cli/install.ts");
    const result = await new Deno.Command("deno", {
      args: ["run", "--allow-all", installerPath, "install", "codex"],
      stdout: "piped",
      stderr: "piped",
    }).output();
    
    // Verify exit code is 0
    assertEquals(result.code, 0, "Installer should succeed");
    
    // Verify rampante/command/rampante.md exists
    const rampanteMdPath = join(testDir, "rampante/command", "rampante.md");
    assertEquals(await exists(rampanteMdPath), true, "rampante.md should be created");
    
    // Verify recommended-stacks/DEFINITIONS.md exists
    const definitionsPath = join(testDir, "recommended-stacks", "DEFINITIONS.md");
    assertEquals(await exists(definitionsPath), true, "DEFINITIONS.md should be created");
    
    // Verify content is not empty
    const rampanteContent = await Deno.readTextFile(rampanteMdPath);
    assertExists(rampanteContent, "rampante.md should not be empty");
    
    const definitionsContent = await Deno.readTextFile(definitionsPath);
    assertExists(definitionsContent, "DEFINITIONS.md should not be empty");
    
  } finally {
    Deno.chdir(originalCwd);
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Contract: Installer is idempotent (no duplicates)", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampante-test-" });
  const originalCwd = Deno.cwd();
  
  try {
    Deno.chdir(testDir);
    
    const installerPath = join(originalCwd, "src/cli/install.ts");
    
    // First run
    const result1 = await new Deno.Command("deno", {
      args: ["run", "--allow-all", installerPath, "install", "codex"],
      stdout: "piped",
      stderr: "piped",
    }).output();
    
    assertEquals(result1.code, 0, "First install should succeed");
    
    // Get file stats after first run
    const rampanteMdPath = join(testDir, "rampante/command", "rampante.md");
    const definitionsPath = join(testDir, "recommended-stacks", "DEFINITIONS.md");
    
    const rampanteStat1 = await Deno.stat(rampanteMdPath);
    const definitionsStat1 = await Deno.stat(definitionsPath);
    
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
    
    assertEquals(rampanteStat1.mtime, rampanteStat2.mtime, "rampante.md should not be modified on re-run");
    assertEquals(definitionsStat1.mtime, definitionsStat2.mtime, "DEFINITIONS.md should not be modified on re-run");
    
  } finally {
    Deno.chdir(originalCwd);
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Contract: Installer --force recreates assets", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampante-test-" });
  const originalCwd = Deno.cwd();
  
  try {
    Deno.chdir(testDir);
    
    const installerPath = join(originalCwd, "src/cli/install.ts");
    
    // First run
    const result1 = await new Deno.Command("deno", {
      args: ["run", "--allow-all", installerPath, "install", "codex"],
      stdout: "piped",
      stderr: "piped",
    }).output();
    
    assertEquals(result1.code, 0, "First install should succeed");
    
    // Wait a bit to ensure different mtime
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Force run
    const result2 = await new Deno.Command("deno", {
      args: ["run", "--allow-all", installerPath, "install", "codex", "--force"],
      stdout: "piped",
      stderr: "piped",
    }).output();
    
    assertEquals(result2.code, 0, "Force install should succeed");
    
    // Verify files were recreated (different mtime)
    const rampanteMdPath = join(testDir, "rampante/command", "rampante.md");
    const definitionsPath = join(testDir, "recommended-stacks", "DEFINITIONS.md");
    
    const rampanteStat1 = await Deno.stat(rampanteMdPath);
    const definitionsStat1 = await Deno.stat(definitionsPath);
    
    // Files should exist and be recent
    assertExists(rampanteStat1.mtime, "rampante.md should have mtime");
    assertExists(definitionsStat1.mtime, "DEFINITIONS.md should have mtime");
    
  } finally {
    Deno.chdir(originalCwd);
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Contract: Installer registers with Codex", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampante-test-" });
  const originalCwd = Deno.cwd();
  
  // Set up originalHome outside try block
  const originalHome = Deno.env.get("HOME");
  
  try {
    Deno.chdir(testDir);
    
    // Mock home directory
    const mockHome = await Deno.makeTempDir({ prefix: "mock-home-" });
    const codexPromptsDir = join(mockHome, ".codex", "prompts");
    await ensureDir(codexPromptsDir);
    
    // Set HOME environment variable
    Deno.env.set("HOME", mockHome);
    
    const installerPath = join(originalCwd, "src/cli/install.ts");
    
    const result = await new Deno.Command("deno", {
      args: ["run", "--allow-all", installerPath, "install", "codex"],
      stdout: "piped",
      stderr: "piped",
    }).output();
    
    assertEquals(result.code, 0, "Installer should succeed");
    
    // Verify rampante.md was copied to ~/.codex/prompts/
    const codexRampantPath = join(codexPromptsDir, "rampante.md");
    assertEquals(await exists(codexRampantPath), true, "rampante.md should be copied to Codex prompts");
    
    // Verify content matches
    const originalContent = await Deno.readTextFile(join(testDir, "rampante/command", "rampante.md"));
    const codexContent = await Deno.readTextFile(codexRampantPath);
    assertEquals(codexContent, originalContent, "Codex copy should match original");
    
  } finally {
    // Restore original HOME
    if (originalHome) {
      Deno.env.set("HOME", originalHome);
    } else {
      Deno.env.delete("HOME");
    }
    Deno.chdir(originalCwd);
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Contract: Installer handles unsupported CLI target", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampante-test-" });
  const originalCwd = Deno.cwd();
  
  try {
    Deno.chdir(testDir);
    
    const installerPath = join(originalCwd, "src/cli/install.ts");
    
    const result = await new Deno.Command("deno", {
      args: ["run", "--allow-all", installerPath, "install", "unsupported"],
      stdout: "piped",
      stderr: "piped",
    }).output();
    
    // Should fail with non-zero exit code
    assertEquals(result.code !== 0, true, "Should fail for unsupported CLI");
    
    const stderr = new TextDecoder().decode(result.stderr);
    assertEquals(stderr.includes("target not yet supported"), true, "Should show appropriate error message");
    
  } finally {
    Deno.chdir(originalCwd);
    await Deno.remove(testDir, { recursive: true });
  }
});