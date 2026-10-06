import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { copyFile } from 'node:fs/promises';

// Pages kept out of the sitemap: the 404 page, work-in-progress pages, and non-HTML files
const sitemapExclude = ['/404', '/mexidocs/', '/speaking/kit/', '.txt'];

// After the build, copy the full page list (sitemap-0.xml) to /sitemap.xml,
// so the common /sitemap.xml address lists every page directly.
const sitemapAlias = {
  name: 'sitemap-alias',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      await copyFile(new URL('sitemap-0.xml', dir), new URL('sitemap.xml', dir));
    },
  },
};

// Your live domain (used for canonical URLs, link previews & the sitemap)
export default defineConfig({
  site: 'https://www.alinadocs.com',
  compressHTML: false,
  integrations: [
    mdx(),
    // Builds /sitemap-index.xml and /sitemap-0.xml listing every published page, minus sitemapExclude.
    // sitemap.xsl only changes how the sitemap looks in a browser; search engines ignore it.
    sitemap({
      filter: (page) => !sitemapExclude.some((path) => page.includes(path)),
      xslURL: '/sitemap.xsl',
    }),
    sitemapAlias, // must come after sitemap()
  ],
});
