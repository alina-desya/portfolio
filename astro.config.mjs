import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Pages kept out of the sitemap: the 404 page, work-in-progress pages, and non-HTML files
const sitemapExclude = ['/404', '/mexidocs/', '/speaking/kit/', '.txt'];

// Your live domain (used for canonical URLs, link previews & the sitemap)
export default defineConfig({
  site: 'https://www.alinadocs.com',
  compressHTML: false,
  integrations: [
    mdx(),
    // Builds /sitemap-index.xml listing every published page, minus sitemapExclude
    sitemap({ filter: (page) => !sitemapExclude.some((path) => page.includes(path)) }),
  ],
});
