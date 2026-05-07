---
title: Interview mastery
---

# Interview mastery — modern AI-platform interview prep

> Standard interview prep ("read the docs, do leetcode") doesn't work for
> AI-platform roles. The interviewer wants to see *judgment*, not *trivia*.
> This page collects 10 modern techniques tuned for senior agentic-AI
> interviews — most of which apply beyond AutoGen / MAF.

## Technique 1 — The "three-altitudes answer"

For every concept you might be asked about, prepare an answer at three altitudes:

1. **30-second elevator** — one sentence, plus one analogy.
2. **2-minute interview** — definition, why it exists, when it shines, one
   pitfall.
3. **10-minute architecture** — diagrams, trade-offs, alternatives, follow-ups.

**Worked example for "MAF Workflow":**

- *30s.* "A typed graph engine where each node is an executor — agent,
  function, or HITL pause — connected by typed edges with checkpoints.
  Like Airflow for agents, but in-process and streaming."
- *2m.* "Each executor is typed; edges enforce contracts; the runtime
  emits OTel spans per step; checkpoints persist state, enabling resume,
  time-travel, and `RequestInfoExecutor`-shaped HITL pauses. Ergonomics
  via `WorkflowBuilder`. Patterns shipped: sequential, concurrent,
  handoff, group chat, Magentic. Pitfall: don't pile every cross-cutting
  concern into executors; use middleware."
- *10m.* Whiteboard the data flow, contrast with AutoGen group chat,
  show how it composes with `IChatClient`, walk through HITL durability,
  and argue for / against vs LangGraph StateGraph.

**Practice.** Pick 10 core concepts; prepare three altitudes for each.

## Technique 2 — The "red-team your answer" drill

After every prepared answer, ask: *"What's the strongest pushback?"* and
prepare a counter.

**Worked example.**

- **Q.** Why do you prefer typed graph workflows over conversation orchestration?
- **A.** Typed graphs give checkpoints, replay, and clear attribution.
- **Red-team.** *"But typed graphs lose the emergent flexibility of LLM-picked
  speakers."*
- **Counter.** "I keep that flexibility for the genuinely open-ended part —
  a `SelectorGroupChat`-style node inside the typed graph. The graph
  guarantees structure for everything around it."

The interviewer is *looking* for an answer that survives pushback. Show
yours.

## Technique 3 — Three-line war stories (story bank)

Pre-build 6–10 short anecdotes you can drop into any question. Each is
~3 lines, STAR-shaped, and re-usable.

**Format.**

> **Situation.** [1 line.]  
> **Action.** [1 line.]  
> **Result.** [1 line; quantify.]

**Story bank examples** (write your own — these are templates):

> **HITL durability.** Triage agent on AutoGen 0.2 lost officer approvals
> on container restart. Migrated to a typed workflow with persisted
> RequestInfo events. Approval-loss incidents → 0; on-call paged 60% less.

> **Tool gateway.** Three teams independently mis-implemented redaction
> on the same tool. Built a tool gateway with central redaction +
> per-tenant audit. Audit completeness went from 60% to 100% in one sprint.

> **Eval gating.** Prompt change shipped to prod regressed a top-10 task.
> Added golden-set CI with LLM-judge calibrated to humans. Caught the next
> regression in CI before merge.

