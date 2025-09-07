import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/testing/asserts.ts";
import { exists } from "https://deno.land/std@0.208.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.208.0/path/mod.ts";
import { installScripts } from "../../src/services/install_scripts.ts";

/**
 * Unit tests for script installer service
 * Tests installation of select-stack.sh and generate-project-overview.sh
 */

Deno.test("Script Installer: Creates scripts directory", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampante-scripts-test-" });
  const originalCwd = Deno.cwd();
  
  try {
    Deno.chdir(testDir);
    
    await installScripts();
    
    // Verify scripts directory exists
    const scriptsDir = join(testDir, "scripts");
    assertEquals(await exists(scriptsDir), true, "Scripts directory should be created");
    
  } finally {
    Deno.chdir(originalCwd);
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Script Installer: Installs select-stack.sh", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampante-scripts-test-" });
  const originalCwd = Deno.cwd();
  
  try {
    Deno.chdir(testDir);
    
    await installScripts();
    
    // Verify select-stack.sh exists
    const selectStackPath = join(testDir, "scripts", "select-stack.sh");
    assertEquals(await exists(selectStackPath), true, "select-stack.sh should be installed");
    
    // Verify content is not empty
    const content = await Deno.readTextFile(selectStackPath);
    assertExists(content, "select-stack.sh should not be empty");
    assertEquals(content.length > 0, true, "select-stack.sh should have content");
    
  } finally {
    Deno.chdir(originalCwd);
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Script Installer: Installs generate-project-overview.sh", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampante-scripts-test-" });
  const originalCwd = Deno.cwd();
  
  try {
    Deno.chdir(testDir);
    
    await installScripts();
    
    // Verify generate-project-overview.sh exists
    const generateOverviewPath = join(testDir, "scripts", "generate-project-overview.sh");
    assertEquals(await exists(generateOverviewPath), true, "generate-project-overview.sh should be installed");
    
    // Verify content is not empty
    const content = await Deno.readTextFile(generateOverviewPath);
    assertExists(content, "generate-project-overview.sh should not be empty");
    assertEquals(content.length > 0, true, "generate-project-overview.sh should have content");
    
  } finally {
    Deno.chdir(originalCwd);
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Script Installer: Idempotent behavior - script exists notification", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampante-scripts-test-" });
  const originalCwd = Deno.cwd();
  
  try {
    Deno.chdir(testDir);
    
    // Create scripts directory and existing file
    await Deno.mkdir(join(testDir, "scripts"), { recursive: true });
    await Deno.writeTextFile(join(testDir, "scripts", "select-stack.sh"), "# Existing file");
    
    // Capture console output
    const originalConsoleLog = console.log;
    let capturedMessages: string[] = [];
    console.log = (...args: unknown[]) => {
      capturedMessages.push(args.join(' '));
    };
    
    try {
      await installScripts();
      
      // Verify notification message was shown
      const hasNotification = capturedMessages.some(msg => 
        msg.includes("select-stack.sh file already exists! Moving on")
      );
      assertEquals(hasNotification, true, "Should notify when script already exists");
      
    } finally {
      console.log = originalConsoleLog;
    }
    
  } finally {
    Deno.chdir(originalCwd);
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Script Installer: Force flag overwrites existing files", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampante-scripts-test-" });
  const originalCwd = Deno.cwd();
  
  try {
    Deno.chdir(testDir);
    
    // Create scripts directory and existing file
    await Deno.mkdir(join(testDir, "scripts"), { recursive: true });
    const existingContent = "# Existing file content";
    await Deno.writeTextFile(join(testDir, "scripts", "select-stack.sh"), existingContent);
    
    // Install with force flag
    await installScripts(true);
    
    // Verify file was overwritten
    const newContent = await Deno.readTextFile(join(testDir, "scripts", "select-stack.sh"));
    assertEquals(newContent !== existingContent, true, "File should be overwritten with force flag");
    assertEquals(newContent.length > existingContent.length, true, "New content should be from template");
    
  } finally {
    Deno.chdir(originalCwd);
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Script Installer: Makes scripts executable", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampante-scripts-test-" });
  const originalCwd = Deno.cwd();
  
  try {
    Deno.chdir(testDir);
    
    await installScripts();
    
    // Check file permissions
    const selectStackPath = join(testDir, "scripts", "select-stack.sh");
    const generateOverviewPath = join(testDir, "scripts", "generate-project-overview.sh");
    
    const selectStackStat = await Deno.stat(selectStackPath);
    const generateOverviewStat = await Deno.stat(generateOverviewPath);
    
    // On Unix-like systems, check for execute permission
    if (selectStackStat.mode !== null && generateOverviewStat.mode !== null) {
      // Check if owner execute bit is set (mode & 0o100)
      assertEquals((selectStackStat.mode & 0o100) !== 0, true, "select-stack.sh should be executable");
      assertEquals((generateOverviewStat.mode & 0o100) !== 0, true, "generate-project-overview.sh should be executable");
    }
    
  } finally {
    Deno.chdir(originalCwd);
    await Deno.remove(testDir, { recursive: true });
  }
});