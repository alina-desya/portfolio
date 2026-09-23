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
    url: z.string().optional(), // live site / repo
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

// Conference talks, webinars, podcasts, videos.
const talks = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/talks' }),
  schema: z.object({
    title: z.string(),
    event: z.string(),
    date: z.coerce.date(),
    location: z.string().optional(), // city or "Online"
    type: z.enum(['Conference', 'Webinar', 'Podcast', 'Workshop', 'Meetup', 'Video']),
    eventUrl: z.string().optional(),
    videoUrl: z.string().optional(), // YouTube links are embedded automatically
    slidesUrl: z.string().optional(),
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

export const collections = { projects, samples, talks, posts };
