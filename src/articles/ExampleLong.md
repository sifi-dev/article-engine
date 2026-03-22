---
title: Structuring a Vite + SolidJS Project
date: 2026-03-15
---

Vite and SolidJS are a productive combination. Vite's near-instant dev server and SolidJS's fine-grained reactivity stay out of your way while you build. But a blank `npm create` template leaves you with a flat `src/` folder and no guidance on how to grow it.

This is how I structure a SolidJS project intended to last.

## Folder Conventions

Start with purpose-driven folders rather than tech-driven ones. Tech-driven folders (`hooks/`, `utils/`, `helpers/`) accumulate unrelated code over time. Purpose-driven folders stay coherent.

### Components

Keep components small and focused. A component should do one visual thing. If it needs data, pass a signal in rather than fetching inside the component.

```
src/
  components/
    Nav.tsx
    ArticlesList.tsx
    ArticlePage.tsx
```

### Domain Logic

Put business rules and data transformations in a separate folder, away from JSX.

```
src/
  articles/
    index.ts      ← typed metadata registry
    content.ts    ← raw markdown loader
```

This separation means you can reason about domain logic without mounting any components.

### Styles

A single `styles.css` works well for most projects. CSS custom properties (design tokens) live at the top. Component styles are grouped with comments. No CSS-in-JS needed.

```typescript
/* src/styles.css */
:root {
  --brand-accent: #6d28d9;
  --text-secondary: #4b5563;
}
```

## Routing

`@solidjs/router`'s `<Router>` and `<Route>` cover most cases with minimal boilerplate.

### Route Definitions

Define all routes in one place, at the top of `App.tsx`. Avoid spreading route definitions across the component tree.

```typescript
export default function App(): JSX.Element {
  return (
    <Router root={Shell}>
      <Route path="/" component={() => <Navigate href="/articles" />} />
      <Route path="/articles" component={ArticlesList} />
      <Route path="/articles/:slug" component={ArticlePage} />
    </Router>
  );
}
```

### Typed Params

`useParams()` returns a plain object. Narrow it to a known type at the call site rather than asserting everywhere.

```typescript
const params = useParams<{ slug: string }>();
```

## Signals and Stores

SolidJS signals are the primitive building block. For local UI state, `createSignal` is enough. When multiple pieces of state depend on each other, extract a store factory.

```typescript
import { createSignal, createMemo } from "solid-js";
import type { Accessor, Setter } from "solid-js";
import type { ArticleMetadata } from "../articles/index";

type ArticleStoreReturn = {
  articles: Accessor<ArticleMetadata[]>;
  filtered: Accessor<ArticleMetadata[]>;
  filter: Accessor<string>;
  setFilter: Setter<string>;
};

export function createArticleStore(initialArticles: readonly ArticleMetadata[]): ArticleStoreReturn {
  const [articles] = createSignal<ArticleMetadata[]>([...initialArticles]);
  const [filter, setFilter] = createSignal<string>("");

  const filtered = createMemo(() =>
    articles().filter((a) => a.title.toLowerCase().includes(filter().toLowerCase()))
  );

  return { articles, filtered, filter, setFilter };
}
```

The factory pattern keeps signal creation co-located with the derived memos that depend on them.

## TypeScript Configuration

Settings worth pinning from the start:

| Option | Recommended | Why |
| --- | --- | --- |
| `strict` | `true` | Catches nullability and implicit `any` early |
| `moduleResolution` | `"bundler"` | Matches Vite's resolution algorithm |
| `target` | `"ESNext"` | No unnecessary downcompilation; Vite handles browser targets |
| `isolatedModules` | `true` | Required for single-file transpilation in Vite |
| `jsx` | `"preserve"` | Lets Vite and the SolidJS plugin handle the JSX transform |

Run the compiler in check-only mode before committing:

```bash
tsc --noEmit
```

This catches type errors without producing output. Use it in CI.

## Summary

Keep domain logic separate from rendering, make dependencies explicit, and push side effects to the edges. The folder structure follows from those constraints, not the other way around.