**How to use.** When asked any "tell me about a time" question, pick the
matching story. When asked an architecture question, drop the relevant
result as a casual aside ("we measured a 60% on-call reduction after this
change").

## Technique 4 — The "explain it 5 ways" exercise

Pick a concept. Explain it as if to:

1. A 12-year-old.
2. A non-technical PM.
3. A backend engineer who's never used LLMs.
4. A senior LLM researcher.
5. A regulator.

**Worked example: "What is HITL?"**

1. *12yo.* "When a robot is about to do something risky, it stops and asks
   a human first."
2. *PM.* "A pause in the workflow where a human approves or rejects an
   action; once approved, the workflow continues from where it stopped."
3. *Backend.* "A durable pause node: the workflow checkpoints state,
   emits a typed approval request to a queue, and resumes when the
   response arrives. Independent of in-process state."
4. *Researcher.* "Approve/reject events injected into a state graph;
   conditioning on approval becomes part of the policy. Trade-off: latency
   vs. governance, with explicit support for SLA escalation paths."
5. *Regulator.* "An auditable approval gate with immutable record of who
   approved what, when, and why; supports the four-eyes principle and
   SLA-bound escalation."

This is the single best prep for "explain X to me" questions.

## Technique 5 — The "whiteboard rep with rubric"

Practice system design with a self-grading rubric.

**Rubric (out of 25):**

| Dimension | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Requirements & scope | missing | partial | clear functional | + non-functional | + risk model |
| Data model | missing | flat | normalised | + indexes | + multi-tenant |
| Architecture | unclear | one box | layered | + boundaries | + failure modes |
| Trade-offs | none | one | three | five | with metrics |
| Follow-ups | passive | reactive | informed | proactive | leads the room |

**Process.** Set a 45-minute timer. Whiteboard a system from
[`system-design-lessons.md`](system-design-lessons.md). Grade yourself.
Iterate.

## Technique 6 — Cross-framework triangulation

When asked "why MAF?", strong candidates also know LangGraph, OpenAI Agents
SDK, CrewAI, and LlamaIndex AgentWorkflow well enough to *triangulate*.

**Drill.** For each MAF concept, name the closest concept in two other
frameworks and the difference.

| MAF | LangGraph | OpenAI SDK |
|---|---|---|
| `AIAgent` over `IChatClient` | `create_react_agent` over LangChain runnables | `Agent` over `Runner` |
| `Workflow` (typed graph) | `StateGraph` (typed dict + reducers) | n/a (no graph engine) |
| `RequestInfoExecutor` (HITL) | `interrupt()` + `Command(resume=…)` | `RunHooks` approvals |
| Middleware pipeline | nodes wrapping LLM/tool calls | guardrails (parallel checks) |
| Checkpointer | `MemorySaver` / `PostgresSaver` | `Sessions` |
| OTel-native + DevUI | OTel + LangSmith + Studio | OTel-native + OpenAI Trace dashboard |

This triangulation shows you understand the *category*, not just one library.

## Technique 7 — Spaced-repetition flashcards

See [`flashcards.md`](flashcards.md). The cards are calibrated for
3 review sessions over 7 days using simple Leitner / Anki cadence.

## Technique 8 — Mock interview transcripts

See [`mock-interviews.md`](mock-interviews.md). Six full transcripts you can
role-play with a friend or alone. They include interviewer cues and the
"strong" / "weak" answer paths.

## Technique 9 — The "unknown unknowns" pre-mortem

Before any interview, run a 10-minute pre-mortem:

> *"It's the day after the interview. I bombed. Why?"*

Common failure modes:

- I waffled on the difference between `interrupt()` and `RequestInfoExecutor`.
- I described AutoGen 0.2 as if it were the current line.
- I couldn't name a concrete trade-off when asked.
- I gave a feature list instead of a story.
- I didn't anchor any answer in a war story.

For each, prepare the antidote in advance.

## Technique 10 — Calibrate with a friend

The single best prep is a 30-min mock with someone willing to push back.
Use the rubric from Technique 5; record yourself; play back the awkward
moments. Fix them.

## A 2-week prep schedule

| Day | Focus |
|---|---|
| 1 | Read [`index.md`](index.md), [`evolution-timeline.md`](evolution-timeline.md), [`autogen-vs-agent-framework.md`](autogen-vs-agent-framework.md). Build three-altitudes for 5 concepts. |
| 2 | [`autogen-architecture.md`](autogen-architecture.md), [`agent-framework-architecture.md`](agent-framework-architecture.md). Draw both architectures from memory. |
| 3 | [`autogen-roadblocks.md`](autogen-roadblocks.md), [`mistakes-and-lessons.md`](mistakes-and-lessons.md). Build the "12 roadblocks → MAF response" map. |
| 4 | [`tradeoffs.md`](tradeoffs.md). Prepare 10 trade-off "interview-ready answers." |
| 5 | [`migration-thinking.md`](migration-thinking.md), [`enterprise-agent-platform-lessons.md`](enterprise-agent-platform-lessons.md). Draw the platform reference architecture from memory. |
| 6 | [`system-design-lessons.md`](system-design-lessons.md). Whiteboard 2 designs against the rubric. |
| 7 | Rest / review flashcards. |
| 8 | [`interview-questions.md`](interview-questions.md) — beginner + intermediate. Practice 10 short answers aloud. |
| 9 | [`interview-questions.md`](interview-questions.md) — advanced. Practice 5 advanced answers aloud. |
| 10 | [`follow-up-questions.md`](follow-up-questions.md). Practice 4 chains aloud, 4 levels deep. |
| 11 | [`deep-dive-scenarios.md`](deep-dive-scenarios.md). Pick 2; whiteboard. |
| 12 | [`mock-interviews.md`](mock-interviews.md). Run 2 mocks with a friend. |
| 13 | Cross-framework triangulation drill (see Technique 6). |
| 14 | Pre-mortem (Technique 9) + final mock + light review. |

## Bonus — interview anti-patterns to avoid

- **Feature listing.** "MAF has middleware, workflows, HITL, OTel..." Boring.
  *Story* the features into a roadblock-and-response narrative.
- **Vendor cheering.** "MAF is better." Don't say "better"; say "a better
  fit for X because Y."
- **Trivia hunting.** Memorising release dates is fine; memorising file
  names in the repo is overkill.
- **Hand-waving on numbers.** If you cite a number (cost, latency, MTTR),
  cite the source or your war story.
- **Skipping pushback.** When the interviewer pushes back, take the
  pushback seriously; don't double down.
