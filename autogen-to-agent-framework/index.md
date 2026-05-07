---
title: From AutoGen to Microsoft Agent Framework
layout: home
---

# From AutoGen to Microsoft Agent Framework

> Evolution, architecture, mistakes, trade-offs, and lessons.

## Why this matters

In two and a half years, Microsoft's open-source agent stack went from a research
paper ([arXiv 2308.08155](https://arxiv.org/abs/2308.08155), Aug 2023) to a
GA-1.0 production framework with .NET and Python parity (April 2026). That arc
contains some of the most useful engineering lessons in modern AI platforms —
about how *prototype-friendly* abstractions and *production-friendly*
abstractions differ, and what it costs to grow from one to the other.

This site reconstructs the journey:

- **AutoGen** taught the industry that multi-agent conversation was a real
  programming model.
- A year of production usage exposed where conversation-as-orchestration breaks.
- **Microsoft Agent Framework (MAF)** was launched in October 2025 as a unified
  successor combining "the enterprise-ready foundations of Semantic Kernel with
  the innovative orchestration of AutoGen."[^1]
- MAF reached **GA 1.0** on April 3, 2026 with .NET + Python parity, durable
  graph workflows, native HITL, OpenTelemetry, and Foundry hosting.[^2]

## Who should read this

- **ML engineers** evaluating which agent framework to bet on.
- **AI platform engineers** building shared agent runtimes for many teams.
- **Agentic-system designers** wrestling with multi-agent orchestration in production.
- **Engineering managers** sizing a migration off AutoGen 0.2/0.4.
- **Candidates** preparing for senior AI-platform interviews — there is a
  full interview-prep workbook below.
- **Architects** writing a build-vs-buy memo for an enterprise agent platform.

## 60-second summary

| | AutoGen | Microsoft Agent Framework |
|---|---|---|
| **Born** | Microsoft Research, fall 2023[^3] | Microsoft Foundry + Semantic Kernel + AutoGen teams, public preview Oct 2025[^1], GA Apr 2026[^2] |
| **Headline abstraction** | *Conversable agents* exchanging messages | `AIAgent` over `IChatClient` + typed graph `Workflow` |
| **Optimised for** | Research velocity, multi-agent experimentation | Production durability, governance, .NET + Python parity |
| **Languages** | Python (primary) | Python + .NET (parity) |
| **Multi-agent** | GroupChat / Swarm / Magentic-One | Sequential, concurrent, handoff, group chat, Magentic — as typed workflows |
| **Persistence** | Limited | Durable checkpointing, time-travel, resume |
| **HITL** | `UserProxyAgent` | First-class `RequestInfoExecutor` + adapters |
| **Observability** | OpenTelemetry (added in 0.4) | OpenTelemetry-native + DevUI debugger |
| **Hosting** | DIY | Foundry-hosted agents (managed) |
| **Status (May 2026)** | v0.4.x stable; research lineage[^4] | GA 1.0 LTS; Microsoft's recommended default[^2] |

## Key takeaway

> **AutoGen optimised for what an agent could be. MAF optimises for what an agent
> system needs to be in production.** The evolution from one to the other is the
> standard arc of any successful research framework: rich exploration → real
> usage → friction at scale → re-architecture with stronger contracts. None of
> this means AutoGen "failed." AutoGen is doing exactly what successful research
> projects do: it became influential enough that it forced its parent to build
> the next thing.

## Navigate the site

### The AutoGen story

1. [Evolution timeline](evolution-timeline.md)
2. [Origin and motivation](autogen-origin.md)
3. [AutoGen architecture](autogen-architecture.md)
4. [What AutoGen got right](what-autogen-got-right.md)
5. [Where it ran into roadblocks](autogen-roadblocks.md)
6. [Mistakes and lessons learned](mistakes-and-lessons.md)
7. [Engineering trade-offs](tradeoffs.md)

### The MAF story

8. [Why a new framework](why-agent-framework.md)
9. [Agent Framework architecture](agent-framework-architecture.md)
10. [AutoGen vs Agent Framework](autogen-vs-agent-framework.md)
11. [How to think about migration](migration-thinking.md)

### Architect's notebook

12. [Enterprise agent platform lessons](enterprise-agent-platform-lessons.md)
13. [System design lessons](system-design-lessons.md)

### Interview prep

14. [Interview questions (by level)](interview-questions.md)
15. [Follow-up question chains](follow-up-questions.md)
16. [Deep-dive scenarios](deep-dive-scenarios.md)
17. **[Storytelling toolkit](storytelling-toolkit.md)** — new ways to teach this evolution
18. **[Interview mastery techniques](interview-mastery.md)** — modern AI-platform interview prep
19. **[Flashcards](flashcards.md)** — spaced-repetition cards
20. **[Mock interviews](mock-interviews.md)** — full transcripts you can role-play

### References

21. [References](references.md) — every source, what it is, why it matters

## Methodology

Every claim is either **verified** (with a citation) or marked **(inference)**.
The verified facts are anchored to:

- The repositories: [`microsoft/autogen`](https://github.com/microsoft/autogen)
  and [`microsoft/agent-framework`](https://github.com/microsoft/agent-framework).
- The Microsoft Research project page and the original AutoGen paper.
- The official **Microsoft Learn** site for Agent Framework, including the
  AutoGen and Semantic Kernel migration guides.
- Microsoft devblogs on AutoGen and Agent Framework.
- Public release notes and dated announcements.

If you spot a place where I've drifted from the sources, please open an issue.

---

[^1]: "Introducing Microsoft Agent Framework," Microsoft Azure Blog, October 1, 2025. The framework is described as *unifying the enterprise-ready foundations of Semantic Kernel with the innovative orchestration of AutoGen*.
[^2]: "Microsoft Agent Framework Version 1.0," Microsoft devblogs, April 3, 2026; "Microsoft Ships Production-Ready Agent Framework 1.0 for .NET and Python," Visual Studio Magazine, April 6, 2026.
[^3]: AutoGen paper "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation," Wu, Bansal, Zhang, et al., arXiv:2308.08155 (August 2023). The OSS framework was released later in fall 2023.
[^4]: AutoGen v0.4 stable, January 17, 2025. The migration guide on Microsoft Learn explicitly points production users from AutoGen to MAF.
