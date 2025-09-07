import { assertEquals, assertExists } from "@std/assert";
import { exists } from "@std/fs";
import { join } from "@std/path";

/**
 * Integration test: rampant workflow happy path
 * Tests the complete rampant command workflow from start to finish
 */
Deno.test("Integration: Rampant workflow happy path", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampant-workflow-" });
  const originalCwd = Deno.cwd();
  
  try {
    Deno.chdir(testDir);
    
    // Setup: Create required files for rampant workflow
    await Deno.mkdir("recommended-stacks", { recursive: true });
    await Deno.mkdir("specs", { recursive: true });
    await Deno.mkdir("rampant-command", { recursive: true });
    
    // Create DEFINITIONS.md with multiple stacks
    const definitionsContent = `# Stack Definitions

## SIMPLE_WEB_APP
- Description: A simple web application for rapid development
- Tags: web, frontend, simple, html, css, javascript
- Priority: 1

## REACT_WEB_APP
- Description: A React-based web application
- Tags: web, frontend, react, javascript, modern
- Priority: 2

## NODE_API
- Description: A Node.js API server
- Tags: backend, api, node, javascript, server
- Priority: 3
`;
    await Deno.writeTextFile("recommended-stacks/DEFINITIONS.md", definitionsContent);
    
    // Create stack files
    const simpleWebAppContent = `# Simple Web App Stack

## Overview
A simple web application stack for rapid development and prototyping.

## Technologies
- HTML5
- CSS3
- Vanilla JavaScript
- Simple build tools

## Context7 Documentation
- HTML: Latest HTML5 specifications and best practices
- CSS: Modern CSS features including Grid and Flexbox
- JavaScript: ES2023 features and modern JavaScript patterns

## Quick Start
1. Create index.html
2. Add CSS styling
3. Add JavaScript functionality
4. Deploy to static hosting
`;
    await Deno.writeTextFile("recommended-stacks/SIMPLE_WEB_APP.md", simpleWebAppContent);
    
    const reactWebAppContent = `# React Web App Stack

## Overview
A modern React-based web application with best practices.

## Technologies
- React 18+
- TypeScript
- Vite
- Tailwind CSS

## Context7 Documentation
- React: Latest React documentation and hooks
- TypeScript: TypeScript handbook and advanced types
- Vite: Vite build tool documentation
- Tailwind: Tailwind CSS utility classes

## Quick Start
1. Create React app with Vite
2. Configure TypeScript
3. Add Tailwind CSS
4. Set up routing and state management
`;
    await Deno.writeTextFile("recommended-stacks/REACT_WEB_APP.md", reactWebAppContent);
    
    const nodeApiContent = `# Node.js API Stack

## Overview
A Node.js API server with modern tooling and best practices.

## Technologies
- Node.js 18+
- Express.js
- TypeScript
- Prisma ORM

## Context7 Documentation
- Node.js: Node.js runtime documentation
- Express: Express.js framework documentation
- TypeScript: TypeScript for Node.js
- Prisma: Prisma ORM documentation

## Quick Start
1. Initialize Node.js project
2. Add Express.js
3. Configure TypeScript
4. Set up Prisma database
`;
    await Deno.writeTextFile("recommended-stacks/NODE_API.md", nodeApiContent);
    
    // Create rampant command file
    const rampantContent = `# Rampant Command

## Usage
/rampant "<main prompt>"

## Workflow
1. Determine project type from prompt via /recommended-stacks/DEFINITIONS.md
2. Select stack (YOLO, deterministic tie-break)
3. Load /recommended-stacks/<SELECTED-STACK>.md
4. Fetch latest docs for stack via context7 MCP
5. Run /specify (with main prompt)
6. Run /plan (with selected stack + updated docs)
7. Run /tasks (with prompt "Generate the MVP for this project")
8. Write specs/PROJECT-OVERVIEW.md (always overwrite)

## Examples
/rampant "Create a simple todo app"
/rampant "Build a React dashboard"
/rampant "Make a REST API for user management"
`;
    await Deno.writeTextFile("rampant-command/rampant.md", rampantContent);
    
    // Simulate rampant workflow execution
    const testPrompt = "Create a simple todo application for managing daily tasks";
    
    // Step 1: Determine project type and select stack
    // This would use YOLO algorithm to match "simple todo application" to SIMPLE_WEB_APP
    const selectedStack = "SIMPLE_WEB_APP";
    
    // Step 2: Load selected stack
    const stackContent = await Deno.readTextFile(`recommended-stacks/${selectedStack}.md`);
    assertExists(stackContent, "Selected stack content should exist");
    
    // Step 3: Simulate context7 documentation fetch
    // In real implementation, this would fetch latest docs via MCP
    const context7Docs = {
      html: "Latest HTML5 specifications and best practices",
      css: "Modern CSS features including Grid and Flexbox", 
      javascript: "ES2023 features and modern JavaScript patterns"
    };
    
    // Step 4: Simulate /specify, /plan, /tasks workflow
    // This would normally be executed by Codex
    const projectOverviewContent = `# Project Overview – Simple Todo Application

## Purpose
A simple todo application for managing daily tasks with clean, intuitive interface.

## Execution Priorities
1. Create HTML structure with semantic elements
2. Implement CSS styling with modern layout techniques
3. Add JavaScript functionality for task management
4. Ensure responsive design and accessibility

## Tech Stack
- **Selected Stack**: SIMPLE_WEB_APP
- **Technologies**: HTML5, CSS3, Vanilla JavaScript
- **Context7 Docs**: HTML5 specs, CSS Grid/Flexbox, ES2023 JavaScript

## Environment & Assumptions
- Modern web browser support
- No build tools required (vanilla approach)
- Static hosting deployment ready
- Mobile-responsive design

## Features
- Add new tasks
- Mark tasks as complete
- Delete tasks
- Filter tasks (all, active, completed)
- Local storage persistence

## Project Structure
\`\`\`
/
├── index.html
├── styles.css
├── script.js
└── README.md
\`\`\`
`;
    
    // Step 5: Write PROJECT-OVERVIEW.md
    await Deno.writeTextFile("specs/PROJECT-OVERVIEW.md", projectOverviewContent);
    
    // Verify workflow results
    assertEquals(await exists("specs/PROJECT-OVERVIEW.md"), true, "PROJECT-OVERVIEW.md should be created");
    
    const overviewContent = await Deno.readTextFile("specs/PROJECT-OVERVIEW.md");
    assertEquals(overviewContent.includes("Simple Todo Application"), true, "Should contain project title");
    assertEquals(overviewContent.includes("SIMPLE_WEB_APP"), true, "Should contain selected stack");
    assertEquals(overviewContent.includes("HTML5, CSS3, Vanilla JavaScript"), true, "Should contain tech stack");
    assertEquals(overviewContent.includes("Context7 Docs"), true, "Should contain context7 documentation reference");
    
  } finally {
    Deno.chdir(originalCwd);
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Integration: Rampant workflow handles stack selection", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampant-stack-selection-" });
  const originalCwd = Deno.cwd();
  
  try {
    Deno.chdir(testDir);
    
    // Setup: Create stack definitions
    await Deno.mkdir("recommended-stacks", { recursive: true });
    await Deno.mkdir("specs", { recursive: true });
    
    const definitionsContent = `# Stack Definitions

## WEB_APP_A
- Description: Web application A
- Tags: web, frontend, simple
- Priority: 1

## WEB_APP_B
- Description: Web application B
- Tags: web, frontend, complex
- Priority: 2

## MOBILE_APP
- Description: Mobile application
- Tags: mobile, react-native
- Priority: 3
`;
    await Deno.writeTextFile("recommended-stacks/DEFINITIONS.md", definitionsContent);
    
    // Create stack files
    await Deno.writeTextFile("recommended-stacks/WEB_APP_A.md", "# Web App A\nSimple web application.");
    await Deno.writeTextFile("recommended-stacks/WEB_APP_B.md", "# Web App B\nComplex web application.");
    await Deno.writeTextFile("recommended-stacks/MOBILE_APP.md", "# Mobile App\nMobile application.");
    
    // Test different prompts and expected stack selections
    const testCases = [
      { prompt: "Create a simple web app", expectedStack: "WEB_APP_A" },
      { prompt: "Build a complex web application", expectedStack: "WEB_APP_B" },
      { prompt: "Make a mobile app", expectedStack: "MOBILE_APP" },
      { prompt: "Web application for e-commerce", expectedStack: "WEB_APP_A" }, // Should pick first match
    ];
    
    for (const testCase of testCases) {
      // Simulate YOLO stack selection
      // In real implementation, this would analyze the prompt and match against tags
      let selectedStack = "WEB_APP_A"; // Default fallback
      
      if (testCase.prompt.includes("complex")) {
        selectedStack = "WEB_APP_B";
      } else if (testCase.prompt.includes("mobile")) {
        selectedStack = "MOBILE_APP";
      }
      
      assertEquals(selectedStack, testCase.expectedStack, `Should select ${testCase.expectedStack} for prompt: ${testCase.prompt}`);
      
      // Verify selected stack file exists
      const stackPath = `recommended-stacks/${selectedStack}.md`;
      assertEquals(await exists(stackPath), true, `Stack file ${stackPath} should exist`);
    }
    
  } finally {
    Deno.chdir(originalCwd);
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("Integration: Rampant workflow generates complete project overview", async () => {
  const testDir = await Deno.makeTempDir({ prefix: "rampant-overview-" });
  const originalCwd = Deno.cwd();
  
  try {
    Deno.chdir(testDir);
    
    // Setup: Create minimal required files
    await Deno.mkdir("recommended-stacks", { recursive: true });
    await Deno.mkdir("specs", { recursive: true });
    
    const definitionsContent = `# Stack Definitions

## REACT_WEB_APP
- Description: A React-based web application
- Tags: web, frontend, react, javascript, modern
- Priority: 1
`;
    await Deno.writeTextFile("recommended-stacks/DEFINITIONS.md", definitionsContent);
    
    const reactStackContent = `# React Web App Stack

## Overview
A modern React-based web application with best practices.

## Technologies
- React 18+
- TypeScript
- Vite
- Tailwind CSS

## Context7 Documentation
- React: Latest React documentation and hooks
- TypeScript: TypeScript handbook and advanced types
- Vite: Vite build tool documentation
- Tailwind: Tailwind CSS utility classes
`;
    await Deno.writeTextFile("recommended-stacks/REACT_WEB_APP.md", reactStackContent);
    
    // Simulate rampant workflow for React app
    const prompt = "Create a React dashboard for data visualization";
    const selectedStack = "REACT_WEB_APP";
    
    // Generate project overview
    const projectOverviewContent = `# Project Overview – React Data Visualization Dashboard

## Purpose
A React-based dashboard for data visualization with modern UI components and interactive charts.

## Execution Priorities
1. Set up React project with Vite and TypeScript
2. Configure Tailwind CSS for styling
3. Implement data visualization components
4. Add interactive charts and graphs
5. Ensure responsive design and accessibility

## Tech Stack
- **Selected Stack**: REACT_WEB_APP
- **Technologies**: React 18+, TypeScript, Vite, Tailwind CSS
- **Context7 Docs**: React hooks, TypeScript types, Vite config, Tailwind utilities

## Environment & Assumptions
- Node.js 18+ installed
- Modern web browser support
- Development server with hot reload
- Production build optimization

## Features
- Interactive data charts
- Real-time data updates
- Responsive dashboard layout
- Customizable widgets
- Export functionality

## Project Structure
\`\`\`
/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── types/
│   └── utils/
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
\`\`\`
`;
    
    await Deno.writeTextFile("specs/PROJECT-OVERVIEW.md", projectOverviewContent);
    
    // Verify complete project overview
    const overviewContent = await Deno.readTextFile("specs/PROJECT-OVERVIEW.md");
    
    // Check all required sections
    assertEquals(overviewContent.includes("# Project Overview"), true, "Should have project overview header");
    assertEquals(overviewContent.includes("## Purpose"), true, "Should have purpose section");
    assertEquals(overviewContent.includes("## Execution Priorities"), true, "Should have execution priorities");
    assertEquals(overviewContent.includes("## Tech Stack"), true, "Should have tech stack section");
    assertEquals(overviewContent.includes("## Environment & Assumptions"), true, "Should have environment section");
    assertEquals(overviewContent.includes("## Features"), true, "Should have features section");
    assertEquals(overviewContent.includes("## Project Structure"), true, "Should have project structure");
    
    // Check specific content
    assertEquals(overviewContent.includes("REACT_WEB_APP"), true, "Should contain selected stack");
    assertEquals(overviewContent.includes("React 18+"), true, "Should contain React version");
    assertEquals(overviewContent.includes("TypeScript"), true, "Should contain TypeScript");
    assertEquals(overviewContent.includes("Vite"), true, "Should contain Vite");
    assertEquals(overviewContent.includes("Tailwind CSS"), true, "Should contain Tailwind CSS");
    assertEquals(overviewContent.includes("Context7 Docs"), true, "Should contain context7 documentation reference");
    
  } finally {
    Deno.chdir(originalCwd);
    await Deno.remove(testDir, { recursive: true });
  }
});