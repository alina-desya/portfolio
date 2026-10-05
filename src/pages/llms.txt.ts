// Generates /llms.txt: a plain-text guide to this site for AI tools (see https://llmstxt.org).
// It is built from the same content as the pages, so it updates automatically.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../site.config';
import { frontmatter as about } from '../content/pages/about.mdx';
import { frontmatter as services } from '../content/pages/services.mdx';
import { frontmatter as speaking } from '../content/pages/speaking.mdx';
import { frontmatter as blog } from '../content/pages/blog.mdx';

export const GET: APIRoute = async ({ site: siteUrl }) => {
  const url = (path: string) => new URL(path, siteUrl).href;
  const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
  const samples = (await getCollection('samples')).sort((a, b) => a.data.order - b.data.order);
  const talks = speaking.sections.flatMap((s: { talks: any[] }) => s.talks);

  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.role}. ${site.tagline}`,
    '',
    about.lead.trim(),
    `Contact: ${site.email} · LinkedIn: ${site.links.linkedin}`,
    '',
    '## Pages',
    `- [About](${url('/about/')}): ${about.description}`,
    `- [Services](${url('/services/')}): ${services.description}`,
    `- [Portfolio](${url('/portfolio/')}): Projects and writing samples.`,
    `- [Speaking](${url('/speaking/')}): ${speaking.description}`,
    `- [Blog](${url('/blog/')}): ${blog.description}`,
    `- [Contact](${url('/contact/')}): How to get in touch.`,
    `- [CV (PDF)](${url(site.cv)}): Full CV.`,
    '',
    '## Projects',
    ...projects.map((p) => `- [${p.data.title}](${url(`/portfolio/${p.id}/`)}): ${p.data.summary}`),
    '',
    '## Writing samples',
    ...samples.map((s) => `- [${s.data.title}](${s.data.url ?? url(`/portfolio/samples/${s.id}/`)}): ${s.data.summary}`),
    '',
    '## Talks',
    ...talks.map((t) => {
      const link = t.video ?? t.links?.[0]?.url;
      const title = link ? `[${t.title}](${link})` : t.title;
      // Skip the date when the event name already contains it (e.g. "Write the Docs Portland 2026")
      const date = t.date && !String(t.event).includes(String(t.date)) ? t.date : null;
      return `- ${title}: ${[t.event, date].filter(Boolean).join(', ')}`;
    }),
    '',
    '## Writing on LinkedIn',
    `- [${blog.newsletter.name}](${site.links.newsletter}): ${blog.newsletter.audience}.`,
    ...blog.posts.map((p: { title: string; url: string; summary?: string }) => `- [${p.title}](${p.url})${p.summary ? `: ${p.summary.trim()}` : ''}`),
    '',
  ];

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
