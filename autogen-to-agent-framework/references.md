---
title: References
---

# References

> Every claim on this site is anchored to one or more sources below. Each
> entry has a title, a link, why it matters, and which page it most
> supports.

## Primary repositories

### `microsoft/autogen`

- **Title.** Microsoft AutoGen.
- **Link.** <https://github.com/microsoft/autogen>.
- **Why it matters.** Source of truth for the AutoGen framework — code,
  release notes, discussions, issues. Public-facing docs at
  <https://microsoft.github.io/autogen/stable/>.
- **Supports.** [`autogen-origin.md`](autogen-origin.md),
  [`autogen-architecture.md`](autogen-architecture.md),
  [`autogen-roadblocks.md`](autogen-roadblocks.md), the timeline.

### `microsoft/agent-framework`

- **Title.** Microsoft Agent Framework.
- **Link.** <https://github.com/microsoft/agent-framework>.
- **Why it matters.** Source of truth for MAF — Python (`python/`),
  .NET (`dotnet/`), declarative agents (`declarative-agents/`),
  decision logs (`docs/decisions/`), feature specs (`docs/features/`).
- **Supports.** [`agent-framework-architecture.md`](agent-framework-architecture.md),
  [`why-agent-framework.md`](why-agent-framework.md),
  [`autogen-vs-agent-framework.md`](autogen-vs-agent-framework.md).

## Official Microsoft documentation

### Agent Framework on Microsoft Learn

- **Link.** <https://learn.microsoft.com/en-us/agent-framework/>
- **Why it matters.** Authoritative reference for MAF concepts, APIs,
  workflows, and migration guides.
- **Supports.** Most MAF content; especially
  [`migration-thinking.md`](migration-thinking.md) and
  [`autogen-vs-agent-framework.md`](autogen-vs-agent-framework.md).

### AutoGen → MAF migration guide

- **Link.** <https://learn.microsoft.com/en-us/agent-framework/migration-guide/from-autogen/>
- **Why it matters.** Microsoft's own positioning of the relationship
  between AutoGen and MAF; official statement that MAF middleware is a
  capability AutoGen lacks; explicit "multi-agent migration requires
  rethinking from event-driven to data-flow based architectures."
- **Supports.** [`autogen-roadblocks.md`](autogen-roadblocks.md),
  [`why-agent-framework.md`](why-agent-framework.md),
  [`migration-thinking.md`](migration-thinking.md).

### Semantic Kernel → MAF migration guide

- **Link.** <https://learn.microsoft.com/en-us/agent-framework/migration-guide/from-semantic-kernel/>
- **Why it matters.** SK's role in the convergence; what carries over.
- **Supports.** [`why-agent-framework.md`](why-agent-framework.md),
  [`evolution-timeline.md`](evolution-timeline.md).

### MAF Workflows reference

- **Link.** <https://learn.microsoft.com/en-us/agent-framework/workflows/>
- **Why it matters.** Authoritative description of the workflow engine,
  patterns, checkpointing, HITL.
- **Supports.** [`agent-framework-architecture.md`](agent-framework-architecture.md),
  [`system-design-lessons.md`](system-design-lessons.md).

## Microsoft devblogs and announcements

### "AutoGen reimagined: Launching AutoGen 0.4"

- **Link.** <https://devblogs.microsoft.com/autogen/autogen-reimagined-launching-autogen-0-4/>
- **Date.** January 14 2025 (announce); v0.4 stable released Jan 17 2025.
- **Why it matters.** Original Microsoft post explaining the v0.4 layered
  architecture — Core, AgentChat, Extensions — and the motivation.
- **Supports.** [`autogen-architecture.md`](autogen-architecture.md),
  [`evolution-timeline.md`](evolution-timeline.md).

### "Introducing Microsoft Agent Framework"

- **Link.** <https://azure.microsoft.com/en-us/blog/introducing-microsoft-agent-framework/>
- **Date.** October 1 2025.
- **Why it matters.** Official launch post. Contains the line MAF
  "unifies the enterprise-ready foundations of Semantic Kernel with the
  innovative orchestration of AutoGen."
- **Supports.** [`why-agent-framework.md`](why-agent-framework.md),
  [`evolution-timeline.md`](evolution-timeline.md).

### "Microsoft Agent Framework Version 1.0"

- **Link.** <https://devblogs.microsoft.com/agent-framework/microsoft-agent-framework-version-1-0/>
- **Date.** April 3 2026.
- **Why it matters.** GA 1.0 announcement; LTS commitment for core
  building blocks; preview list.
- **Supports.** [`agent-framework-architecture.md`](agent-framework-architecture.md),
  [`autogen-vs-agent-framework.md`](autogen-vs-agent-framework.md).

### Microsoft Agent Framework Reaches Release Candidate

- **Link.** <https://devblogs.microsoft.com/foundry/microsoft-agent-framework-reaches-release-candidate/>
- **Why it matters.** RC milestone preceding GA; outlines the LTS
  surface.
- **Supports.** [`evolution-timeline.md`](evolution-timeline.md).

### "Microsoft Agent Framework — Building Blocks for AI" (.NET Blog series)

- **Link.** <https://devblogs.microsoft.com/dotnet/microsoft-agent-framework-building-blocks-for-ai-part-3/>
- **Why it matters.** Confirms MAF "builds directly on top of `IChatClient`"
  and explains the layered relationship between MEAI and the agent layer.
