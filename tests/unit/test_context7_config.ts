import { assertEquals, assertExists } from "@std/assert";
import { exists } from "@std/fs";
import { join } from "@std/path";

/**
 * Unit tests for context7 config writer
 * Tests configuration file creation and management
 */
Deno.test("Unit: createContext7Config creates config file", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "context7-config-test-" });
  
  try {
    // Test createContext7Config function (to be implemented)
    const createContext7Config = async (configPath: string, apiKey: string): Promise<void> => {
      const configContent = `[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp", "--api-key", "${apiKey}"]
`;
      await Deno.writeTextFile(configPath, configContent);
    };
    
    const configPath = join(testDir, "config.toml");
    const apiKey = "test-api-key-123";
    
    // Config file shouldn't exist initially
    assertEquals(await exists(configPath), false, "Config file should not exist initially");
    
    // Create config file
    await createContext7Config(configPath, apiKey);
    
    // Config file should exist now
    assertEquals(await exists(configPath), true, "Config file should exist after creation");
    
    // Verify content
    const content = await Deno.readTextFile(configPath);
    assertEquals(content.includes("[mcp_servers.context7]"), true, "Should contain context7 server config");
    assertEquals(content.includes('command = "npx"'), true, "Should contain npx command");
    assertEquals(content.includes("@upstash/context7-mcp"), true, "Should contain context7-mcp package");
    assertEquals(content.includes(apiKey), true, "Should contain API key");
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Unit: updateContext7Config updates existing config", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "context7-config-test-" });
  
  try {
    // Test updateContext7Config function (to be implemented)
    const updateContext7Config = async (configPath: string, apiKey: string): Promise<void> => {
      let content = "";
      
      // Read existing config if it exists
      try {
        content = await Deno.readTextFile(configPath);
      } catch {
        // File doesn't exist, start with empty content
      }
      
      // Check if context7 config already exists
      if (content.includes("[mcp_servers.context7]")) {
        // Update existing config
        content = content.replace(
          /args = \["-y", "@upstash\/context7-mcp", "--api-key", "[^"]*"\]/,
          `args = ["-y", "@upstash/context7-mcp", "--api-key", "${apiKey}"]`
        );
      } else {
        // Add new config
        content += `\n[mcp_servers.context7]\ncommand = "npx"\nargs = ["-y", "@upstash/context7-mcp", "--api-key", "${apiKey}"]\n`;
      }
      
      await Deno.writeTextFile(configPath, content);
    };
    
    const configPath = join(testDir, "config.toml");
    const originalApiKey = "original-api-key";
    const newApiKey = "new-api-key-456";
    
    // Create initial config
    await Deno.writeTextFile(configPath, `[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp", "--api-key", "${originalApiKey}"]
`);
    
    // Update config
    await updateContext7Config(configPath, newApiKey);
    
    // Verify updated content
    const content = await Deno.readTextFile(configPath);
    assertEquals(content.includes(newApiKey), true, "Should contain new API key");
    assertEquals(content.includes(originalApiKey), false, "Should not contain original API key");
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Unit: ensureCodexConfigDir creates directory structure", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "context7-config-test-" });
  
  try {
    // Test ensureCodexConfigDir function (to be implemented)
    const ensureCodexConfigDir = async (homeDir: string): Promise<string> => {
      const codexDir = join(homeDir, ".codex");
      const promptsDir = join(codexDir, "prompts");
      
      await Deno.mkdir(codexDir, { recursive: true });
      await Deno.mkdir(promptsDir, { recursive: true });
      
      return codexDir;
    };
    
    const codexDir = await ensureCodexConfigDir(testDir);
    
    // Verify directories were created
    assertEquals(await exists(codexDir), true, "Codex directory should exist");
    assertEquals(await exists(join(codexDir, "prompts")), true, "Prompts directory should exist");
    
    // Calling again should not fail
    await ensureCodexConfigDir(testDir);
    assertEquals(await exists(codexDir), true, "Codex directory should still exist after second call");
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Unit: validateContext7Config validates config format", () => {
  // Test validateContext7Config function (to be implemented)
  const validateContext7Config = (content: string): { valid: boolean; error?: string } => {
    if (!content.includes("[mcp_servers.context7]")) {
      return { valid: false, error: "Missing context7 server configuration" };
    }
    
    if (!content.includes('command = "npx"')) {
      return { valid: false, error: "Missing npx command" };
    }
    
    if (!content.includes("@upstash/context7-mcp")) {
      return { valid: false, error: "Missing context7-mcp package" };
    }
    
    if (!content.includes("--api-key")) {
      return { valid: false, error: "Missing API key argument" };
    }
    
    return { valid: true };
  };
  
  // Valid config
  const validConfig = `[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp", "--api-key", "test-key"]
`;
  
  const validResult = validateContext7Config(validConfig);
  assertEquals(validResult.valid, true, "Valid config should pass validation");
  
  // Invalid configs
  const invalidConfigs = [
    { config: "", error: "Missing context7 server configuration" },
    { config: "[mcp_servers.context7]", error: "Missing npx command" },
    { config: `[mcp_servers.context7]
command = "npx"`, error: "Missing context7-mcp package" },
    { config: `[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]`, error: "Missing API key argument" },
  ];
  
  for (const { config, error } of invalidConfigs) {
    const result = validateContext7Config(config);
    assertEquals(result.valid, false, "Invalid config should fail validation");
    assertEquals(result.error, error, "Should return correct error message");
  }
});

Deno.test("Unit: getContext7ApiKey extracts API key from config", () => {
  // Test getContext7ApiKey function (to be implemented)
  const getContext7ApiKey = (content: string): string | null => {
    const match = content.match(/args = \["-y", "@upstash\/context7-mcp", "--api-key", "([^"]*)"\]/);
    return match ? match[1] : null;
  };
  
  const configWithKey = `[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp", "--api-key", "sk-1234567890abcdef"]
`;
  
  const apiKey = getContext7ApiKey(configWithKey);
  assertEquals(apiKey, "sk-1234567890abcdef", "Should extract API key correctly");
  
  // Config without API key
  const configWithoutKey = `[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]
`;
  
  const noApiKey = getContext7ApiKey(configWithoutKey);
  assertEquals(noApiKey, null, "Should return null when no API key found");
});

Deno.test("Unit: context7 config handles malformed TOML", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "context7-config-test-" });
  
  try {
    // Test handling of malformed TOML (to be implemented)
    const parseContext7Config = (content: string): { success: boolean; error?: string } => {
      try {
        // Simple TOML parsing for context7 config
        if (!content.includes("[mcp_servers.context7]")) {
          throw new Error("Missing context7 section");
        }
        
        // Check for basic structure
        const lines = content.split("\n");
        let hasCommand = false;
        let hasArgs = false;
        
        for (const line of lines) {
          if (line.includes('command = "npx"')) hasCommand = true;
          if (line.includes("args =")) hasArgs = true;
        }
        
        if (!hasCommand) throw new Error("Missing command");
        if (!hasArgs) throw new Error("Missing args");
        
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    };
    
    // Valid config
    const validConfig = `[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp", "--api-key", "test-key"]
`;
    
    const validResult = parseContext7Config(validConfig);
    assertEquals(validResult.success, true, "Valid config should parse successfully");
    
    // Malformed configs
    const malformedConfigs = [
      { config: "invalid toml content", error: "Missing context7 section" },
      { config: "[mcp_servers.context7]\ninvalid line", error: "Missing command" },
      { config: `[mcp_servers.context7]
command = "npx"`, error: "Missing args" },
    ];
    
    for (const { config, error } of malformedConfigs) {
      const result = parseContext7Config(config);
      assertEquals(result.success, false, "Malformed config should fail parsing");
      assertEquals(result.error, error, "Should return correct error message");
    }
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Unit: context7 config preserves existing config sections", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "context7-config-test-" });
  
  try {
    // Test that adding context7 config preserves other sections (to be implemented)
    const addContext7Config = async (configPath: string, apiKey: string): Promise<void> => {
      let content = "";
      
      try {
        content = await Deno.readTextFile(configPath);
      } catch {
        // File doesn't exist, start with empty content
      }
      
      // Add context7 config if not present
      if (!content.includes("[mcp_servers.context7]")) {
        content += `\n[mcp_servers.context7]\ncommand = "npx"\nargs = ["-y", "@upstash/context7-mcp", "--api-key", "${apiKey}"]\n`;
      }
      
      await Deno.writeTextFile(configPath, content);
    };
    
    const configPath = join(testDir, "config.toml");
    const existingConfig = `[other_server]
command = "other-command"
args = ["arg1", "arg2"]

[another_server]
command = "another-command"
args = ["arg3", "arg4"]
`;
    
    // Create config with existing sections
    await Deno.writeTextFile(configPath, existingConfig);
    
    // Add context7 config
    await addContext7Config(configPath, "test-api-key");
    
    // Verify all sections are preserved
    const content = await Deno.readTextFile(configPath);
    assertEquals(content.includes("[other_server]"), true, "Should preserve other_server section");
    assertEquals(content.includes("[another_server]"), true, "Should preserve another_server section");
    assertEquals(content.includes("[mcp_servers.context7]"), true, "Should add context7 section");
    assertEquals(content.includes("test-api-key"), true, "Should contain API key");
    
  } finally {
    await Deno.remove(testDir, { recursive: true });
  }
});