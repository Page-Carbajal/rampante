# Stack Definitions

This file contains all available technology stacks for the Rampant system. Each stack is designed for specific project types and includes recommended technologies, patterns, and best practices.

## Stack Selection Rules

1. **YOLO Strategy**: Pick the first matching stack without user interaction
2. **Tag Matching**: Compare project prompt against stack tags
3. **Priority**: Lower priority numbers are selected first in ties
4. **Deterministic**: Same prompt always selects same stack

## Available Stacks

### SIMPLE_WEB_APP

- **Description**: A straightforward web application with minimal complexity
- **Tags**: web, frontend, backend, simple, crud, forms
- **Priority**: 1
- **Use Cases**:
  - Basic CRUD applications
  - Simple business websites
  - Form-based applications
  - Small team projects

### REACT_SPA

- **Description**: Modern single-page application using React
- **Tags**: web, frontend, react, spa, javascript, typescript
- **Priority**: 2
- **Use Cases**:
  - Interactive web applications
  - Real-time user interfaces
  - Client-heavy applications
  - Progressive web apps

### FULL_STACK_NODE

- **Description**: Full-stack JavaScript application with Node.js backend
- **Tags**: web, fullstack, node, javascript, typescript, api, database
- **Priority**: 3
- **Use Cases**:
  - API-driven applications
  - Real-time features (WebSocket)
  - Microservices
  - Scalable web services

### MOBILE_REACT_NATIVE

- **Description**: Cross-platform mobile application using React Native
- **Tags**: mobile, ios, android, react-native, javascript, app
- **Priority**: 4
- **Use Cases**:
  - Mobile applications
  - Cross-platform apps
  - Native mobile features
  - Offline-first apps

### PYTHON_API

- **Description**: RESTful API service built with Python
- **Tags**: api, backend, python, rest, microservice, data
- **Priority**: 5
- **Use Cases**:
  - Data processing services
  - Machine learning APIs
  - Scientific computing
  - Backend microservices

### STATIC_SITE

- **Description**: Static website with modern build tools
- **Tags**: static, website, html, css, javascript, jamstack
- **Priority**: 6
- **Use Cases**:
  - Marketing websites
  - Documentation sites
  - Blogs and content sites
  - Landing pages

### CLI_TOOL

- **Description**: Command-line interface tool
- **Tags**: cli, tool, automation, devops, terminal, script
- **Priority**: 7
- **Use Cases**:
  - Developer tools
  - Automation scripts
  - System utilities
  - Build tools

### SERVERLESS_FUNCTIONS

- **Description**: Serverless architecture with cloud functions
- **Tags**: serverless, cloud, functions, aws, lambda, api
- **Priority**: 8
- **Use Cases**:
  - Event-driven processing
  - Webhooks
  - Scheduled tasks
  - Microservices

## Adding New Stacks

To add a new stack:

1. Add entry to this file with unique name
2. Create `/recommended-stacks/<STACK_NAME>.md` with full specification
3. Include all required sections from the template
4. Test with sample prompts

## Stack File Template

Each stack file should include:

- Overview and philosophy
- Core technologies with versions
- Project structure
- Development workflow
- Testing approach
- Deployment strategy
- Context7 documentation mappings
