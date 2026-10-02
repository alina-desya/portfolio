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

// Writing samples. The Markdown body becomes a page at /portfolio/samples/<file-name>/.
// Set `url` instead to link to a sample published elsewhere.
const samples = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/samples' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    kind: z.string(), // e.g. "API guide", "Troubleshooting guide"
    highlights: z.array(z.string()).default([]), // what the sample demonstrates
    note: z.string().optional(), // e.g. "Anonymized sample"
    url: z.string().optional(), // external sample instead of a page on this site
    order: z.number().default(100),
  }),
});

export const collections = { projects, samples };
