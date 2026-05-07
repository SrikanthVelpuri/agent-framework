# Agent Framework — Concept &amp; Interview Dashboard

A static GitHub Pages dashboard that turns the `docs/` tree of [microsoft/agent-framework](https://github.com/microsoft/agent-framework)
into a browseable dashboard with story-driven deep dives and ladder-style interview questions.

No build step, no server, no dependencies (one CDN script for markdown rendering).

## What's in here

- [`index.html`](index.html) — the SPA entry
- [`css/styles.css`](css/styles.css) — dark/light theme, dashboard layout
- [`js/data.js`](js/data.js) — full catalog + the five-lens content for featured concepts
- [`js/app.js`](js/app.js) — routing, search, interview mode, progress persistence

## Five-lens authoring

Every featured concept has:

| Lens | What it gives you |
| --- | --- |
| **Storyteller** | Hook → Conflict → Turn → Payoff narrative |
| **Architect** | Problem · Forces · Decision · Trade-offs · Reversibility |
| **Staff Engineer** | Failure-mode appendix (what breaks at scale) |
| **Hiring Manager** | Multi-level interview ladder with model answers |
| **UX Lead** | Source markdown viewer, timer, progress tracking |

## Running locally

It's a pure static dashboard. Any of these works:

```bash
# Python
python -m http.server 8000 --directory dashboard

# Node (npx)
npx serve dashboard

# VS Code
# Right-click dashboard/index.html → "Open with Live Server"
```

Then open http://localhost:8000.

## Deploying to GitHub Pages

Two options.

### Option A — GitHub Actions workflow (recommended)

The repo includes [`.github/workflows/pages.yml`](../.github/workflows/pages.yml). Push to `main`, then in your repo:

1. **Settings → Pages → Source** → choose `GitHub Actions`.
2. The workflow uploads `dashboard/` and deploys it. URL is shown in the workflow summary.

### Option B — branch-based deploy (no workflow)

If you'd rather GitHub Pages serve from a branch:

```bash
git checkout --orphan gh-pages
git rm -rf .
cp -R dashboard/* .
touch .nojekyll
git add .
git commit -m "Deploy dashboard"
git push origin gh-pages
```

Then **Settings → Pages → Source** → `gh-pages` branch / `(root)`.

## Customisation

- **Add a concept** — append a row to `CATALOG` in `js/data.js`. If you want the full deep-dive treatment, add a matching key in `DEEP_DIVES` with `story`, `architect`, `failureModes`, and `interview`.
- **Tune the interview ladder** — every question can have a `followUps` array, recursively. Each leaf should include a `modelAnswer` and at least one design / critique prompt.
- **Theme** — edit CSS variables at the top of `css/styles.css`.
- **Search** — the search box matches title, summary, ADR number, tags, plus the JSON of story and interview blocks. Add new searchable fields by extending `matchesFilter()` in `js/app.js`.

## Notes

- The "Source markdown" tab fetches files from `https://github.com/microsoft/agent-framework/raw/main/...`. If the repo is renamed or the dashboard runs under a different fork, edit `REPO_BASE` in `js/data.js`.
- Progress (`mastered` flags, theme) is stored in `localStorage` under `maf_dashboard_progress_v1` and `maf_dashboard_theme`. Use the **Reset progress** button in Interview Mode to clear.
