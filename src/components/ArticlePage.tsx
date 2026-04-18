import type { JSX } from "solid-js";
import { createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { useParams, A } from "@solidjs/router";
import { marked } from "marked";
import type { ArticleLink } from "../articles";
import { articles } from "../articles";
import { articleContent } from "../articles/content";

// ── Utilities ────────────────────────────────────────────────────────────────

function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith("---")) return markdown;
  const end = markdown.indexOf("---", 3);
  if (end === -1) return markdown;
  return markdown.slice(end + 3).trimStart();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-");
}

// ── Language badge map ───────────────────────────────────────────────────────

const LANG_LABELS: Record<string, string> = {
  fsharp: "F#",
  csharp: "C#",
  typescript: "TS",
  ts: "TS",
  javascript: "JS",
  js: "JS",
  python: "Py",
  bash: "Bash",
  shell: "Bash",
  sh: "Bash",
  markdown: "MD",
  md: "MD",
  sql: "SQL",
  json: "JSON",
  xml: "XML",
  html: "HTML",
  css: "CSS",
  yaml: "YAML",
  dockerfile: "Docker",
  rust: "Rust",
  ocaml: "OCaml",
  gleam: "Gleam",
  editorconfig: "INI",
  llm: "LLM",
  prompt: "LLM",
};

// Normalise aliases to a canonical key used for the data-lang attribute
const LANG_CANONICAL: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  sh: "bash",
  shell: "bash",
  md: "markdown",
  prompt: "llm",
};

// ── marked extensions (initialised once at module level) ─────────────────────

