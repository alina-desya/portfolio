import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Your live domain (used for canonical URLs, link previews & the sitemap)
export default defineConfig({
  site: 'https://www.alinadocs.com',
  compressHTML: false,
  integrations: [
    mdx(),
    // Builds /sitemap-index.xml listing every published page (except the 404 page)
    sitemap({ filter: (page) => !page.includes('/404') }),
  ],
});
