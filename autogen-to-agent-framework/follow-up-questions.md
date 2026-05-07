---
title: Follow-up question chains
---

# Follow-up question chains

> Each chain starts with a base question and goes 4–6 levels deep, the way
> a senior interviewer actually drills. Use these to practice "how do I
> talk for 10 minutes about this without losing depth?"
>
> Format:
> - **Q:** the question
> - **A:** model answer (3–6 sentences)
> - **F:** follow-up
> - **A:** answer
> - … and so on.

## Chain 1 — AutoGen design

**Q.** Why was AutoGen designed around conversation?

**A.** Conversation maps cleanly onto how humans collaborate, and it's a
unifying abstraction for LLMs, tool executors, and humans. The AutoGen
paper (arXiv:2308.08155) argued that conversation programming is a
natural model for multi-agent LLM applications.

**F.** Why does that abstraction become a roadblock in production?

**A.** Production workflows have steps that aren't conversational —
typed validation, idempotent API calls, multi-day approvals, conditional
branches. Forcing those into a chat loop loses determinism, replayability,
and clean attribution.

**F.** How would you improve it?

**A.** Move to a typed graph workflow as the substrate; keep conversation
as one kind of node. Each step has typed inputs/outputs and a checkpoint;
conversation handles only the genuinely open-ended parts.

**F.** What trade-off does that create?

**A.** You give up some "let agents talk and see what emerges" magic.
You buy predictability, debuggability, and easier governance. For
production, that's the right exchange.

**F.** How does this relate to MAF?

**A.** MAF's `Workflow` is exactly that substrate; conversation is
expressed as a *group-chat* workflow pattern. The migration guide on
Microsoft Learn explicitly notes that multi-agent migration "requires
rethinking your approach from event-driven to data-flow based architectures."

## Chain 2 — Group chat

**Q.** Why can `SelectorGroupChat` be problematic in production?

**A.** Speaker selection is delegated to an LLM. That introduces hidden
non-determinism: the same input can route to different agents on
different runs, or after a model upgrade.

**F.** Why is non-determinism bad?

**A.** It makes regressions hard to attribute, evals harder to interpret,
and incidents harder to reproduce. It's not bad in itself; it's bad
*by default*.

**F.** When *is* it okay?

**A.** When the task is genuinely open-ended (brainstorming, multi-domain
support triage with no clear taxonomy) and the value of emergent
behaviour exceeds the cost of reduced determinism. Even then, log the
selector prompt and rationale.

**F.** How would you stabilise it?

**A.** Deterministic handoff edges by default, with conditional edges
for typed branches. Reserve LLM-driven selection for explicit
"open-ended" nodes. Pin the selector model + prompt + version.

## Chain 3 — Tool execution

**Q.** What's the most dangerous failure mode of tool calling?

**A.** Confused-deputy: the agent runs a tool with privileges the
calling user doesn't have, often because tool credentials are global
rather than user-scoped.

**F.** How do you fix it?

**A.** Tool calls inherit a user-scoped JWT; the gateway / middleware
checks the scope before invocation; the tool refuses calls without
proper claims.

**F.** What about prompt injection through tool output?

**A.** Treat tool output as untrusted. Strip / escape strings that look
like instructions. Optionally use dual-LLM (planner doesn't see raw
output; only a sanitised summary).

**F.** How do you scale this across many tools?

**A.** A tool gateway service: every tool sits behind it; gateway
enforces auth, rate limits, redaction, and audit; agents always go
through it. One enforcement point, not one per agent.

**F.** Trade-off?

**A.** Adds latency (5–20ms) and an operational dependency. Worth it.

## Chain 4 — Code execution

**Q.** Why is code execution both powerful and dangerous?

**A.** Code is the most general action — it can do anything. That makes
it the broadest attack surface (arbitrary RCE if not sandboxed) and the
biggest reliability risk.

**F.** What sandbox do you use?

**A.** Docker with no host filesystem mount, locked-down egress; or
Azure Container Instances; or `JupyterCodeExecutor` for ephemeral
kernels. Never `LocalCommandLineCodeExecutor` in production.

**F.** How do you set resource limits?

**A.** CPU + memory + wall-clock per execution; output size cap; max
egress bandwidth. Each enforced at the container level.

**F.** How do you handle secrets?

**A.** No secrets in the code-exec environment. Tool calls are the
boundary; the code-exec sandbox cannot reach internal services.

## Chain 5 — Human-in-the-loop

**Q.** What's wrong with `UserProxyAgent` for production HITL?

