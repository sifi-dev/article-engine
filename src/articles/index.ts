export type ArticleLink = {
  readonly text: string;
  readonly url: string;
  readonly category: string;
};

export type Article = {
  readonly slug: string;
  readonly title: string;
  readonly author: string;
  readonly date: string;
  readonly summary: string;
  readonly tags: ReadonlyArray<string>;
  readonly links?: ReadonlyArray<ArticleLink>;
  readonly draft?: boolean;
};

const allArticles: ReadonlyArray<Article> = [
  {
    slug: "example-long",
    title: "Structuring a Vite + SolidJS Project",
    author: "Your Name",
    date: "2026-03-15",
    summary:
      "A practical guide to organising a Vite and SolidJS project for long-term maintainability: folder conventions, typed routing, CSS architecture, and keeping components focused.",
    tags: ["SolidJS", "Vite", "TypeScript"],
    links: [
      { text: "SolidJS docs", url: "https://docs.solidjs.com", category: "Docs" },
      { text: "Vite docs", url: "https://vite.dev", category: "Docs" },
      { text: "@solidjs/router", url: "https://github.com/solidjs/solid-router", category: "Docs" },
    ],
  },
  {
    slug: "example-short",
    title: "Writing Pure Functions in TypeScript",
    author: "Your Name",
    date: "2026-03-01",
    summary:
      "Pure functions are predictable, testable, and easy to reason about. This article covers what makes a function pure, when to reach for them, and a few TypeScript patterns that help.",
    tags: ["TypeScript", "Functional Programming"],
    links: [
      { text: "TypeScript handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html", category: "Docs" },
      { text: "MDN: pure functions", url: "https://developer.mozilla.org/en-US/docs/Glossary/Pure_function", category: "Reference" },
    ],
  },
  {
    slug: "example-draft",
    title: "Example Draft Article",
    author: "Your Name",
    date: "2026-03-20",
    summary: "This article is set as a draft and will not appear in the articles list.",
    tags: ["Draft"],
    draft: true,
  },
];

export const articles: ReadonlyArray<Article> = allArticles
  .filter((a) => !a.draft)
  .sort((a, b) => b.date.localeCompare(a.date));
