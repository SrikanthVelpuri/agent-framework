---
title: Flashcards
---

# Flashcards (spaced-repetition)

> 50 cards. Each is *front* (question or prompt) + *back* (model answer).
> Use the simple Leitner cadence: Day 1 review all → Day 3 review missed
> → Day 7 review missed. Or import into Anki via the table below.
>
> Anki import format: cells separated by `|`, fields *front* and *back*.

## How to use

1. Cover the right column.
2. Read the left column.
3. Try to give the answer aloud in 30–60s.
4. Reveal the right column; grade yourself **easy / hard / failed**.
5. Move "failed" cards to a "tomorrow" pile; "hard" to "in 3 days"; "easy"
   to "in 7 days".

## Cards 1–10 — origins & timeline

| Front | Back |
|---|---|
| When was the AutoGen paper published? | Aug 2023 (arXiv:2308.08155, Wu/Bansal/Zhang et al.). |
| When was AutoGen v0.4 stable released? | January 17, 2025. |
| When was Microsoft Agent Framework introduced (public preview)? | October 1, 2025. |
| When did MAF reach 1.0 GA? | April 3, 2026. |
| What does the official MAF announcement say MAF unifies? | "The enterprise-ready foundations of Semantic Kernel with the innovative orchestration of AutoGen." |
| What are the three layers of AutoGen v0.4? | `autogen-core` (actor runtime), `autogen-agentchat` (high-level conversational API), `autogen-ext` (model clients, code executors, tools, integrations). |
| What's the common base class in MAF? | `AIAgent` in .NET, `BaseAgent` in Python. |
| What standard interface does MAF build directly on top of? | `Microsoft.Extensions.AI.IChatClient` (MEAI). |
| Name three MAF chat-client implementations. | Foundry, Azure OpenAI, OpenAI; also Anthropic, Bedrock, Ollama, GitHub Models / Copilot SDK, Claude Code SDK. |
| Name the four phases of the AutoGen → MAF evolution. | (1) Early AutoGen 2023; (2) AutoGen growth 2024; (3) Roadblocks + 0.4 rewrite Jan 2025; (4) Convergence into MAF Oct 2025 → GA Apr 2026. |

## Cards 11–20 — concepts & contracts

| Front | Back |
|---|---|
| What's a "conversable agent"? | An object with a name, instructions, optional tools, and a `reply` method that takes messages and returns messages — uniformly for LLMs, tool executors, and humans. |
| Why was conversation-as-substrate elegant? | Polymorphism: same abstraction for LLM, tool, and human participants; multi-agent prototypes in <100 lines. |
| Why does conversation-as-substrate strain in production? | No checkpoint per step; opaque speaker selection; no native middleware; HITL durability awkward; debug a 2,000-message thread is painful. |
| What is `RequestInfoExecutor`? | A typed pause node in MAF workflows that persists a checkpoint, emits a `RequestInfo` event, and resumes when the host fulfils with a `RespondInfo`. |
| What does middleware do in MAF? | Wraps every agent run and tool call with cross-cutting concerns: telemetry, redaction, auth, retries, cost guards. |
| What is `AgentThread`? | Per-conversation state in MAF — message history, tool results, metadata. Persisted via the workflow checkpointer when used inside a workflow. |
| What does the workflow checkpointer enable? | Resume after crash, time-travel debugging, durable HITL pauses. |
| Name three MAF workflow patterns. | Sequential, concurrent (fan-out/fan-in), handoff, group chat, Magentic. |
| What's a tool gateway? | An out-of-process service that mediates agent → tool calls; owns auth, audit, redaction, rate-limit. |
| What's the difference between agents-as-tools and handoffs? | Agents-as-tools: parent retains control, calls child like a function. Handoffs: control transfers entirely to the next agent. |

## Cards 21–30 — observability & eval

| Front | Back |
|---|---|
| What spans should every agent run emit? | `agent.run`, `llm.call`, `tool.call`, `executor`, `workflow.event`, `request_info`. |
| What attributes follow GenAI semantic conventions? | `gen_ai.system`, `gen_ai.request.model`, `gen_ai.usage.prompt_tokens`, `gen_ai.usage.completion_tokens`, `gen_ai.tool.name`, etc. |
| What's the minimum viable eval? | A 30-task golden set with programmatic pass/fail or LLM-judge rubric, run on every PR that touches the agent. |
| What three layers of evaluation should you use? | Component (unit tests on tools/prompts/retrievers); trajectory (did the plan look right? did expected tools get called?); end-to-end (golden-set scoring). |
| When can you trust LLM-as-judge? | After calibration against humans on the same set; with rotation across judge models; with periodic audit. |
| What does DevUI do? | A browser debugger that visualises the workflow graph, message flow, tool calls, and state at every step — backed by the same OTel feed. |
| Why is multi-agent observability hard? | High-cardinality distributed traces. Without OTel + GenAI semantic conventions, runs are hard to reconstruct. |
| What metrics do you put on the agent dashboard? | error rate, p95 latency, $-per-thread, HITL queue depth, agent-completion rate, eval pass rate, tool-error rate. |
| What's a smart sampling strategy for traces? | Always sample errors and HITL events (head + tail). Sample successful traces at low rate. Always sample evaluation runs. |
| How do you debug a non-deterministic agent run? | Record-replay tool calls; capture all tool inputs/outputs in the original run; replay deterministically. Or fix the model + temperature 0 (less robust). |

## Cards 31–40 — security & governance

