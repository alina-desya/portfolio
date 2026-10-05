import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// Your live domain (used for canonical URLs & link previews)
export default defineConfig({
  site: 'https://www.alinadocs.com',
  compressHTML: false,
  integrations: [mdx()],
});