marked.use({
  renderer: {
    heading({ tokens, depth, raw }) {
      // Strip leading hashes from raw to get the plain text slug source
      const plainRaw = raw.replace(/^#{1,6}\s*/, "").replace(/\n$/, "");
      const id = slugifyHeading(plainRaw);
      // `text` is the already-rendered inner HTML (handles bold, code, etc.)
      const text = tokens.map((t) => ("text" in t ? (t as { text: string }).text : "")).join("");
      return `<h${depth} id="${id}">${text}</h${depth}>\n`;
    },
    code({ text, lang }) {
      const langKey = (lang ?? "").toLowerCase().split(/[\s,{]/)[0];
      const canonical = LANG_CANONICAL[langKey] ?? langKey;
      const label = LANG_LABELS[langKey];
      const badge = label
        ? `<span class="code-lang">${label}</span>`
        : "";
      const langClass = langKey ? ` class="language-${langKey}"` : "";
      const dataLang = canonical ? ` data-lang="${canonical}"` : "";
      const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<div class="code-block"${dataLang}>${badge}<button class="code-copy" aria-label="Copy code" title="Copy"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button><pre><code${langClass}>${escaped}</code></pre></div>\n`;
    },
  },
});

// ── TOC extraction ────────────────────────────────────────────────────────────

type TocEntry = { level: 2 | 3; text: string; id: string };

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1");
}

function extractToc(markdown: string): TocEntry[] {
  const entries: TocEntry[] = [];
  const re = /^(#{2,3})\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    const level = m[1].length as 2 | 3;
    const rawText = m[2].trim();
    const text = stripInlineMarkdown(rawText);
    const id = slugifyHeading(rawText);
    entries.push({ level, text, id });
  }
  return entries;
}

// ── TOC render helper ─────────────────────────────────────────────────────────

function TocList(props: { entries: TocEntry[]; activeId: string }): JSX.Element {
  // Build a nested structure: each H2 with its following H3s
  const groups: Array<{ h2: TocEntry; children: TocEntry[] }> = [];
  for (const entry of props.entries) {
    if (entry.level === 2) {
      groups.push({ h2: entry, children: [] });
    } else {
      if (groups.length > 0) {
        groups[groups.length - 1].children.push(entry);
      }
    }
  }

  // A group is expanded when the active heading is the H2 itself or one of its H3 children
  const isExpanded = (g: { h2: TocEntry; children: TocEntry[] }) =>
    props.activeId === g.h2.id || g.children.some((c) => c.id === props.activeId);

  return (
    <ul class="toc-list">
      <li>
        <a
          href="#"
          class={`toc-link toc-link-h2${props.activeId === "" ? " toc-link-active" : ""}`}
        >
          Introduction
        </a>
      </li>
      <For each={groups}>
        {(g) => (
          <li>
            <a
              href={`#${g.h2.id}`}
              class={`toc-link toc-link-h2${props.activeId === g.h2.id ? " toc-link-active" : ""}`}
            >
              {g.h2.text}
            </a>
            <Show when={g.children.length > 0 && isExpanded(g)}>
              <ul class="toc-sublist">
                <For each={g.children}>
                  {(child) => (
                    <li>
                      <a
                        href={`#${child.id}`}
                        class={`toc-link toc-link-h3${props.activeId === child.id ? " toc-link-active" : ""}`}
                      >
                        {child.text}
                      </a>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </li>
        )}
      </For>
    </ul>
  );
}

// ── Links panel helper ────────────────────────────────────────────────────────

function LinksPanel(props: { links: ReadonlyArray<ArticleLink> }): JSX.Element {
  const categories = () => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const l of props.links) {
      if (!seen.has(l.category)) {
        seen.add(l.category);
        result.push(l.category);
      }
    }
    return result;
  };

  return (
    <div class="links-panel-inner">
      <p class="sidebar-heading">Links</p>
      <For each={categories()}>
        {(cat) => (
          <div class="links-panel-group">
            <p class="links-panel-category">{cat}</p>
            <ul class="links-panel-list">
              <For each={props.links.filter((l) => l.category === cat)}>
                {(link) => (
                  <li>
                    <a href={link.url} class="links-panel-link" target="_blank" rel="noopener noreferrer">
                      {link.text}
                    </a>
                  </li>
                )}
              </For>
            </ul>
          </div>
        )}
      </For>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ArticlePage(): JSX.Element {
  const params = useParams();
  const [activeId, setActiveId] = createSignal("");

  const article = createMemo(() =>
    articles.find((a) => a.slug === params.slug)
  );

  const rawMarkdown = createMemo(() => {
    const slug = params.slug;
    if (!slug) return "";
    const content = articleContent[slug];
    if (!content) return "";
    return stripFrontmatter(content);
  });

  const html = createMemo(() => {
    const md = rawMarkdown();
    if (!md) return "";
    const raw = String(marked.parse(md));
    // Wrap tables so they can scroll on narrow viewports and expand on wide ones
    return raw
      .replaceAll("<table>", '<div class="table-overflow"><table>')
      .replaceAll("</table>", "</table></div>");
  });

  const toc = createMemo(() => extractToc(rawMarkdown()));

  onMount(() => {
    const bodyEl = document.querySelector<HTMLElement>(".article-body");
    if (!bodyEl) return;

    const headings = bodyEl.querySelectorAll<HTMLElement>("h2[id], h3[id]");
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).id;
            setActiveId(id === "article-intro-sentinel" ? "" : id);
          }
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    const sentinel = document.getElementById("article-intro-sentinel");
    if (sentinel) observer.observe(sentinel);
    headings.forEach((h) => observer.observe(h));
    onCleanup(() => observer.disconnect());

    // Copy button — event delegation
    const handleCopy = (e: MouseEvent) => {
      const btn = (e.target as Element).closest<HTMLButtonElement>(".code-copy");
      if (!btn) return;
      const code = btn.closest(".code-block")?.querySelector("code");
      if (!code) return;
      navigator.clipboard.writeText(code.innerText).then(() => {
        btn.classList.add("code-copy-success");
        setTimeout(() => btn.classList.remove("code-copy-success"), 1500);
      });
    };
    bodyEl.addEventListener("click", handleCopy);
    onCleanup(() => bodyEl.removeEventListener("click", handleCopy));

    // Widen code blocks whose content is wider than the prose column
    for (const block of bodyEl.querySelectorAll<HTMLElement>(".code-block")) {
      const pre = block.querySelector("pre");
      if (pre && pre.scrollWidth > 720) {
        block.classList.add("code-block--wide");
      }
    }
  });

  const hasLinks = () => {
    const a = article();
    return a?.links != null && a.links.length > 0;
  };

  return (
    <Show
      when={article()}
      fallback={
        <main class="section">
          <div class="container">
            <p>Article not found.</p>
            <A href="/articles" class="article-back">← Back to articles</A>
          </div>
        </main>
      }
    >
      {(a) => (
        <main>
          <div class="article-hero">
            <div class="container">
              <A href="/articles" class="article-back">← Articles</A>
              <div class="article-hero-tags">
                {a().tags.map((tag) => (
                  <span class="tag tag-light">{tag}</span>
                ))}
              </div>
              <h1 class="article-hero-title">{a().title}</h1>
              <div class="article-byline">
                <span>{a().author}</span>
                <span class="article-byline-sep">·</span>
                <time dateTime={a().date}>{formatDate(a().date)}</time>
              </div>
            </div>
          </div>

          <div class="section article-section">
            <div class="article-layout-wrapper">

              {/* Desktop TOC — left */}
              <aside class="article-toc">
                <Show when={toc().length > 0}>
                  <p class="sidebar-heading">Contents</p>
                  <TocList entries={toc()} activeId={activeId()} />
                </Show>
              </aside>

              {/* Main content column */}
              <div class="article-main">

                {/* Mobile TOC — collapsible above body */}
                <Show when={toc().length > 0}>
                  <details class="article-toc-mobile" open>
                    <summary>Contents</summary>
                    <TocList entries={toc()} activeId={activeId()} />
                  </details>
                </Show>

                <div id="article-intro-sentinel" />
                <div class="article-body" innerHTML={html()} />

                {/* Mobile links — below body */}
                <Show when={hasLinks()}>
                  <aside class="article-links-mobile">
                    <LinksPanel links={a().links!} />
                  </aside>
                </Show>
              </div>

              {/* Desktop links — right */}
              <aside class="article-links">
                <Show when={hasLinks()}>
                  <LinksPanel links={a().links!} />
                </Show>
              </aside>

            </div>
          </div>
        </main>
      )}
    </Show>
  );
}
