# Static Site Stack

## Overview

A modern static site generator stack optimized for performance, SEO, and developer experience. Perfect for marketing sites, documentation, blogs, and content-driven websites.

## Philosophy

- **JAMstack Architecture**: JavaScript, APIs, and Markup
- **Build-Time Optimization**: Pre-render everything possible
- **Progressive Enhancement**: Works without JavaScript
- **Content-First**: Excellent authoring experience

## Core Technologies

### Static Site Generator

- **Astro 3.0**: Modern SSG with island architecture
- **Alternative: Next.js**: For React-heavy sites
- **Alternative: Hugo**: For maximum build speed

### Content Management

- **Markdown/MDX**: Content authoring
- **Frontmatter**: Metadata management
- **Content Collections**: Type-safe content
- **CMS Options**: Sanity, Contentful, or Git-based

### Styling & UI

- **Tailwind CSS**: Utility-first styling
- **CSS Modules**: Component-scoped styles
- **View Transitions**: Native page animations
- **Dark Mode**: System preference support

### Build & Deploy

- **Vite**: Fast build tooling
- **Sharp**: Image optimization
- **Sitemap**: Auto-generated
- **RSS**: Feed generation

### Development Tools

- **TypeScript**: Type safety (optional)
- **Prettier**: Code formatting
- **ESLint**: Code quality
- **Playwright**: E2E testing

## Project Structure

```
project-root/
├── src/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   └── blog/
│   │       ├── index.astro
│   │       └── [...slug].astro
│   ├── content/
│   │   ├── blog/
│   │   │   ├── post-1.md
│   │   │   └── post-2.mdx
│   │   └── config.ts
│   ├── layouts/
│   │   ├── Base.astro
│   │   └── BlogPost.astro
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── Card.astro
│   ├── assets/
│   │   └── images/
│   └── styles/
│       └── global.css
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── astro.config.mjs
└── package.json
```

## Content Management

### Content Collections

```typescript
// src/content/config.ts
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    author: z.string().default("Anonymous"),
  }),
});

export const collections = { blog };
```

### MDX Components

```mdx
---
title: "Advanced Features"
description: "Using MDX components"
pubDate: 2024-01-15
---

import { Alert, CodeBlock } from "../../components";

# {frontmatter.title}

<Alert type="info">MDX allows you to use components in Markdown!</Alert>

<CodeBlock language="javascript">
  const greeting = "Hello, World!"; console.log(greeting);
</CodeBlock>

Regular markdown content continues here...
```

## Component Architecture

### Astro Components

```astro
---
// Component script
export interface Props {
  title: string;
  image?: string;
  alt?: string;
}

const { title, image, alt = '' } = Astro.props;
---

<article class="card">
  {image && (
    <img
      src={image}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  )}
  <h3>{title}</h3>
  <div class="content">
    <slot />
  </div>
</article>

<style>
  .card {
    @apply rounded-lg shadow-md p-6 bg-white dark:bg-gray-800;
  }

  img {
    @apply w-full h-48 object-cover rounded-t-lg;
  }
</style>
```

### Interactive Islands

```astro
---
// Only loads JavaScript when visible
import Counter from '../components/Counter.tsx';
---

<div>
  <!-- Static content -->
  <h1>My Page</h1>

  <!-- Interactive island -->
  <Counter client:visible initialCount={0} />

  <!-- More static content -->
</div>
```

## SEO & Performance

### Meta Tags

```astro
---
// src/layouts/Base.astro
export interface Props {
  title: string;
  description: string;
  image?: string;
}

const { title, description, image = '/og-image.jpg' } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<head>
  <!-- Primary Meta Tags -->
  <title>{title}</title>
  <meta name="title" content={title} />
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalURL} />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonicalURL} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={new URL(image, Astro.url)} />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={canonicalURL} />
  <meta property="twitter:title" content={title} />
  <meta property="twitter:description" content={description} />
  <meta property="twitter:image" content={new URL(image, Astro.url)} />
</head>
```

### Image Optimization

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
---

<Image
  src={heroImage}
  alt="Hero image"
  widths={[400, 800, 1200]}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw"
  format="webp"
  quality={80}
  loading="eager"
