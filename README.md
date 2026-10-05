# Alina Desiatnikova — portfolio

Source for [www.alinadocs.com](https://www.alinadocs.com). Built with [Astro](https://astro.build). Content is written in MDX (Markdown that can also use components); the site deploys to GitHub Pages.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:4321.

## Where things live

| To change…                              | Edit                                      |
| --------------------------------------- | ----------------------------------------- |
| Name, tagline, email, links, photo, CV  | `src/site.config.ts`                      |
| Show or hide MexiDocs and the speaker kit | `showMexiDocs` / `showSpeakerKit` in `src/site.config.ts` |
| Your photo                              | `public/images/`                          |
| Your CV                                 | `public/files/Alina-Desiatnikova-CV.pdf`  |
| Text on any page                        | `src/content/pages/<page>.mdx`            |
| Bio, experience, skills                 | `src/content/pages/about.mdx`             |
| Talks, webinars, and videos             | `src/content/pages/speaking.mdx`          |
| Featured LinkedIn posts & newsletter    | `src/content/pages/blog.mdx`              |
| "Page not found" (404) page             | `src/content/pages/not-found.mdx`         |
| Speaker bios & talk topics (hidden)     | `src/content/pages/speaker-kit.mdx`       |
| MexiDocs page (hidden)                  | `src/content/pages/mexidocs.mdx`          |
| Page layout & styling                   | `src/pages/*.astro`                       |
| Domain (canonical URLs, sitemap)        | `site` in `astro.config.mjs`              |

Each page's short text (headline, intro, lists) is in the fields at the top of its `.mdx` file; longer prose goes below the `---`. The `description` field is the page's search snippet; keep it to 120–160 characters.

## Adding content

- **Talk / video** → add an entry to `src/content/pages/speaking.mdx` (instructions are at the top of the file). YouTube links in `video` are embedded automatically.
- **Featured post** → add an entry to `posts` in `src/content/pages/blog.mdx`, newest first. Cards link to LinkedIn.
- **Project** → `src/content/projects/my-project.mdx`. The body becomes the project page. Set `featured: true` to show it on the home page.
- **Writing sample** → `src/content/samples/my-sample.md`. The body becomes its own page; set `url` instead to link to a sample published elsewhere.

For projects and samples, copy an existing file in the same folder and change the fields at the top.

## Deploy

Every push to `main` publishes the site via GitHub Actions (`.github/workflows/deploy.yml`). A sitemap is generated automatically at `/sitemap-index.xml`.

Keep `public/googleb250fb346a0194a8.html`: it verifies the site in Google Search Console.