- **Supports.** [`agent-framework-architecture.md`](agent-framework-architecture.md).

### "Introducing Microsoft Agent Framework (Preview)" (.NET Blog)

- **Link.** <https://devblogs.microsoft.com/dotnet/introducing-microsoft-agent-framework-preview/>
- **Why it matters.** Companion to the Azure announcement; .NET-focused.
- **Supports.** [`why-agent-framework.md`](why-agent-framework.md).

### "Foundry Agent Service at Ignite 2025"

- **Link.** <https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/foundry-agent-service-at-ignite-2025-simple-to-build-powerful-to-deploy-trusted-/4469788>
- **Why it matters.** Foundry-hosted agents context; managed runtime
  positioning.
- **Supports.** [`agent-framework-architecture.md`](agent-framework-architecture.md),
  [`enterprise-agent-platform-lessons.md`](enterprise-agent-platform-lessons.md).

## Microsoft Research

### AutoGen paper

- **Title.** "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent
  Conversation."
- **Authors.** Q. Wu, G. Bansal, J. Zhang, et al. (Microsoft Research,
  Penn State, University of Washington, Xidian University).
- **Date.** August 2023.
- **Link.** <https://arxiv.org/abs/2308.08155>.
- **Why it matters.** The foundational paper. Defines *conversable
  agents* and *conversation programming*.
- **Supports.** [`autogen-origin.md`](autogen-origin.md),
  [`autogen-architecture.md`](autogen-architecture.md).

### AutoGen Microsoft Research project page

- **Link.** <https://www.microsoft.com/en-us/research/project/autogen/>
- **Why it matters.** Project overview, publications, news.
- **Supports.** [`autogen-origin.md`](autogen-origin.md).

### AutoGen v0.4 forum talk (Microsoft Research Forum)

- **Link.** <https://www.microsoft.com/en-us/research/video/autogen-v0-4-reimagining-the-foundation-of-agentic-ai-for-scale-and-more-microsoft-research-forum/>
- **Why it matters.** Authoritative explanation of the v0.4
  re-architecture motivation.
- **Supports.** [`autogen-architecture.md`](autogen-architecture.md).

## Trade press / industry coverage

### Visual Studio Magazine — "Microsoft Ships Production-Ready Agent Framework 1.0"

- **Link.** <https://visualstudiomagazine.com/articles/2026/04/06/microsoft-ships-production-ready-agent-framework-1-0-for-net-and-python.aspx>
- **Date.** April 6 2026.
- **Why it matters.** Independent corroboration of the GA 1.0 release
  date and language parity.
- **Supports.** [`evolution-timeline.md`](evolution-timeline.md),
  [`why-agent-framework.md`](why-agent-framework.md).

### Visual Studio Magazine — "Semantic Kernel + AutoGen = Open-Source Microsoft Agent Framework"

- **Link.** <https://visualstudiomagazine.com/articles/2025/10/01/semantic-kernel-autogen--open-source-microsoft-agent-framework.aspx>
- **Date.** October 1 2025.
- **Why it matters.** Independent confirmation of the convergence
  framing on the public preview launch day.
- **Supports.** [`why-agent-framework.md`](why-agent-framework.md).

### Microsoft Foundry monthly news

- **Link.** <https://devblogs.microsoft.com/foundry/whats-new-in-microsoft-foundry-oct-nov-2025/>
- **Why it matters.** Tracks the Foundry roadmap items relevant to
  MAF preview features.
- **Supports.** [`evolution-timeline.md`](evolution-timeline.md).

## Useful community write-ups (read with care; verify against primary sources)

- "AutoGen v0.4: A Complete Guide to the Next Generation of Agentic AI" —
  contextual write-up on the 0.4 architecture; community-authored.
- "AutoGen vs LangGraph vs CrewAI vs OpenAgents (2026)" — a useful
  cross-framework framing.
- Langfuse blog: "Comparing Open-Source AI Agent Frameworks" — a
  framework-by-framework comparison from an observability-vendor lens.
- Datadog "State of AI Engineering" — adoption telemetry across
  agentic frameworks.

These are useful for *secondary* perspective; always reconcile with the
primary sources above.

## Internal repository links (this fork)

- [`/python/samples`](../python/samples/) — Python samples organised by
  category (agents, workflows, hosting, observability).
- [`/dotnet/samples`](../dotnet/samples/) — .NET counterpart.
- [`/declarative-agents/`](../declarative-agents/) — YAML agent examples.
- [`/docs/decisions/`](../docs/decisions/) — architecture decision
  records (ADRs) for the framework.
- [`/docs/features/`](../docs/features/) — feature specs.
- [`/docs/research/open-source-agent-frameworks.md`](../docs/research/open-source-agent-frameworks.md) —
  the broader cross-framework deep dive that companions this site.

## Methodology note

I avoided the AutoGen migration page from Microsoft Learn for direct quoting
because the page returned 403 to a programmatic fetch during research; I
relied instead on independent summaries and the public Visual Studio
Magazine and Microsoft devblog corroborations. Where I quote a verbatim
phrase ("unifies the enterprise-ready foundations…"), it appears in
multiple official sources and the Azure Blog launch post.

When in doubt, **trust the repository history and the official release
notes over any third-party retelling, including this one**.