/>
```

## Build Configuration

### Astro Config

```javascript
// astro.config.mjs
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import compress from "astro-compress";

export default defineConfig({
  site: "https://example.com",
  integrations: [tailwind(), mdx(), sitemap(), compress()],
  output: "static",
  build: {
    inlineStylesheets: "auto",
  },
  vite: {
    build: {
      cssMinify: "lightningcss",
    },
  },
});
```

### Environment Variables

```javascript
// Access in Astro components
const apiKey = import.meta.env.PUBLIC_API_KEY;
const secretKey = import.meta.env.SECRET_KEY; // Server only

// .env file
PUBLIC_API_KEY = your - public - key;
SECRET_KEY = your - secret - key;
```

## Data Fetching

### Build-Time Data

```astro
---
// Fetch at build time
const response = await fetch('https://api.example.com/data');
const data = await response.json();

// Or use content collections
import { getCollection } from 'astro:content';
const posts = await getCollection('blog', ({ data }) => {
  return data.draft !== true;
});
---

<ul>
  {data.map(item => (
    <li>{item.name}</li>
  ))}
</ul>
```

### Client-Side Data

```tsx
// For dynamic data
import { useState, useEffect } from "react";

export default function LiveData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/live-data")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return <div>{data ? data.value : "Loading..."}</div>;
}
```

## Forms & Interactivity

### Contact Form

```astro
---
// Server-side form handling
if (Astro.request.method === 'POST') {
  const data = await Astro.request.formData();
  const email = data.get('email');

  // Send email or save to database
  await sendEmail({
    to: 'admin@example.com',
    subject: 'Contact Form',
    body: `Email from: ${email}`,
  });

  return Astro.redirect('/thank-you');
}
---

<form method="POST">
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>
  <button type="submit">Send</button>
</form>
```

## Deployment

### Static Hosting

```yaml
# Netlify deployment
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "https://api.example.com/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

### Edge Functions

```javascript
// Netlify Edge Function
export default async (request, context) => {
  const url = new URL(request.url);

  // A/B testing
  const variant = Math.random() > 0.5 ? "a" : "b";
  url.pathname = `/${variant}${url.pathname}`;

  return context.rewrite(url);
};
```

## Performance Features

### Prefetching

```astro
---
// Prefetch on hover
import { Prefetch } from '@astrojs/prefetch';
---

<Prefetch />

<a href="/about" data-prefetch>About</a>
```

### View Transitions

```astro
---
// Smooth page transitions
import { ViewTransitions } from 'astro:transitions';
---

<head>
  <ViewTransitions />
</head>
```

## Context7 Documentation

When using context7, fetch documentation for:

- **Astro**: Components, content collections, integrations
- **MDX**: Component usage, plugins
- **Tailwind CSS**: Utility classes, configuration
- **Vite**: Build optimization, plugins
- **HTML/CSS**: Modern features, semantic markup
- **JavaScript**: ES modules, web APIs
- **SEO**: Meta tags, structured data

## Best Practices

1. **Performance First**: Optimize images, minimize JS, use CDN
2. **SEO Optimization**: Meta tags, sitemaps, structured data
3. **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
4. **Content Strategy**: Clear information architecture
5. **Progressive Enhancement**: Works without JavaScript
6. **Mobile First**: Responsive design from small screens up
7. **Analytics**: Privacy-respecting analytics (Plausible, Fathom)

## Common Patterns

### Blog Pagination

```astro
---
export async function getStaticPaths({ paginate }) {
  const posts = await getCollection('blog');

  return paginate(posts, {
    pageSize: 10,
  });
}

const { page } = Astro.props;
---

<h1>Blog Page {page.currentPage}</h1>

{page.data.map(post => (
  <BlogCard post={post} />
))}

<Pagination
  prevUrl={page.url.prev}
  nextUrl={page.url.next}
  current={page.currentPage}
  total={page.lastPage}
/>
```

### Multi-Language Support

```astro
---
// src/pages/[lang]/index.astro
export function getStaticPaths() {
  return [
    { params: { lang: 'en' } },
    { params: { lang: 'es' } },
    { params: { lang: 'fr' } },
  ];
}

const { lang } = Astro.params;
const t = await import(`../../locales/${lang}.json`);
---

<h1>{t.welcome}</h1>
```
