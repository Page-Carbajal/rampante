# CLI Tool Stack

## Overview

A modern command-line interface tool stack optimized for developer experience, cross-platform compatibility, and maintainability. Built with TypeScript and modern Node.js features.

## Philosophy

- **Developer First**: Excellent help text and error messages
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Fast Startup**: Minimal dependencies, quick execution
- **Extensible**: Plugin architecture for growth

## Core Technologies

### Runtime & Language

- **Node.js (v20 LTS)**: JavaScript runtime
- **TypeScript**: Type safety and better DX
- **Commander.js**: CLI framework
- **Chalk**: Terminal styling
- **Ora**: Elegant spinners
- **Inquirer**: Interactive prompts

### Development Tools

- **Build**: esbuild for fast bundling
- **Testing**: Vitest for unit tests
- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Prettier
- **Packaging**: pkg or @vercel/ncc

## Project Structure

```
project-root/
├── src/
│   ├── commands/
│   │   ├── init.ts
│   │   ├── build.ts
│   │   └── deploy.ts
│   ├── lib/
│   │   ├── config.ts
│   │   ├── logger.ts
│   │   └── utils.ts
│   ├── types/
│   └── index.ts
├── tests/
│   ├── unit/
│   └── integration/
├── bin/
│   └── cli.js
├── package.json
├── tsconfig.json
└── README.md
```

## Command Structure

### Main Entry Point

```typescript
#!/usr/bin/env node
import { Command } from "commander";
import { version } from "../package.json";

const program = new Command();

program
  .name("mytool")
  .description("CLI tool for awesome things")
  .version(version);

// Register commands
program
  .command("init")
  .description("Initialize a new project")
  .option("-t, --template <type>", "project template")
  .action(initCommand);

program.parse();
```

### Command Implementation

```typescript
export async function initCommand(options: InitOptions) {
  const spinner = ora("Initializing project...").start();

  try {
    // Validate options
    const config = await validateConfig(options);

    // Execute command logic
    await createProjectStructure(config);
    await installDependencies(config);

    spinner.succeed("Project initialized successfully!");
  } catch (error) {
    spinner.fail("Failed to initialize project");
    logger.error(error);
    process.exit(1);
  }
}
```

## Configuration Management

### User Configuration

```typescript
// ~/.myconfig/config.json
interface UserConfig {
  defaultTemplate: string;
  analytics: boolean;
  theme: "dark" | "light";
}

// Config loading with defaults
export async function loadConfig(): Promise<UserConfig> {
  const configPath = path.join(os.homedir(), ".myconfig", "config.json");

  if (await exists(configPath)) {
    return JSON.parse(await fs.readFile(configPath, "utf8"));
  }

  return DEFAULT_CONFIG;
}
```

### Project Configuration

```typescript
// Project .myconfig.json
interface ProjectConfig {
  version: string;
  plugins: string[];
  settings: Record<string, unknown>;
}
```

## Error Handling

### User-Friendly Errors

```typescript
export class CLIError extends Error {
  constructor(
    message: string,
    public code: string,
    public suggestions?: string[],
  ) {
    super(message);
  }
}

export function handleError(error: unknown): never {
  if (error instanceof CLIError) {
    console.error(chalk.red(`Error: ${error.message}`));

    if (error.suggestions?.length) {
      console.log("\nSuggestions:");
      error.suggestions.forEach((s) => console.log(chalk.yellow(`  • ${s}`)));
    }

    process.exit(1);
  }

  // Unexpected errors
  console.error(chalk.red("Unexpected error occurred"));
  console.error(error);
  process.exit(1);
}
```

## Testing Approach

### Unit Tests

```typescript
describe("config loader", () => {
  it("loads user config from home directory", async () => {
    const config = await loadConfig();
    expect(config).toHaveProperty("defaultTemplate");
  });

  it("returns defaults when config missing", async () => {
    vi.mock("fs/promises", () => ({
      readFile: vi.fn().mockRejectedValue(new Error("ENOENT")),
    }));

    const config = await loadConfig();
    expect(config).toEqual(DEFAULT_CONFIG);
  });
});
```

### Integration Tests

```typescript
describe("init command", () => {
  it("creates project structure", async () => {
    const result = await runCLI(["init", "--template", "basic"]);

    expect(result.exitCode).toBe(0);
    expect(await exists("./package.json")).toBe(true);
  });
});
```

## Interactive Features

### Prompts

```typescript
import inquirer from "inquirer";

export async function promptProjectDetails() {
  return inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Project name:",
      validate: (input) => !!input || "Name is required",
    },
    {
      type: "list",
      name: "template",
      message: "Select template:",
      choices: ["basic", "advanced", "minimal"],
    },
    {
      type: "confirm",
      name: "git",
      message: "Initialize git repository?",
      default: true,
    },
  ]);
}
```

### Progress Indicators

```typescript
export async function downloadTemplate(url: string) {
  const spinner = ora("Downloading template...").start();

  try {
    const progress = new ProgressBar("[:bar] :percent :etas", {
      complete: "█",
      incomplete: "░",
      width: 40,
      total: 100,
    });

    await download(url, {
      onProgress: (percent) => progress.update(percent),
    });

    spinner.succeed("Template downloaded");
  } catch (error) {
    spinner.fail("Download failed");
    throw error;
  }
}
```

## Distribution

### NPM Package

```json
{
  "name": "my-cli-tool",
  "version": "1.0.0",
  "bin": {
    "mytool": "./bin/cli.js"
  },
  "files": ["dist", "bin"],
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Standalone Binaries

```bash
# Using pkg
pkg . --targets node18-linux-x64,node18-macos-x64,node18-win-x64

# Using @vercel/ncc
ncc build src/index.ts -o dist
```

## Context7 Documentation

When using context7, fetch documentation for:

- **Commander.js**: Command parsing and options
- **Node.js**: File system, child processes, OS APIs
- **TypeScript**: Advanced types for CLI development
- **Inquirer.js**: Interactive prompt patterns
- **Chalk**: Terminal styling options
- **Testing**: CLI testing strategies

## Best Practices

1. **Help Text**: Comprehensive and examples for every command
2. **Exit Codes**: Consistent non-zero codes for failures
3. **Verbosity**: Support --verbose and --quiet flags
4. **Config Files**: Support both global and project configs
5. **Updates**: Built-in update checker
6. **Analytics**: Optional, privacy-respecting usage stats

## Common Patterns

### Plugin System

```typescript
export interface Plugin {
  name: string;
  version: string;
  register(program: Command): void;
}

export async function loadPlugins(config: Config) {
  for (const pluginName of config.plugins) {
    const plugin = await import(pluginName);
    plugin.register(program);
  }
}
```

### Shell Integration

```bash
# Completion script
mytool completion bash > /etc/bash_completion.d/mytool
mytool completion zsh > /usr/local/share/zsh/site-functions/_mytool
```
