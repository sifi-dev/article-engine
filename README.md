# article-engine

A minimal, file-based article engine built with SolidJS, Vite, and marked. No database, no CMS, no build pipeline complexity. Articles are markdown files; metadata is a typed TypeScript registry.

## What it does

- Renders a list of articles at `/articles`
- Renders each article at `/articles/:slug`
- Auto-generates a table of contents from H2/H3 headings, with active-section highlighting on scroll
- Code blocks get language badges and a one-click copy button
- External links surface in a sidebar panel, grouped by category
- Draft articles are filtered out at build time via a `draft` flag in the registry
- Dark mode follows system preference

## Stack

| Package | Version |
|---|---|
| solid-js | ^1.9 |
| @solidjs/router | ^0.16 |
| marked | ^17 |
| vite | ^6 |
| TypeScript | ^5.7 |

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:4174/articles`.

## Adding an article

Three files to touch:

**1. Write the markdown**

Create `src/articles/YourArticle.md`. Frontmatter is optional; if present it will be stripped before rendering.

```markdown
---
title: Your Article Title
date: 2026-04-01
---

Article body here.
```

**2. Register the metadata**

Add an entry to `src/articles/index.ts`:

```typescript
{
  slug: "your-article",
  title: "Your Article Title",
  author: "Your Name",
  date: "2026-04-01",
  summary: "One or two sentences shown in the article list.",
  tags: ["TypeScript", "SolidJS"],
  links: [
    { text: "SolidJS docs", url: "https://docs.solidjs.com", category: "Docs" },
  ],
},
```

Set `draft: true` to keep an article out of the list while you're working on it.

**3. Register the content**

Add the `?raw` import to `src/articles/content.ts`:

```typescript
import YourArticle from "./YourArticle.md?raw";

export const articleContent: Record<string, string> = {
  // ...existing entries
  "your-article": YourArticle,
};
```

The slug in `content.ts` must match the `slug` field in `index.ts`.

## Customisation

**Site title** — change the `SITE_TITLE` constant at the top of `src/App.tsx`.

**Colours and typography** — all design tokens are CSS custom properties in the `:root` block at the top of `src/styles.css`. Swap the accent colour, tweak the font stack, adjust spacing.

**Languages** — add entries to `LANG_LABELS` and `LANG_CANONICAL` in `src/components/ArticlePage.tsx` to add language badges and colour coding for additional fence languages.

**App shell** — the `Shell` component in `src/App.tsx` is a plain header. Replace or extend it. The article components (`ArticlePage`, `ArticlesList`) are self-contained and unaware of the shell.

## Building

```bash
npm run build
```

Output goes to `dist/`. The result is a static site; deploy anywhere static files are served.

## License

MIT
