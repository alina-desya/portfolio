# Alina Desyatnikova — portfolio

Built with [Astro](https://astro.build). Content is plain Markdown; the site deploys to GitHub Pages.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:4321.

## Where things live

| To change…                         | Edit                                     |
| ---------------------------------- | ---------------------------------------- |
| Name, tagline, email, links, photo | `src/site.config.ts`                     |
| Your photo / headshots             | `public/images/`                         |
| Your CV                            | `public/files/cv.pdf`                    |
| Bio, experience, skills            | `src/pages/about.astro`                  |
| Speaker bios & talk topics         | `src/pages/speaking/kit.astro`           |
| MexiDocs page                      | `src/pages/mexidocs.astro`               |

## Adding content (one Markdown file each)

- **Talk / video** → `src/content/talks/my-talk.md`. YouTube links in `videoUrl` are embedded automatically. Talks with a future date show under "Upcoming".
- **Blog post** → `src/content/posts/my-post.md`. Set `originalUrl` to the LinkedIn article, so search engines treat LinkedIn as the original.
- **Project** → `src/content/projects/my-project.md`. The body becomes the case-study page. Set `featured: true` to show it on the home page.
- **Writing sample** → `src/content/samples/my-sample.md`. Shown as a card that links out.

Copy an existing file in the same folder and change the fields at the top.

## Deploy

1. Push this folder to a GitHub repo.
2. Go to repo **Settings → Pages → Source: GitHub Actions**.
3. Every push to `main` publishes the site (`.github/workflows/deploy.yml`).
4. Set your real domain in `astro.config.mjs` (`site:`). If you don't use a custom domain and the repo isn't `<username>.github.io`, also add `base: '/<repo-name>'`.
