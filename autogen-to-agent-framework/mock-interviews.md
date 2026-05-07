---
title: Mock interviews
---

# Mock interviews

> Three full transcripts you can role-play. Each shows the interviewer's
> *intent* in italics, the candidate's "weak" answer (so you can recognise
> traps), and the "strong" answer.
>
> Run each as a 30-min session with a friend. Record yourself. Replay the
> awkward moments. Improve.

## Mock 1 — Senior AI platform engineer

**Setup.** 30-min interview. The interviewer is a tech lead on an
internal agent platform team. Topic: AutoGen / MAF / agent runtimes.

---

**Interviewer:** *Probing depth on the AutoGen story.*  
"Walk me through how Microsoft AutoGen evolved into Microsoft Agent
Framework. What problem each phase solved, what got harder, and why the
re-architecture made sense."

**Weak answer.** "AutoGen was a research project, then they made MAF
because AutoGen wasn't enterprise-ready."

**Strong answer.**
"AutoGen started in fall 2023 as a Microsoft Research project; the paper
introduced *conversable agents* and *conversation programming*. That
abstraction — agents that talk to each other and to humans uniformly —
made multi-agent prototypes possible in a hundred lines of Python.

Through 2024, the v0.2 line saw broad adoption. Two pressures emerged.
First, enterprise users were running it in production and discovering
that conversation-as-orchestration is fragile when you need durable
state, native middleware, multi-day HITL, and fine-grained observability.
Second, multi-agent traces were inherently distributed and AutoGen's
runtime was synchronous and Python-process-bound.

In January 2025, AutoGen 0.4 stable shipped a complete rewrite — three
layers: an event-driven actor `Core`, the `AgentChat` high-level API, and
`Extensions`. OpenTelemetry was added; distributed runtime over gRPC;
cleaner extension points. That fixed the runtime story but kept
conversation as the substrate.

By October 2025, Microsoft converged the AutoGen and Semantic Kernel
teams around a unified successor: Microsoft Agent Framework, in public
preview. The official one-liner was that MAF unifies *the
enterprise-ready foundations of Semantic Kernel with the innovative
orchestration of AutoGen*. The substrate switched from conversation to
*typed graph workflow*; conversation became a node type. Native
middleware, durable checkpoints with time-travel, first-class HITL via
`RequestInfoExecutor`, declarative YAML agents, OpenTelemetry-native +
DevUI, and .NET + Python parity from day one.

MAF reached 1.0 GA on April 3 2026 with an LTS commitment for the core
building blocks: agents, workflows, memory, middleware, and orchestration.

The arc tells me a useful general rule: a successful research framework's
breakout *forces* its parent to ship the production successor. AutoGen
didn't fail; it succeeded enough to require the next thing."

**Interviewer:** *Pushback to test that the candidate doesn't oversell MAF.*  
"That sounds like a marketing pitch. Where does AutoGen still win?"

**Weak answer.** "Nowhere, MAF is better."

**Strong answer.**
"Three places. One: research on novel orchestration patterns —
Magentic-One, Swarm, custom group-chat selection — where AutoGen's
ergonomics still produce the cleanest paper-to-code mapping. Two:
code-execution-heavy demos where `UserProxyAgent` + `CodeExecutor` is
the most direct expression of the pattern. Three: small Python-only
prototypes that won't graduate to production; the migration cost
isn't justified.