**A.** It conflates "human" and "code executor" into one role, and ties
HITL to a synchronous chat loop. Production HITL is asynchronous,
durable, SLA-bound, and auditable — none of which fit `input()`.

**F.** How would you redesign HITL?

**A.** A typed `RequestInfoExecutor`-style step. The workflow pauses,
persists a checkpoint, emits a typed `RequestInfo` event the host can
fulfil with a `RespondInfo`. The workflow resumes from the checkpoint.

**F.** What about SLA breaches?

**A.** A separate timer escalates after the SLA. Multiple escalation
levels (manager → director → CFO) with explicit owners.

**F.** Audit?

**A.** Every RequestInfo + RespondInfo + decision is appended to an
immutable log with actor, timestamp, payload hash. Required for any
regulated workflow.

## Chain 6 — Agent state

**Q.** Where should agent state live?

**A.** Per-thread state in an `AgentThread` (or equivalent), persisted
via a workflow checkpointer for durability; long-term knowledge in
an `IMemory` provider or vector store.

**F.** How do you scope memory?

**A.** Working context (current prompt), thread (conversation),
episodic (per-user across threads), semantic (KB), procedural
(cached plans / skills). Don't conflate.

**F.** How do you keep memory from blowing up the context window?

**A.** Recall on demand: the agent calls a memory tool; only relevant
slices come back. Summarise stale messages.

**F.** Privacy?

**A.** Per-user encryption keys; right-to-be-forgotten erases episodic
+ semantic stores; thread state has retention limits.

## Chain 7 — Observability

**Q.** What does "OTel-native" actually buy you?

**A.** Standardised spans + attributes that integrate with the
company's existing tracing stack (App Insights, Jaeger, Honeycomb,
Phoenix, Datadog). No bespoke logging format.

**F.** What's the GenAI semantic-conventions schema?

**A.** A set of attribute names for AI/LLM workloads: `gen_ai.system`,
`gen_ai.request.model`, `gen_ai.usage.prompt_tokens`,
`gen_ai.usage.completion_tokens`, `gen_ai.tool.name`, etc. Lets dashboards
work cross-framework.

**F.** What span hierarchy?

**A.** `agent.run` (parent) → `llm.call` and `tool.call` siblings;
`workflow.event` and `executor` for graph-level; `request_info` for
HITL pauses. Each carries thread_id + run_id + parent_run_id.

**F.** Sampling strategy?

**A.** Always sample errors and HITL events (head + tail). Sample
successful traces at low rate. Always sample evaluation runs.

## Chain 8 — Evaluation

**Q.** Why do most teams under-invest in eval?

**A.** Because the value is invisible until the first regression. Evals
look like overhead until something breaks; then they're the difference
between "we caught it in CI" and "users found it."

**F.** What's the minimum viable eval?

**A.** A 30-task golden set with programmatic pass/fail or LLM-judge
rubric, run on every PR that touches the agent.

**F.** When do you trust LLM-as-judge?

**A.** After calibration against humans on the same set; with rotation
across judge models; with periodic audit. Not blindly.

**F.** What about online evals?

**A.** Sample N% of production traces; LLM-judge them; alert on drift.
Pair with cost / latency monitors.

## Chain 9 — Safety

**Q.** What are the three concentric rings of agent safety?

**A.** Input (guardrails before the LLM); execution (sandboxed code,
gated tools, auth scopes); output (content filters, schema validation,
HITL for high-risk actions).

**F.** Where do guardrails live?

**A.** Middleware that runs in parallel with the agent; tripwire halts
execution. Input guardrails on user input; output guardrails on agent
output; tool guardrails around tool calls.

**F.** Who owns the policy?

**A.** Two layers: framework-level defaults (telemetry, redaction);
platform-level rules (per-tenant data class, per-tool allow-list).
Both versioned and reviewable.

**F.** How do you test policies?

**A.** Adversarial test set: known prompt-injection strings, jailbreak
attempts, sensitive-data exfiltration patterns. Run on every PR.

## Chain 10 — Governance

**Q.** What's the smallest agent governance posture worth shipping?

**A.** A YAML manifest per agent + a registry + manual approval for
new versions + golden-set eval + OTel telemetry. ~1 week to build.

**F.** When do you add more?

**A.** Multi-team adoption; regulated workloads; HITL flows; audit
requirements.

**F.** What's "more"?

**A.** Tool gateway with audit; immutable logs; lifecycle workflows
(draft → review → approve → deploy → deprecate); cost / latency
budgets; canary deployments; per-tenant data residency; FIPS-style
key handling.

