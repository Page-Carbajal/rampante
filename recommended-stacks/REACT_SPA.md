# React SPA Stack

## Overview

A modern single-page application stack built with React and TypeScript. Optimized for interactive user interfaces, real-time features, and developer experience.

## Philosophy

- **Component-Based**: Reusable UI components
- **Type Safety**: TypeScript for better developer experience
- **State Management**: Predictable state updates
- **Performance**: Optimized rendering and bundle size

## Core Technologies

### Frontend

- **React 18**: UI library with hooks and concurrent features
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **Zustand**: Lightweight state management
- **TanStack Query**: Server state management
- **Tailwind CSS**: Utility-first styling

### Backend API

- **Node.js + Express**: RESTful API
- **PostgreSQL**: Relational database
- **Prisma**: Type-safe ORM
- **JWT**: Token-based authentication

### Development Tools

- **Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright
- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged

## Project Structure

```
project-root/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── api/
│   │   ├── store/
│   │   └── App.tsx
│   ├── public/
│   ├── index.html
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── server.ts
│   ├── prisma/
│   └── tsconfig.json
├── shared/
│   └── types/
└── package.json
```

## Development Workflow

1. **Setup**:

   ```bash
   npm install
   npm run db:setup
   ```

2. **Development**:

   ```bash
   npm run dev        # Starts both frontend and backend
   npm run dev:front  # Frontend only
   npm run dev:back   # Backend only
   ```

3. **Testing**:

   ```bash
   npm test          # Unit tests
   npm run test:e2e  # E2E tests
   ```

4. **Building**:
   ```bash
   npm run build
   npm run preview
   ```

## Testing Approach

- **Unit Tests**: Components, hooks, utilities
- **Integration Tests**: API endpoints with test database
- **E2E Tests**: Critical user journeys
- **Visual Regression**: Optional with Chromatic

## Component Patterns

### Atomic Design

```typescript
// Atoms
export const Button: FC<ButtonProps> = ({ children, ...props }) => {
  return <button className="..." {...props}>{children}</button>
}

// Molecules
export const SearchBar: FC = () => {
  return (
    <div className="search-bar">
      <Input />
      <Button>Search</Button>
    </div>
  )
}

// Organisms
export const Header: FC = () => {
  return (
    <header>
      <Logo />
      <Navigation />
      <SearchBar />
    </header>
  )
}
```

### Custom Hooks

```typescript
// Data fetching hook
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => api.getUser(id),
  });
};

// Local storage hook
export const useLocalStorage = <T>(key: string, initial: T) => {
  // Implementation
};
```

## State Management

### Local State

```typescript
// Component state with useState
const [count, setCount] = useState(0);

// Complex state with useReducer
const [state, dispatch] = useReducer(reducer, initialState);
```

### Global State

```typescript
// Zustand store
const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

### Server State

```typescript
// TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
});
```

## Deployment Strategy

### Frontend

- **Build**: Static files with Vite
- **Hosting**: Vercel, Netlify, or CloudFlare Pages
- **CDN**: Automatic with hosting providers
- **Environment**: Runtime config via environment variables

### Backend

- **Container**: Docker for consistency
- **Hosting**: Railway, Render, or AWS
- **Database**: Managed PostgreSQL
- **Monitoring**: Basic health checks and logs

## Context7 Documentation

When using context7, fetch documentation for:

- **React**: Latest React hooks, patterns, and APIs
- **TypeScript**: Advanced types and React integration
- **Vite**: Configuration and plugin ecosystem
- **TanStack Query**: Data fetching patterns
- **Tailwind CSS**: Utility classes and customization
- **PostgreSQL**: Advanced queries and performance

## Performance Optimization

1. **Code Splitting**: Route-based lazy loading
2. **Bundle Size**: Tree shaking and dynamic imports
3. **React Optimization**: memo, useMemo, useCallback
4. **Image Optimization**: Next-gen formats, lazy loading
5. **Caching**: HTTP caching and service workers

## Security Best Practices

1. **Authentication**: JWT with refresh tokens
2. **Authorization**: Role-based access control
3. **Input Validation**: Zod schemas on both ends
4. **XSS Prevention**: React's built-in escaping
5. **HTTPS**: Enforced in production
6. **CSP**: Content Security Policy headers