Microsoft's own positioning is consistent: AutoGen continues as a
research lineage; production users are guided to MAF via the
[official migration guide](https://learn.microsoft.com/en-us/agent-framework/migration-guide/from-autogen/).
That's the right honest answer."

**Interviewer:** *Tests system-design depth.*  
"Imagine I'm a CTO. We have 20 AutoGen agents in production. Should
we migrate to MAF? How would you scope it?"

**Strong answer.**
"It depends on your pain. Migrate if any of these are true: you're
hitting durability or HITL limits, you need .NET parity, you want a
managed runtime, you're scaling beyond a single team and need
governance, or you want LTS API stability. Skip it if you're
research-y, Python-only, short-lived, and have no governance pain.

If you're going: budget ~6 weeks for ~20 agents. Phases: inventory →
contracts → workflow rewrite → middleware → HITL primitives → evals →
OTel + DevUI → dual-run → cutover behind a feature flag → decommission.
Riskiest step is cutover; mitigate with a wide golden set and dual
running for 1–2 weeks. Keep a rollback path for 30 days post.

I'd add: don't only do axis-1 (the API rewrite). The wins are mostly
on axis-2 (typed workflows, middleware, HITL durability, OTel). If
you stop after axis-1, you've spent the migration cost without
getting the migration value."

**Interviewer:** *Tests trade-off thinking.*  
"What's the single biggest trade-off in moving to MAF?"

**Strong answer.**
"Slightly higher up-front conceptual load. AutoGen's conversation feels
intuitive on day one; MAF's typed workflow + middleware + HITL primitives
take a few hours to learn. The TCO over the project lifetime is lower
because production-grade primitives come built-in — but the ergonomics
of the first day are noticeably tighter. Worth it; honest to name."

---

## Mock 2 — Staff engineer / architect

**Setup.** 45-min architecture interview. Topic: design an enterprise
agent platform.

---

**Interviewer:**
"Design an enterprise agent platform that hosts ~100 agents across 8
teams. Walk me through requirements, architecture, and the three biggest
design decisions."

**Strong outline (the candidate should drive the whiteboard).**

1. **Clarify scope (2 min).**
   - 100 agents, 8 teams, mixed Python + .NET callers; multi-region;
     SOC 2; HITL needed for ~30% of flows; 24/7; p95 < 3s for short
     agents; HITL flows can run for days.
2. **Reference architecture (10 min).** Manifest registry; runtime
   (MAF + LangGraph; pluggable); tool gateway; policy engine; eval
   harness; OTel pipeline; immutable audit; identity (Entra/AAD).
3. **Three biggest design decisions (10 min).**
   - **Manifest-first agents.** Every agent is a YAML manifest in a
     git repo; CI runs eval; reviewer approves; registry tracks
     status. *Trade-off:* slower shipping vs. fewer regressions.
   - **Tool gateway.** All tool calls go through an out-of-process
     gateway that owns auth, audit, redaction, rate-limit. *Trade-off:*
     +5–20ms latency vs. one place to enforce policy.
   - **Two runtimes (MAF + LangGraph) behind one contract.** Some
     teams prefer Python-only LangGraph + LangSmith; others want
     .NET MAF. We standardise the *contract* (manifest schema +
     OTel + audit) and let the runtime be a choice. *Trade-off:*
     more ops surface vs. team optionality.
4. **Failure modes (5 min).** LLM provider 5xx → failover; tool 5xx →
   idempotency-keyed retry + circuit break; HITL SLA breach → escalate
   then auto-cancel; cost cap exceeded → abort + audit.
5. **Observability (5 min).** OTel-native; dashboards: error rate, p95,
   $-per-thread, HITL queue, eval pass rate. Alerts on golden-set
   regression, HITL SLA breach, cost spike.
6. **Wrap (3 min).** What I'd build first: registry + minimal runtime +
   gateway + OTel + golden-set CI. That's the smallest "level 3"
   maturity ladder rung; everything else (canary, deprecation, multi-
   tenant residency) follows.

**Interviewer:** *Curveball.*  
"You said 'two runtimes.' Most companies pick one. Defend the choice."

**Strong answer.**
"It's defensible only if the team optionality wins outweigh the ops
cost. The wins: faster team onboarding, no cross-language friction,
each team picks the better fit for its workload. The costs: two runbook
sets, two upgrade cadences, two debugging playbooks. I'd revisit
quarterly; if 90%+ of agents end up on one runtime, consolidate.

The contract layer (manifests, OTel, audit, gateway) is the same
regardless. So the *platform* is one platform; the *runtime* is a
preference."

**Interviewer:**
"How would you handle a multi-day HITL approval that goes stale because
the requester's role changes mid-flow?"

**Strong answer.**
"Policy engine evaluates the responder's claims at *RespondInfo* time,
not at *RequestInfo* time. If the role no longer carries the approval
scope, reject with an explicit reason; the workflow either escalates
to a current-scoped approver or cancels with audit. Avoid bind-time
authorisation for long pauses; check at action time."

---

## Mock 3 — "Tell me about a time" (behavioural)

**Setup.** 20-min behavioural focused on AI / platform projects.

---

**Interviewer:** "Tell me about a time you migrated a system from one
agent framework to another."

**Weak answer.** "We migrated from AutoGen to MAF. It went well."

**Strong answer (STAR + numbers).**
"**Situation.** Late 2025, my team owned 18 AutoGen 0.4 agents in
production. We were paged 3-4 times per week on multi-agent timeouts
we couldn't reproduce, and our HITL approvals on refunds occasionally
got lost when containers restarted because state was in-memory.

**Task.** Decide whether to migrate to MAF preview or harden AutoGen
in place. Define the path forward and execute it without dropping
production reliability.

**Action.** I wrote a 2-page architecture memo. It compared AutoGen's
conversation-based orchestration with MAF's typed workflow + durable
checkpointing + `RequestInfoExecutor` HITL. We picked MAF on the
strength of HITL durability and OTel native. The migration plan was
six weeks: inventory, contracts (YAML manifests), workflow rewrite,
middleware (telemetry / redaction / auth), HITL replacement, evals,
dual-run, cutover behind a feature flag.

I led the inventory and contract phase, designed the tool gateway with
audit, and ran the dual-run period. Two unexpected drift items:
prompt rendering of system messages varied subtly, and one tool's
schema parsed nullable fields differently. We caught both with the
golden set during dual-run.

**Result.** Cutover landed on schedule. HITL-loss incidents dropped
to zero in the first month (from 1-2 per week). On-call paged 60%
less. p95 latency stayed flat. We shipped DevUI + dashboards as part
of the migration and onboarded a sister team to the platform two
months later because the contracts were re-usable.

**Reflection.** The biggest lesson was 'don't only do the API
rewrite.' The wins are on axis-2 — durability, middleware, OTel,
HITL primitives. If we'd only ported the API, we'd have spent the
cost without getting the value."

**Interviewer:**
"What would you do differently?"

**Strong answer.**
"Two things. One: I'd start the eval-set work before the rewrite, not
in parallel. We discovered missing eval cases during dual-run; if we
had a richer set on day one we'd have caught the prompt-rendering
drift earlier. Two: I'd have invested earlier in the tool gateway. I
wrapped redaction in middleware first; we later realised the gateway
gave the security team more confidence and an obvious place to point
auditors to."

---

## How to grade yourself

After each mock:

- Did you anchor every claim in a fact, source, or war story?
- Did you embrace pushback, or double down?
- Did you hit three altitudes (30s, 2m, 10m) where the question
  invited it?
- Did you leave the interviewer with one memorable line?
- Did you talk for >70% of the time? (You shouldn't.)

If you can answer "yes" to all five for a mock, you're ready.

## A short library of memorable lines

Drop these naturally; never force them.

- *"AutoGen helped developers explore what agents could do; MAF helps
  developers build, operate, and govern agents systematically."*
- *"The contract is a graph, not a conversation. Conversation is a node."*
- *"Telemetry is a feature, not an addon."*
- *"Powerful primitives need policy boundaries."*
- *"AutoGen didn't fail. AutoGen succeeded enough to force the next
  thing."*
