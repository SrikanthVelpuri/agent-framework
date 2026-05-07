---
title: Mistakes and lessons learned
---

# "Mistakes" and lessons learned

> The word *mistake* is misleading. The right word is *engineering trade-off
> made explicit by hindsight*. This page summarises the structural lessons —
> the things every agent-platform builder should internalise — by mapping
> AutoGen's specific decisions to broader principles.

## The summary table

| Area | AutoGen decision | Why it helped early | How it became a roadblock | Lesson learned | Better enterprise pattern |
|---|---|---|---|---|---|
| API design | Research-first, conversation-centric | Easy to prototype multi-agent | Production needs typed, durable, governable steps | Optimise for *time-to-first-experiment* in research; for *contract clarity* in production | Typed graph workflows + agent abstractions |
| Abstraction | Conversation as substrate | One simple model | Long-running flows hard to express | Conversation is *one* pattern, not the substrate | Graph engine where conversation is a node type |
| Behavior | Flexible, free-form agents | Maximum experimentation | Hard to govern in shared platforms | Flexibility needs boundaries when scale + multi-team | Typed inputs/outputs, explicit handoffs |
| Orchestration | LLM-picked speakers (`SelectorGroupChat`) | Open-ended emergent collaboration | Non-determinism, hidden prompt dependency | Make non-determinism opt-in, not default | Typed handoff edges, conditions |
| Code execution | Built into `UserProxyAgent` | Powerful demos | Conflates HITL and code-exec; sandboxing is dev's job | Powerful primitives need policy boundaries | Sandboxed code-exec tool with audit; HITL as separate primitive |
| Tool calling | Python functions registered on agents | Trivial DX | No middleware, no policy, no audit | Tool execution is a security surface | Middleware pipeline + tool gateway |
| HITL | `UserProxyAgent` w/ `human_input_mode` | Single primitive for all "non-LLM" participants | No durable approval queue, no SLA, no escalation | HITL is its own typed primitive | Typed `RequestInfoExecutor`-style step + UI adapter |
| Configuration | `llm_config` dict | Easy to copy from examples | Provider-specific, no shared abstraction | Provider-agnosticism pays off as the LLM market fragments | Shared `IChatClient`-style abstraction |
| Observability | Python `logging` (0.2); OTel (0.4) | Standard Python ergonomics | Multi-agent = distributed; needs OTel from day one | Telemetry is a feature, not an addon | OTel-native with GenAI semantic conventions |
| Evaluation | AutoGen Bench | Programmatic scoring on benchmarks | Workflow-level evals (regression, golden-set, LLM-judge) require more | Eval is part of CI, not an afterthought | Workflow-level evaluators + golden sets in CI |
| Safety | Up to the developer | Researcher autonomy | No central policy point | Policy needs an enforcement boundary | Middleware + tool gateway + content filters |
| Governance | None | Library, not platform | Multi-team adoption needs registry, ownership, lifecycle | Governance is a separate layer that wraps the framework | Manifest + registry + approval pipeline |
| Deployment | DIY (FastAPI / containers) | Maximum flexibility | Inconsistent reliability across teams | Managed runtime is a real differentiator | Hosted runtime with autoscale, identity, policy |
| Registry / lifecycle | None | Out of scope for a library | Multi-team / multi-version chaos at scale | Lifecycle is critical for shared platforms | Versioned manifests, deprecation, ownership |
| Enterprise integration | Python primary | Fits ML stacks | Excludes .NET / Java enterprises | Cross-language parity is a real ask | Same abstractions in .NET (and ideally Java) |

## Lesson 1 — Flexibility is great for research, dangerous for platforms

**The setup.** AutoGen lets you write agents however you want and
connect them with conversation. That's a *research superpower*.

**The friction.** Enterprise platforms need stronger contracts, predictable
execution, policy enforcement, and monitoring. Free-form agents can pass an
unknown number of fields through an unknown number of speaker selections,
and that opacity becomes the platform team's nightmare.

**The lesson.** Flexibility isn't bad; flexibility *without boundaries* is.
Production frameworks should provide explicit contracts (typed
inputs/outputs, schemas, manifests) *and* keep flexibility for the slots
that genuinely need it (an agent's prompt, a tool's body).

## Lesson 2 — Conversation is a pattern, not a substrate

**The setup.** "Just message agents to each other" is an incredibly
seductive abstraction. It works for a planner + worker, a debate, a
researcher + writer + critic.

