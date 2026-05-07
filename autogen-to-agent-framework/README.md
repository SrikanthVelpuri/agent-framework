# From AutoGen to Microsoft Agent Framework

A static GitHub Pages site (Jekyll, `minima` theme) that traces the evolution from
**Microsoft AutoGen** to **Microsoft Agent Framework (MAF)** — including verified
history, design trade-offs, engineering lessons, enterprise patterns, and a deep
interview-prep workbook.

## Why this site exists

Most write-ups treat AutoGen and MAF as competitors. They aren't — they're
**generations** of the same bloodline. AutoGen was a Microsoft Research project
that proved multi-agent conversation could solve real problems; MAF is the
production-grade platform Microsoft built after learning from a year of AutoGen
running in the wild plus enterprise feedback from Semantic Kernel users.

This site reconstructs that evolution from primary sources, marks every
interpretation explicitly, and turns the engineering story into interview-ready
material.

## Structure

```text
autogen-to-agent-framework/
├── index.md
├── evolution-timeline.md
├── autogen-origin.md
├── autogen-architecture.md
├── what-autogen-got-right.md
├── autogen-roadblocks.md
├── mistakes-and-lessons.md
├── tradeoffs.md
├── why-agent-framework.md
├── agent-framework-architecture.md
├── autogen-vs-agent-framework.md
├── migration-thinking.md
├── enterprise-agent-platform-lessons.md
├── system-design-lessons.md
├── interview-questions.md
├── follow-up-questions.md
├── deep-dive-scenarios.md
├── storytelling-toolkit.md      # new ways to tell this story
├── interview-mastery.md         # modern interview prep techniques
├── flashcards.md                # spaced-repetition cards
├── mock-interviews.md           # full mock interview transcripts
├── references.md
├── _config.yml
└── README.md
```

## Run locally

```bash
# from this folder
gem install bundler jekyll
bundle init
echo "gem 'jekyll'" >> Gemfile
echo "gem 'minima'" >> Gemfile
bundle install
bundle exec jekyll serve
```

Open <http://localhost:4000>.

## Publish to GitHub Pages

This folder is already shipped inside the
[`microsoft/agent-framework`](https://github.com/microsoft/agent-framework) fork
under `autogen-to-agent-framework/`. To publish from a fresh repository:

```bash
git init
git add .
git commit -m "Create AutoGen to Agent Framework deep dive site"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

Then in **GitHub → Settings → Pages**:

1. **Source:** Deploy from a branch
2. **Branch:** `main`
3. **Folder:** `/` (root) if the site is at repo root, or `/autogen-to-agent-framework`
   if you keep the folder inside another repo (set Pages to that folder via the
   "Custom path" UI, or move the contents to `/docs` and pick `/docs`)
4. **Save**

Within a couple of minutes the site will be live at
`https://<your-user>.github.io/<your-repo>/`.

## Validation policy

Every claim about AutoGen or Agent Framework is one of:

- **Verified** — backed by an official Microsoft source (the repos, MS Learn, Microsoft
  devblogs, Microsoft Research papers, or release notes); cited in
  [`references.md`](references.md).
- **Inference** — explicitly marked **(inference)** when the conclusion is the
  author's, even if grounded in verified facts.

If you find a mistake, please open an issue. The site treats the AutoGen team
and the MAF team with respect — this is an engineering retrospective, not a
critique.

## Suggested future improvements

- Expand the migration code samples with paired AutoGen 0.4 / MAF Python and .NET
  snippets for the full pattern catalog.
- Add a Mermaid sequence diagram for each multi-agent pattern (RoundRobin,
  Selector, Swarm, Magentic, MAF group chat, MAF handoff, MAF Magentic).
- Add a downloadable PDF of the interview-prep section.
- Add a quiz mode (HTML page reading flashcards.md) for self-testing.
- Add ADR-style "decision logs" derived from the public PRs and issues that
  shaped MAF.