**F.** What do enterprises usually skip and regret?

**A.** Audit log immutability; eval gating in CI; SLA-bound HITL.
Each gets noticed at the worst possible time (regulator query, model
upgrade, weekend escalation).

## Chain 11 — Enterprise deployment

**Q.** What's the hardest part of running an enterprise agent platform?

**A.** Not the runtime — that's MAF or LangGraph or your choice. The
hardest parts are: registry / lifecycle, tool gateway, evaluation
discipline, and incident response.

**F.** Why incident response?

**A.** Multi-agent traces are noisy; cost spikes can blindside; HITL
SLA breaches require human follow-up; prompt-injection incidents
need a forensic story. Without runbooks and graph-aware debugging,
MTTR is hours, not minutes.

**F.** What's a good runbook structure?

**A.** Symptom → first dashboards to check → likely causes → mitigation
steps → post-mortem template → "what to add to the eval set after this
incident."

**F.** Cost runaway specifically?

**A.** Per-thread + per-agent budgets; auto-throttle when 80% of budget;
abort + audit when exceeded. Daily budget dashboards. Cost per agent
per release tracked over time.

## Chain 12 — Agent registry

**Q.** Why does a registry matter at multi-team scale?

**A.** Because two teams will independently ship "support agent v1"
that don't speak the same language; ownership becomes folklore;
deprecation is impossible.

**F.** What's in a manifest?

**A.** Name, version, owner, instructions, model, tools, memory,
evals, telemetry tags, status, deprecation pointer.

**F.** Versioning scheme?

**A.** Semantic versioning. Threads pin the version they started
with; backward-incompatible changes require a major bump and a
migration plan.

**F.** How do you measure registry health?

**A.** Coverage (% of production agents with manifests), staleness
(% with recent eval), ownership clarity (% with named owner +
on-call), deprecation-debt (count of deprecated agents still receiving
traffic).

## Chain 13 — Runtime design

**Q.** Why pick a typed graph runtime over an actor runtime for agents?

**A.** Both are fine for the runtime layer; they differ at the contract
layer. A typed graph gives you typed edges (compile-time check), explicit
flow, and natural mapping to a workflow editor. Actors are more flexible
(any-to-any messaging) but harder to govern.

**F.** Why does AutoGen 0.4 use actors then?

**A.** Because Core is the *runtime*, not the *contract*. AgentChat is
the contract on top, and it leans toward conversation. MAF chose to
make the contract layer typed-graph from the start.

**F.** Could MAF use actors under the hood?

**A.** It already could; the runtime can route typed messages between
executors. The user-facing contract is the workflow graph.

## Chain 14 — Agent Framework evolution

**Q.** What was the timeline from AutoGen v0.4 to MAF GA?

**A.** AutoGen v0.4 stable on Jan 17 2025. Internal convergence between
AutoGen + Semantic Kernel teams through 2025. MAF public preview Oct 1
2025. MAF GA 1.0 (LTS) on Apr 3 2026.

**F.** Why ~15 months?

**A.** Building cross-language parity (Python + .NET) and a typed
workflow engine with checkpointing, time-travel, and HITL primitives
is non-trivial. So is convergence with SK. The April 2026 GA includes
LTS commitments — those don't ship without internal review.

**F.** What's still preview after GA?

**A.** DevUI, Foundry-hosted agents, Foundry-backed memory and tools,
evaluations, AG-UI / CopilotKit / ChatKit adapters, Skills, Copilot /
Claude Code SDK integration, Agent Harness.

**F.** Why ship those in preview?

**A.** They are evolving faster than the LTS surface; users get them
without locking the team into LTS commitments before the design has
stabilised.

## Chain 15 — Migration strategy

**Q.** How long should an AutoGen → MAF migration take?

**A.** ~6 weeks for ~20 agents, assuming a clean inventory and
existing OTel. Roughly 1 day per agent for rewrite + tests; the rest is
contracts, middleware, evals, dual-running, and cutover.

**F.** What's the riskiest step?

**A.** Cutover. Subtle behaviour drift (different prompt rendering,
different tool-call parsing) appears here. Mitigate with dual-running
and a tight golden set.

**F.** Rollback?

**A.** Preserve the AutoGen runtime + thread state for 30 days post
cutover behind a feature flag.

**F.** Will users notice?

**A.** Ideally no. If yes, treat it as a regression and roll back; do
not "fix forward" on a regulated flow.