**The friction.** Most production workflows aren't conversational — they
have validation steps, approvals, idempotent calls, conditional branches,
parallel fan-out, fan-in. Conversation as substrate forces you to inflate
deterministic logic into chat-shaped messages.

**The lesson.** Make conversation *a* node type in a graph. Use a graph
engine for the substrate.

## Lesson 3 — Non-determinism should be opt-in

**The setup.** Letting an LLM pick the next speaker (`SelectorGroupChat`) is
elegant — minimal code, maximum flexibility.

**The friction.** Hidden non-determinism is the #1 production-debugging
pain. Why did agent X get picked? Did the selector prompt change? Is the
selector model stable across versions?

**The lesson.** Default to *deterministic* control flow (typed handoffs,
conditional edges) and make non-determinism opt-in for genuinely
open-ended cases.

## Lesson 4 — Powerful primitives need policy boundaries

**The setup.** Code execution and tool calling are powerful — that's why
they unlock real agentic behaviour.

**The friction.** Powerful primitives = security surface. Without policy
hooks, every team has to write their own auth, audit, redaction, and
rate-limiting.

**The lesson.** Add *one* enforcement boundary the framework owns:
middleware (in-process, around every call) or a gateway (out-of-process,
between agents and tools). Don't let teams reinvent it.

## Lesson 5 — HITL is not just `input()`

**The setup.** `UserProxyAgent` with `human_input_mode="ALWAYS"` is a clever
prototype.

**The friction.** Real HITL needs durable approval inboxes, SLA timeouts,
escalation, audit logs, and the ability for the workflow to be torn down
and rehydrated. None of that fits behind `input()`.

**The lesson.** Treat HITL as a typed durable step (a "wait for typed input
of type X") with first-class events.

## Lesson 6 — Telemetry is a feature

**The setup.** Logging was Python `logging`. Many teams discovered they
couldn't reconstruct what an agent did, especially in multi-agent flows.

**The friction.** Multi-agent flows are distributed traces. Without OTel,
they don't show up in the company's existing observability tools.

**The lesson.** Telemetry should be the *first* thing the framework does
on every span — not an addon enabled later.

## Lesson 7 — Cross-language parity is a real differentiator

**The setup.** Python is the ML lingua franca. .NET / Java enterprises
were initially happy to call a Python service.

**The friction.** As agents become first-class application primitives,
calling out to a Python sidecar feels wrong. Enterprises want agents in
their existing app stack.

**The lesson.** Build the framework on a cross-language abstraction
(`IChatClient` in MAF, or an interop layer otherwise) and ship parity
from day one.

## Lesson 8 — A research framework's success creates the production
framework

**The setup.** AutoGen "won" multi-agent prototyping. That very success
brought enterprise users with production demands the framework wasn't
designed for.

**The friction.** Tension between researcher needs (velocity, flexibility)
and engineer needs (contracts, governance, durability) inside one library
makes both groups unhappy.

**The lesson.** Once a research framework's user base flips engineer-heavy,
fork the production lineage early. Microsoft did this gracefully — AutoGen
continues, MAF is the production successor, and the migration path is
official.

## Lesson 9 — Standardise the boring stuff

The areas teams underestimate (in order of how-painful-when-missing):

1. Telemetry
2. HITL durability
3. Policy hooks
4. Versioning / registry
5. Cross-language parity
6. Managed runtime
7. Evaluation in CI

**(inference)** Watching the Microsoft Foundry roadmap, you can see the
engineering org has reordered "boring stuff" as the headline value of MAF.

## Lesson 10 — Do not throw away the research lineage

The temptation when building a "production framework" is to deprecate
everything before it. Microsoft kept AutoGen alive as the research lineage,
which is the right move:

- Researchers keep iterating without enterprise constraints.
- Production users have a clear, official path to MAF.
- The vocabulary stays consistent.

## How to talk about these lessons in an interview

If asked *"what mistakes did AutoGen make?"*, do **not** say "Microsoft made
mistakes." Say something like:

> "AutoGen optimised for research velocity, which was the right priority
> for that phase. The trade-off was that production-grade primitives —
> typed workflows, durable checkpoints, native middleware, HITL durability,
> cross-language parity — weren't first-class. A pattern most successful
> research frameworks share is that their breakout *forces* the team to
> build the next one. MAF is that next-one: the AutoGen + Semantic Kernel
> teams converged to ship a production lineage."

That framing is fair, source-grounded, and impressive in an interview
because it shows you understand the lifecycle of frameworks, not just
features.
