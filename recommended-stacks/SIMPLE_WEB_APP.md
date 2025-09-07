# Simple Web App Stack

## Overview

A straightforward approach to building web applications with minimal complexity. This stack prioritizes simplicity, rapid development, and ease of maintenance over advanced features.

## Philosophy

- **Simplicity First**: Use proven, stable technologies
- **Minimal Dependencies**: Reduce complexity and maintenance burden
- **Progressive Enhancement**: Start simple, add complexity only when needed
- **Clear Separation**: Distinct frontend and backend concerns

## Core Technologies

### Frontend

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)**: Vanilla JS for interactivity
- **Build Tool**: Vite or Parcel for simple bundling

### Backend

- **Node.js (v20 LTS)**: JavaScript runtime
- **Express.js**: Minimal web framework
- **SQLite**: Simple file-based database
- **Authentication**: Passport.js for basic auth

### Development Tools

- **Testing**: Jest for unit tests, Playwright for E2E
- **Linting**: ESLint with standard config
- **Formatting**: Prettier
- **Version Control**: Git

## Project Structure

```
project-root/
├── frontend/
│   ├── index.html
│   ├── styles/
│   │   └── main.css
│   ├── scripts/
│   │   └── main.js
│   └── assets/
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── models/
│   └── middleware/
├── tests/
│   ├── unit/
│   └── e2e/
├── package.json
└── README.md
```

## Development Workflow

1. **Setup**: `npm install` to install dependencies
2. **Development**: `npm run dev` for hot-reloading
3. **Testing**: `npm test` for all tests
4. **Building**: `npm run build` for production
5. **Deployment**: `npm start` to run production server

## Testing Approach

- **Unit Tests**: Test individual functions and modules
- **Integration Tests**: Test API endpoints
- **E2E Tests**: Test critical user flows
- **Manual Testing**: For UI/UX validation

## Deployment Strategy

### Development

- Local development with hot reload
- SQLite database for simplicity

### Production

- Single server deployment (VPS or PaaS)
- Environment variables for configuration
- Optional: Upgrade to PostgreSQL for production
- Static assets served by Express or CDN

## Context7 Documentation

When using context7, fetch documentation for:

- **Express.js**: Latest Express.js API and middleware
- **Node.js**: Core Node.js modules and APIs
- **JavaScript**: MDN documentation for ES6+ features
- **HTML/CSS**: Latest web standards and browser APIs
- **SQLite**: SQL syntax and Node.js integration

## Best Practices

1. **Keep It Simple**: Don't add complexity until needed
2. **Mobile First**: Design for mobile, enhance for desktop
3. **Accessibility**: Follow WCAG guidelines
4. **Security**: Use helmet.js, validate inputs, sanitize outputs
5. **Performance**: Optimize images, minify assets, use caching

## Common Patterns

### API Design

```javascript
// RESTful routes
GET    /api/items     // List all
GET    /api/items/:id // Get one
POST   /api/items     // Create
PUT    /api/items/:id // Update
DELETE /api/items/:id // Delete
```

### Database Schema

```sql
-- Simple and normalized
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE,
    password_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Frontend Structure

```javascript
// Simple module pattern
const App = {
  init() {
    this.bindEvents();
    this.loadData();
  },
  bindEvents() {
    // Event listeners
  },
  loadData() {
    // Fetch from API
  },
};
```

## Scaling Path

When you outgrow this stack:

1. **Database**: SQLite → PostgreSQL
2. **Frontend**: Vanilla JS → React/Vue
3. **Backend**: Express → Fastify/NestJS
4. **Deployment**: Single server → Container/Kubernetes
