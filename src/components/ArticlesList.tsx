import type { JSX } from "solid-js";
import { For } from "solid-js";
import { A } from "@solidjs/router";
import { articles } from "../articles";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ArticlesList(): JSX.Element {
  return (
    <main>
      <div class="articles-hero">
        <div class="container">
          <div class="hero-tag">Writing</div>
          <h1>Articles</h1>
          <p class="hero-sub">
            A collection of technical articles. Add your own by dropping a
            markdown file and registering it in the metadata registry.
          </p>
        </div>
      </div>

      <section class="section">
        <div class="container">
          <ul class="articles-list">
            <For each={articles}>
              {(article) => (
                <li class="article-card">
                  <A href={`/articles/${article.slug}`} class="article-card-link">
                    <div class="article-meta">
                      <time class="article-date" dateTime={article.date}>
                        {formatDate(article.date)}
                      </time>
                      <div class="article-tags">
                        <For each={article.tags}>
                          {(tag) => <span class="tag">{tag}</span>}
                        </For>
                      </div>
                    </div>
                    <h2 class="article-title">{article.title}</h2>
                    <p class="article-summary">{article.summary}</p>
                    <span class="article-read-more">
                      Read article
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </span>
                  </A>
                </li>
              )}
            </For>
          </ul>
        </div>
      </section>
    </main>
  );
}