| Front | Back |
|---|---|
| What's the most dangerous tool-calling failure mode? | Confused-deputy: tool runs with privileges the calling user doesn't have, often because credentials are global. |
| How do you defend against prompt injection? | Treat tool outputs as untrusted; strip / escape strings that look like instructions; consider dual-LLM (planner doesn't see raw tool output); guardrails to detect injection patterns. |
| Three concentric rings of agent safety? | Input (guardrails before LLM); execution (sandbox + gated tools + scoped auth); output (content filters + schema validation + HITL for high-risk). |
| What's the smallest agent governance posture? | Manifest per agent + registry + manual approval for new versions + golden-set eval + OTel telemetry. |
| What's the agent lifecycle state machine? | draft → in-review → approved → deployed → deprecated → retired. |
| What's an immutable audit log for? | Reconstruction of any run for disputes, regulators, or post-mortems. Append-only; hash-chained where compliance requires. |
| Why is `LocalCommandLineCodeExecutor` bad in production? | Arbitrary RCE on the host. Use Docker / ACI / ephemeral Jupyter with no host FS, locked egress, resource limits. |
| What's a "four-eyes" approval? | Two distinct humans must approve before a high-risk action (refund > threshold, schema change). Implemented as multi-step HITL. |
| What's a sane PII redaction approach? | Middleware before LLM calls and after tool returns; dictionary + regex for known classes; LLM-judge for free-form. Store hashes, not values. |
| Why is per-tenant data residency important? | Compliance; some jurisdictions require user data not leave region. Implementation: per-region storage + workflow workers; route by tenant claim. |

## Cards 41–50 — strategy & migration

| Front | Back |
|---|---|
| When pick AutoGen vs MAF? | AutoGen for research / multi-agent experimentation / code-execution-heavy demos. MAF for production agents, .NET parity, durable workflows, governance, multi-team. |
| Closest MAF peer outside Microsoft? | LangGraph. Both are typed graph engines with checkpointing, time-travel, HITL, multi-agent patterns. |
| Why "neither" can be the right answer? | Heavy regulation needs a thin platform layer; or you're a model lab; or multi-cloud mandate. Most teams that build their own re-derive MAF/LangGraph. |
| First phase of any AutoGen → MAF migration? | Inventory: every agent, tool, conversation pattern, state dependency, HITL touchpoint, eval, deployment target. |
| Most overlooked migration step? | Adding middleware *before* cutover — telemetry, redaction, auth, retries, cost guards. |
| Hardest part of cutover? | Behaviour drift on subtle prompt-rendering or tool-call parsing differences. Mitigate with dual-running and a wide golden set. |
| What does GA / LTS in MAF 1.0 cover? | Agents, workflows, memory, middleware, orchestration patterns, checkpointing, OTel, declarative agents. |
| Examples of MAF features still in preview after GA? | DevUI, Foundry-hosted agents, evaluations, AG-UI/CopilotKit/ChatKit adapters, Skills, Copilot/Claude Code SDK integration, Agent Harness. |
| Why did Microsoft pick a *new* name (MAF) instead of "SK 2.0" or "AutoGen 0.5"? | Clean contract surface; clean expectations; clear convergence narrative; stronger commitment signal (LTS GA). |
| One sentence summary of the AutoGen → MAF arc? | AutoGen taught the industry multi-agent conversation; MAF productionises that lineage with typed workflows, durability, HITL, and .NET + Python parity. |

## Anki import (paste into Anki text-import)

You can paste rows below into Anki (set field separator to `|`):

```text
When was AutoGen v0.4 stable released?|January 17, 2025.
When was Microsoft Agent Framework introduced (public preview)?|October 1, 2025.
When did MAF reach 1.0 GA?|April 3, 2026.
What standard interface does MAF build directly on top of?|`Microsoft.Extensions.AI.IChatClient` (MEAI).
What is `RequestInfoExecutor`?|A typed pause node in MAF workflows that persists a checkpoint, emits a `RequestInfo` event, and resumes when the host fulfils with a `RespondInfo`.
What does middleware do in MAF?|Wraps every agent run and tool call with cross-cutting concerns: telemetry, redaction, auth, retries, cost guards.
What does the workflow checkpointer enable?|Resume after crash, time-travel debugging, durable HITL pauses.
What's a tool gateway?|An out-of-process service that mediates agent → tool calls; owns auth, audit, redaction, rate-limit.
What's the difference between agents-as-tools and handoffs?|Agents-as-tools keep parent control; handoffs transfer control entirely.
What's the smallest agent governance posture?|Manifest per agent + registry + manual approval for new versions + golden-set eval + OTel.
First phase of any AutoGen → MAF migration?|Inventory: every agent, tool, conversation pattern, state dependency, HITL touchpoint, eval, deployment target.
Most overlooked migration step?|Adding middleware before cutover — telemetry, redaction, auth, retries, cost guards.
What does GA / LTS in MAF 1.0 cover?|Agents, workflows, memory, middleware, orchestration patterns, checkpointing, OTel, declarative agents.
One sentence summary of the AutoGen → MAF arc?|AutoGen taught the industry multi-agent conversation; MAF productionises that lineage with typed workflows, durability, HITL, and .NET + Python parity.
```

## Tips for fast retention

- **Speak the answer aloud.** Recall is much stronger when verbalised.
- **Re-derive, don't memorise.** For "why" cards, reason from first
  principles ("why is HITL durable?" → "because real human SLAs span
  hours / days, beyond process lifetimes").
- **Cluster cards thematically** for the first pass; then mix on later
  passes.
- **Add your own cards** as you find weak spots in mock interviews.
