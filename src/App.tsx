import type { JSX } from "solid-js";
import { Router, Route, Navigate } from "@solidjs/router";
import ArticlesList from "./components/ArticlesList";
import ArticlePage from "./components/ArticlePage";

// ── Change this to your site's title ──────────────────────────────────────────
const SITE_TITLE = "article-engine";

function Shell(props: { children?: JSX.Element }): JSX.Element {
  return (
    <>
      <header class="site-header">
        <div class="container">
          <a href="/articles" class="site-title">{SITE_TITLE}</a>
        </div>
      </header>
      {props.children}
    </>
  );
}

export default function App(): JSX.Element {
  return (
    <Router root={Shell}>
      <Route path="/" component={() => <Navigate href="/articles" />} />
      <Route path="/articles" component={ArticlesList} />
      <Route path="/articles/:slug" component={ArticlePage} />
    </Router>
  );
}
