# Full Stack Node.js Stack

## Overview

A comprehensive JavaScript/TypeScript stack for building full-featured web applications with Node.js on both frontend and backend. Optimized for team collaboration, scalability, and modern development practices.

## Philosophy

- **JavaScript Everywhere**: One language across the entire stack
- **API-First**: Clear separation between frontend and backend
- **Scalable Architecture**: Microservice-ready design
- **Real-Time Capable**: WebSocket support built-in
- **DevOps Friendly**: Container-ready with monitoring

## Core Technologies

### Backend

- **Node.js (v20 LTS)**: JavaScript runtime
- **Express.js / Fastify**: Web framework (Fastify for performance)
- **TypeScript**: Type safety across the stack
- **PostgreSQL**: Primary database
- **Redis**: Caching and sessions
- **Bull**: Job queues
- **Socket.io**: Real-time communication

### Frontend

- **Next.js**: React framework with SSR/SSG
- **TypeScript**: Shared types with backend
- **Tailwind CSS**: Utility-first styling
- **SWR / TanStack Query**: Data fetching
- **Zustand**: State management

### Infrastructure

- **Docker**: Containerization
- **Docker Compose**: Local development
- **Nginx**: Reverse proxy
- **PM2**: Process management (alternative to containers)

### Development Tools

- **Turborepo**: Monorepo management
- **Jest**: Unit testing
- **Supertest**: API testing
- **Playwright**: E2E testing
- **ESLint & Prettier**: Code quality

## Project Structure

```
project-root/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── pages/
│   │   ├── components/
│   │   ├── lib/
│   │   └── public/
│   └── api/                 # Node.js backend
│       ├── src/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── models/
│       │   ├── middleware/
│       │   └── server.ts
│       └── prisma/
├── packages/
│   ├── shared/              # Shared types & utils
│   ├── ui/                  # Shared UI components
│   └── config/              # Shared configs
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   └── docker-compose.yml
├── turbo.json
└── package.json
```

## API Design

### RESTful Endpoints

```typescript
// Resource-based routing
router.get("/api/v1/users", userController.list);
router.get("/api/v1/users/:id", userController.get);
router.post("/api/v1/users", validate(userSchema), userController.create);
router.put("/api/v1/users/:id", userController.update);
router.delete("/api/v1/users/:id", userController.delete);

// Nested resources
router.get("/api/v1/users/:userId/posts", postController.listByUser);
```

### WebSocket Events

```typescript
// Real-time features
io.on("connection", (socket) => {
  socket.on("join:room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("message:send", async (data) => {
    const message = await messageService.create(data);
    io.to(data.roomId).emit("message:new", message);
  });
});
```

## Database Architecture

### Schema Design

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  profile   Profile?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  tags      Tag[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([authorId, published])
}
```

### Migrations

```bash
# Prisma migrations
npx prisma migrate dev --name add_user_posts
npx prisma migrate deploy # Production
```

## Authentication & Authorization

### JWT Strategy

```typescript
// Token generation
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "24h" },
);

// Middleware
export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await userService.findById(decoded.userId);
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Role-based access
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
};
```

## Caching Strategy

### Redis Integration

```typescript
// Cache service
export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl = 3600) {
    await redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern: string) {
    const keys = await redis.keys(pattern);
    if (keys.length) {
      await redis.del(...keys);
    }
  }
}

// Usage in API
const cachedUser = await cache.get(`user:${id}`);
if (cachedUser) return res.json(cachedUser);

const user = await userService.findById(id);
await cache.set(`user:${id}`, user);
```

## Background Jobs

### Queue Processing

```typescript
// Job definitions
const emailQueue = new Bull("email", {
  redis: { host: "localhost", port: 6379 },
});

emailQueue.process(async (job) => {
  const { to, subject, template, data } = job.data;
  await emailService.send(to, subject, template, data);
});

// Job creation
await emailQueue.add("welcome-email", {
  to: user.email,
  subject: "Welcome!",
  template: "welcome",
  data: { name: user.name },
});
```

## Development Workflow

1. **Setup**:

   ```bash
   npm install
   docker-compose up -d postgres redis
   npm run db:migrate
   npm run db:seed
   ```

2. **Development**:

   ```bash
   npm run dev          # Starts all services
   npm run dev:api      # Backend only
   npm run dev:web      # Frontend only
   ```

3. **Testing**:
   ```bash
   npm run test         # All tests
   npm run test:unit    # Unit tests only
   npm run test:api     # API tests
   npm run test:e2e     # End-to-end tests
   ```

## Deployment Strategy

### Docker Deployment

```dockerfile
# Multi-stage build for API
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Environment Configuration

```env
# Production environment
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db:5432/myapp
REDIS_URL=redis://redis:6379
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://myapp.com
```

## Monitoring & Logging

### Structured Logging

```typescript
import winston from "winston";

export const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
  ],
});

// Usage
logger.info("User created", { userId: user.id });
logger.error("Database error", { error: err.message });
```

## Context7 Documentation

When using context7, fetch documentation for:

- **Node.js**: Core modules, streams, cluster
- **Express/Fastify**: Middleware, routing, plugins
- **PostgreSQL**: Advanced queries, performance tuning
- **Redis**: Data structures, pub/sub, Lua scripts
- **Next.js**: App router, API routes, optimization
- **TypeScript**: Advanced types, decorators
- **Docker**: Multi-stage builds, compose syntax

## Performance Optimization

1. **Database**: Connection pooling, query optimization, indexes
2. **Caching**: Redis for sessions, API responses, computed data
3. **API**: Response compression, rate limiting, pagination
4. **Frontend**: Code splitting, image optimization, CDN
5. **Monitoring**: APM tools, custom metrics, alerts

## Security Best Practices

1. **Authentication**: JWT with refresh tokens, OAuth2 support
2. **API Security**: Rate limiting, CORS, helmet.js
3. **Data Validation**: Input sanitization, SQL injection prevention
4. **Secrets Management**: Environment variables, secret rotation
5. **HTTPS**: TLS everywhere, HSTS headers
6. **Dependencies**: Regular updates, security audits
