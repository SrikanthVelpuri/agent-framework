---
title: Trade-offs
---

# Engineering trade-offs

> Pairs of forces that pull a framework in opposite directions. AutoGen
> chose one side because it was a research framework; MAF rebalances
> because it's a production framework. Each pair is shown with a short,
> interview-ready summary at the end.

## 1. Research velocity vs production control

**The forces.**

- *Research:* fastest path to a working prototype.
- *Production:* predictable, observable, governable execution.

**Why AutoGen's choice was reasonable.** Researchers needed a few hours
to prove a hypothesis, not a few weeks of plumbing.

**When it fails.** When the prototype gets shipped. The same code that
ran a 3-agent demo now powers a customer-facing flow that needs SLAs.

**How to design around it.** Keep two layers: a fast "playground" for
experimentation, and a "harden" path that adds typed contracts,
checkpoints, evals, and policy.

**Interview-ready answer.**

> "Research and production live on opposite sides of the abstraction
> spectrum. AutoGen optimised for the research side; MAF rebalances toward
> production with typed workflows, durable checkpointing, and native
> observability. The right pattern is to *prototype* in the research
> layer and *promote* to the production layer with clear contracts."

## 2. Conversation simplicity vs workflow determinism

**The forces.**

- *Conversation:* easy to write, easy to read, emergent collaboration.
- *Workflow:* explicit state machines, retries, checkpoints, attribution.

**Why AutoGen's choice was reasonable.** Conversation is the natural
*human* mental model for multi-agent.

**When it fails.** Long-running flows. Branching logic. Idempotent side
effects. Anything that needs to be *replayed* deterministically.

**How to design around it.** Use conversation patterns *inside* a graph
workflow. The graph guarantees structure; the conversation node carries
the open-ended part.

**Interview-ready answer.**

> "I'd default to typed graph workflows for the skeleton — sequential,
> handoff, conditional — and embed conversation patterns where genuinely
> open collaboration is needed. That gives me predictable replay, clean
> attribution, and a single place to enforce policy, while preserving the
> emergent behaviour where it adds value."

## 3. Flexibility vs standardization

**The forces.**

- *Flexibility:* tailor each agent freely; pick any model, any tool.
- *Standardization:* manifests, registries, schemas, lifecycle.

**Why AutoGen's choice was reasonable.** Standardisation is heavy upfront
cost; for a brand-new abstraction, you don't yet know *what* to
standardise.

**When it fails.** Multi-team adoption. Two teams ship "support agent v1"
that don't speak the same language; ownership is unclear.

**How to design around it.** Manifest-first agents (declarative YAML),
registry, ownership metadata, semantic versioning, deprecation policy.

**Interview-ready answer.**

> "Flexibility is essential for the agent's *content* — prompts, tools,
> memory — but the *contract* should be standard: name, version, owner,
> input schema, output schema, evaluation set, telemetry. MAF's
> declarative agents move in this direction; the next layer (registry,
> approvals) is where most enterprises still need to build."

## 4. Developer experience vs operational safety

**The forces.**

- *DX:* one-liner tool registration; auto code execution.
- *Ops safety:* permissions, sandboxes, audit, rate-limiting, redaction.

**Why AutoGen's choice was reasonable.** DX builds adoption. Adoption
buys you the right to add safety later.

**When it fails.** When the tool a researcher wrote runs with broad
credentials in production.

**How to design around it.** Keep the one-liner DX, but route every tool
call through a middleware pipeline that owns auth, redaction, and audit.
Make the pipeline opt-out, not opt-in.

**Interview-ready answer.**

> "Ergonomic primitives are necessary; *un*-policied primitives are not.
> MAF adds a middleware pipeline so every tool call passes through a
> consistent pipeline of telemetry, redaction, and authorisation —
> without changing the developer's one-liner."

## 5. Multi-agent collaboration vs debuggability

**The forces.**

- *Multi-agent:* more agents, more decomposition, more emergent power.
- *Debuggability:* fewer moving parts, clearer attribution, smaller blast
  radius.

**Why AutoGen's choice was reasonable.** The thesis was that multi-agent
collaboration unlocks problems single agents can't solve.

**When it fails.** A 5-agent failure with a 1,000-message trace. Hours
spent figuring out *which agent caused the regression*.

**How to design around it.** Tools (OTel + DevUI / LangSmith) that
visualise the workflow, attribute outcomes, and let you replay.
Architectural rule of thumb: **start with the smallest agent count that
solves the problem.**

**Interview-ready answer.**

> "More agents != better. I add an agent only when its responsibilities
> are clear and its outputs are typed. I instrument with OTel from day
> one and use a graph debugger so attribution is automatic. The
> 'simplest team that solves the task' is usually the right team."

## 6. Library vs platform

**The forces.**

- *Library:* a Python package teams import.
- *Platform:* a runtime that hosts agents with identity, scaling, policy,
  registry, and observability.

