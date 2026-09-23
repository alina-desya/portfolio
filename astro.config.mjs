import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// TODO: replace with your real domain once you have one (used for canonical URLs & link previews)
export default defineConfig({
  site: 'https://example.com',
  compressHTML: false,
  integrations: [mdx()],
});
