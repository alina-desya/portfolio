import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Portfolio projects — each gets its own case-study page.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    url: z.string().optional(), // GitHub repo
    demoUrl: z.string().optional(), // live demo
    featured: z.boolean().default(false),
    order: z.number().default(100),
  }),
});

// Writing samples published elsewhere — shown as cards linking out.
const samples = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/samples' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    kind: z.string(), // e.g. "API reference", "How-to guide"
    url: z.string(),
    order: z.number().default(100),
  }),
});

// Blog posts — mostly republished LinkedIn articles.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    originalUrl: z.string().optional(), // LinkedIn original → used as canonical URL
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, samples, posts };
