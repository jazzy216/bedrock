# CLAUDE.md — Bedrock

Static, zero-build learning site. Plain HTML/CSS/JS. **No npm install, no bundler, no framework.** Anything that serves static files can host it.

## Layout

```
index.html              app shell (sidebar, topbar, <main id="view">)
assets/css/style.css    all styles; design tokens at the top in :root
assets/js/highlight.js  tiny syntax highlighter (window.Highlight)
assets/js/widgets.js    interactive widgets (window.Widgets, window.mountWidgets)
assets/js/lessons.js    ALL course content + glossary (window.COURSE)
assets/js/app.js        hash router, progress, quizzes, glossary, review deck
vercel.json             static hosting config for Vercel
.nojekyll               tells GitHub Pages to serve files as-is
```

Scripts load in that order as classic scripts (not ES modules), so the site also works when `index.html` is opened directly from disk.

## Deploy (default: GitHub → Vercel, the owner's usual flow)

From the project root:

```bash
git init -b main
git add -A
git commit -m "Initial commit: Bedrock learning site"
gh repo create bedrock --public --source=. --remote=origin --push
```

Then either:
- **Vercel dashboard:** Add New → Project → import the `bedrock` repo. Framework preset: **Other**. Leave build command and output directory empty. Deploy.
- **Vercel CLI:** `npx vercel --prod` and accept the defaults (no build step, output = project root).

Every later `git push` to `main` redeploys automatically once the repo is linked.

## Deploy alternative: GitHub Pages

```bash
gh api -X POST "repos/{owner}/bedrock/pages" -f "source[branch]=main" -f "source[path]=/"
```

Site appears at `https://<user>.github.io/bedrock/`. All asset paths are relative, so the subpath works without changes.

## Local preview

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Editing rules

- **Content** lives only in `assets/js/lessons.js`. Each lesson is `{ id, title, summary, minutes, body, keypoints, quiz }`. Lesson ids are `"<module>-<n>"` and are used in URLs (`#/lesson/2-2`) and saved progress, so don't rename existing ids.
- Inside `body`, use the helpers: `code(src, lang)` for code blocks (langs: csharp, bash, asm, http, text), `widget(name, opts)` to embed a widget, `note(title, html, "warn"?)` for callouts. HTML in `body` must escape `<` as `&lt;` outside of `code()`.
- **New widget:** add `W.myWidget = (el, opts) => { ... }` in `widgets.js`, then `${widget("myWidget", {...})}` in a lesson. Widgets with timers should set `el._cleanup` so the router can stop them.
- Progress is in `localStorage` under keys prefixed `bedrock.` and every access is wrapped in try/catch. Keep it that way.
- Design: zinc neutrals, single accent `--accent` (#5ccf8a), Geist + Geist Mono. No emojis, no pure black, no extra accent colors.
- Before pushing, check for syntax errors: `node --check assets/js/*.js` (run per file).