**Why AutoGen's choice was reasonable.** Libraries ship faster and embed
more easily.

**When it fails.** Multi-team enterprise adoption. Each team rebuilds
the same hosting stack.

**How to design around it.** Provide both: a clean library for embedding,
*and* a managed runtime (Foundry-hosted agents in MAF's case) for the
common path.

**Interview-ready answer.**

> "Library and platform aren't mutually exclusive — MAF ships both. The
> library is what individual teams import; the platform is what an
> internal AI org hosts so multiple teams share identity, telemetry, and
> policy. Whether to use the platform vs DIY hosting is an org-maturity
> question, not a framework question."

## 7. Provider lock-in vs provider parity

**The forces.**

- *Lock-in:* deep integration with one model provider's features.
- *Parity:* swap providers without rewriting agents.

**Why AutoGen's choice (initially OpenAI-centric) was reasonable.** OpenAI
was the only mature tool-calling provider in 2023.

**When it fails.** As Anthropic, Bedrock, Foundry, Ollama, Gemini all
mature with similar features, locking your agents to one model wastes
optionality.

**How to design around it.** A neutral abstraction (`IChatClient` in MAF,
similar in LangChain) plus per-provider feature gating.

**Interview-ready answer.**

> "Provider parity is a strategic asset. MAF builds on
> `Microsoft.Extensions.AI.IChatClient`, which lets you swap Foundry,
> Azure OpenAI, OpenAI, Anthropic, Bedrock, Ollama, and Copilot/Claude
> Code SDK by configuration. That's not just convenience — it's leverage
> for negotiation and resilience for outages."

## 8. Managed runtime vs self-hosting

**The forces.**

- *Managed:* fast time-to-first-deploy, less ops burden, vendor lock-in.
- *Self-hosted:* full control, no vendor lock-in, more ops burden.

**Why AutoGen had no managed option.** It was a research framework.

**How to design around it.** Provide a clean `Dockerfile` *and* a managed
runtime, and document feature parity.

**Interview-ready answer.**

> "Managed and self-hosted are the same architecture with different
> operators. I expect a serious enterprise framework to support both,
> with a clear contract for what runs the same locally and in the
> managed runtime."

## 9. Synchronous DX vs async runtime

**The forces.**

- *Sync DX:* `agent.run("hello")` returning a string.
- *Async runtime:* streaming tokens, parallel tool calls, distributed
  workflows.

**Why AutoGen 0.2's sync DX was reasonable.** Tutorials are easier.

**When it fails.** Streaming, parallel tools, multi-agent fan-out, and
long-running flows all want async.

**How to design around it.** Make the runtime async; expose sync
convenience wrappers for tutorials.

**Interview-ready answer.**

> "Async is the right default for agent runtimes — streaming, parallel
> tools, and fan-out are all easier. AutoGen 0.4's actor runtime, MAF's
> workflow engine, and OpenAI Agents SDK's runner are all async; they
> ship sync ergonomics on top."

## 10. Open-source neutrality vs ecosystem alignment

**The forces.**

- *Neutrality:* no vendor in the abstraction; runs anywhere.
- *Alignment:* deep integration with a vendor stack (Foundry, Azure,
  Vertex, AWS).

**Why AutoGen's neutrality was reasonable.** A research framework
attracts more contributors when it isn't tied to one cloud.

**When it fails.** Enterprise customers want first-class integration with
their cloud's identity, hosting, evaluations, and tooling.

**How to design around it.** Layered: a neutral core (provider-agnostic
LLM abstraction, OTel) + cloud-specific extensions (Foundry-hosted
agents, Bedrock client, Vertex eval).

**Interview-ready answer.**

> "The pattern that works is a neutral *core* — `IChatClient`, OTel,
> typed workflows — and *extensions* per cloud. MAF's Foundry
> integration is opt-in; the same agent runs against OpenAI, Anthropic,
> Bedrock, or Ollama by configuration. You get the cloud benefits
> without the lock-in tax."

## A condensed cheat sheet

| Trade-off | AutoGen choice | MAF choice |
|---|---|---|
| Velocity vs control | Velocity | Control with velocity layer |
| Conversation vs workflow | Conversation | Workflow + conversation as a node |
| Flexibility vs standardization | Flexibility | Standardisation in *contract*, flexibility in *content* |
| DX vs ops safety | DX | DX + middleware enforcement |
| Multi-agent vs debuggability | Multi-agent | Debuggability via DevUI + OTel |
| Library vs platform | Library | Library + Foundry-hosted platform |
| Lock-in vs parity | Provider-flexible (per-client) | Parity via `IChatClient` |
| Managed vs self-hosted | Self-hosted only | Both |
| Sync DX vs async runtime | Sync (0.2), async (0.4) | Async-first with sync wrappers |
| Neutrality vs alignment | Neutral | Neutral core + Foundry extensions |
