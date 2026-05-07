---
title: Interview questions
---

# Interview questions

> Organised by level. Every question has a short answer, a detailed answer,
> an example, a common mistake to avoid, a follow-up question, and a strong
> follow-up answer. The follow-up chains continue in
> [`follow-up-questions.md`](follow-up-questions.md).

## Beginner

### B1. What is AutoGen?

- **Short answer.** A Microsoft Research framework for building LLM
  applications by composing multiple agents that talk to each other.
- **Detailed.** Released by MSR in fall 2023 (paper: arXiv:2308.08155),
  AutoGen introduced *conversable agents* — Python objects with a name,
  instructions, an LLM client, optional tools, and a `reply` method —
  and *conversation programming* (group chats, speaker selection,
  termination conditions). v0.4 (Jan 17 2025) is a layered rewrite with
  Core (actor runtime) / AgentChat / Extensions.
- **Example.** Two agents, an `AssistantAgent` and a `UserProxyAgent`,
  collaborate to write and run Python code in <30 lines.
- **Common mistake.** Conflating "AutoGen" with the v0.2 line; v0.4 is
  the current stable.
- **Follow-up.** *Why was a v0.4 rewrite needed?*
- **Follow-up answer.** v0.2's flat Python class hierarchy made it hard
  to scale to distributed deployments, observability, and stronger
  runtime contracts.

### B2. What is Microsoft Agent Framework?

- **Short answer.** Microsoft's production-grade agent SDK (Python +
  .NET) that unifies the enterprise foundations of Semantic Kernel with
  the orchestration ideas of AutoGen.
- **Detailed.** Public preview Oct 1 2025; GA 1.0 (LTS) on Apr 3 2026.
  Built on `Microsoft.Extensions.AI.IChatClient`, with a typed graph
  workflow engine, durable checkpointing, native HITL
  (`RequestInfoExecutor`), middleware, OpenTelemetry, declarative YAML
  agents, and Foundry-hosted runtime.
- **Example.** A sequential workflow with researcher → writer → editor
  executors, with checkpoint persistence and a HITL approval node, in
  ~30 lines of Python or C#.
- **Common mistake.** Treating MAF and SK as different products. SK
  agents are converging into MAF; SK Kernel/plugin remains.
- **Follow-up.** *What's GA in 1.0 vs preview?*
- **Follow-up answer.** GA: agents, workflows, memory, middleware,
  orchestration, checkpointing, OTel, declarative agents. Preview:
  DevUI, Foundry-hosted agents, evaluations, AG-UI/CopilotKit/ChatKit
  adapters, Agent Harness, Skills.

### B3. What is an agent?

- **Short answer.** A program that decides what to do next based on the
  current state of a goal, often using an LLM as the decision-maker.
- **Detailed.** Concretely: an LLM + instructions + tools + (optional)
  memory + a control loop (ReAct, plan-execute, etc.). The agent
  receives input, decides on tool calls or text output, observes
  results, iterates until a terminal condition.
- **Example.** A "research assistant" that, given a topic, iteratively
  searches the web, summarises results, and writes a report.
- **Common mistake.** Confusing an agent with a single prompt + tool
  call. The defining property is the control loop and decision-making.
- **Follow-up.** *What's the difference between ReAct and Plan-and-Execute?*
- **Follow-up answer.** ReAct interleaves thought-action-observation
  steps; Plan-and-Execute pre-computes a plan and then runs it. ReAct
  is cheaper and adaptive; Plan-and-Execute is better when steps are
  parallelisable or expensive to redo.

### B4. What is a tool?

- **Short answer.** A function the LLM can call to take an action or
  fetch information.
- **Detailed.** Tools have a name, a JSON-schema-described signature,
  and an implementation. Frameworks turn the schema + a docstring into
  the description the model sees, parse the model's tool-call
  arguments, execute, and feed the result back.
- **Example.** `search(query: str) -> list[Document]`.
- **Common mistake.** Thinking of tools as RPC. Tools are *intentful* —
  the model picks them; you don't dictate.
- **Follow-up.** *Why does MCP matter?*
- **Follow-up answer.** MCP (Model Context Protocol) is an open standard
  for exposing tools to any agent runtime, decoupling tool
  implementation from agent framework.

### B5. What is multi-agent orchestration?

- **Short answer.** Coordinating multiple agents to solve a task
  together.
- **Detailed.** Patterns: sequential pipeline, supervisor + workers,
  swarm with handoffs, group chat, planner + workers (Magentic). Each
  pattern has different trade-offs for predictability, flexibility,
  and emergent behaviour.
- **Example.** Researcher → writer → editor for content creation;
  triage → specialist for support routing.
- **Common mistake.** Adding more agents when one would do. Smaller
  teams are easier to reason about.
- **Follow-up.** *When do you not want multi-agent?*
- **Follow-up answer.** When the task is small enough for one agent +
  good tools. The cost of multi-agent is debuggability and emergent
  behaviour you may not want.

### B6. Why do agents need memory / state?

- **Short answer.** Because tasks span turns, sessions, and sometimes
  days; the agent must remember what it has done and learnt.
- **Detailed.** Memory layers: working context (current prompt), thread
  / session memory (conversation), episodic memory (past sessions),
  semantic memory (KB / RAG), procedural memory (cached plans).
- **Example.** A user assistant that remembers preferences across
  sessions; a research workflow that resumes after a 2-day HITL pause.
- **Common mistake.** Stuffing everything into the context window;
  always recall on demand instead.
- **Follow-up.** *How does MAF handle state?*
- **Follow-up answer.** Per-thread state in `AgentThread`; long-term
  via `IMemory` providers; durable workflow state via the checkpointer.

## Intermediate

### I1. What are the strengths of AutoGen?

- **Short.** Best-in-class multi-agent conversation primitives;
  excellent code-execution support; strong research community.
- **Detailed.** GroupChat / Swarm / Magentic-One are the most
  influential multi-agent patterns; AutoGen Bench gives programmatic
  evaluation; AutoGen Studio teaches the abstractions interactively;
  the v0.4 layered architecture (Core / AgentChat / Ext) is genuinely
  scalable for research.
- **Common mistake.** Underestimating Code Execution. It's the most
  general tool; AutoGen made it first-class.
- **Follow-up.** *What's Magentic-One?*
- **Follow-up answer.** A multi-agent pattern with an orchestrator
  agent that maintains a *task ledger* (facts, plan, progress) and
  dispatches work to specialist agents (web surfer, file surfer,
  coder, terminal) until done.

### I2. What are the limitations of conversation-based orchestration?

- **Short.** It's elegant but production-fragile.
- **Detailed.** Implicit state (no checkpoint per step), opaque speaker
  selection, no native middleware, debuggability harder than typed
  graph, durability is DIY, governance bolted on.
- **Common mistake.** Thinking "we'll just add OTel later." The
  abstraction itself complicates debugging; OTel helps but doesn't
  fully fix it.
- **Follow-up.** *How do typed graph workflows fix this?*
- **Follow-up answer.** Typed inputs/outputs at each executor;
  checkpoint per step; resume / time-travel; explicit edges; one
  middleware surface; one telemetry surface.

### I3. Why is observability hard in multi-agent systems?

- **Short.** They are inherently distributed traces with high cardinality.
- **Detailed.** A single user request can trigger 10 agents, 30 model
  calls, 50 tool calls, in nested patterns. Without OTel + GenAI
  semantic conventions, you can't reconstruct what happened. With
  poorly-designed logs you have a 2,000-line text dump.
- **Follow-up.** *What attributes should every span carry?*
- **Follow-up answer.** thread_id, run_id, parent_run_id, agent_name,
  agent_version, model, prompt_tokens, completion_tokens, cost,
  tool_name, args_redacted_hash, latency.

### I4. Why is tool execution risky?

- **Short.** Tools cause side effects; LLMs choose them; LLMs can be
  manipulated.
- **Detailed.** Threats: prompt injection (a tool result tells the
  model to do something else), confused-deputy (tool runs with
  privileges the user doesn't have), data exfiltration (tool sends
  private data to an external endpoint), runaway cost.
- **Mitigations.** Auth scoped to the user; tool allow-lists per
  agent; idempotency keys; sandboxes for code execution; PII
  redaction; per-tool budgets; gateway with audit log.
- **Follow-up.** *How would you defend against prompt injection?*
- **Follow-up answer.** Treat tool outputs as untrusted; strip /
  escape strings that look like instructions; consider dual-LLM with a
  planner that never sees raw tool output; use guardrails to detect
  injection patterns.

### I5. How do you evaluate agent quality?

- **Short.** Three layers: component, trajectory, end-to-end.
- **Detailed.** Component: unit tests on tools/prompts/retrievers.
  Trajectory: did the agent's plan look right? did it call the
  expected tools? Use LLM-judge with rubric or programmatic checks.
  End-to-end: golden-set scoring on correctness, faithfulness,
  latency, cost, refusal-rate. Run on every PR; sample online.
- **Follow-up.** *How do you trust an LLM judge?*
- **Follow-up answer.** Calibrate against human-graded sets; rotate
  judges; track inter-rater reliability; periodically audit.

### I6. Why do enterprise systems need agent registries?

- **Short.** To know what they have and who owns it.
- **Detailed.** A registry is a manifest store with version, owner,
  status, deprecation, tools allowed, evals attached. Without it,
  multi-team usage devolves into "ask Jane which agent handles
  refunds." Lifecycle (`draft → in-review → approved → deployed →
  deprecated`) needs an enforcement boundary.
- **Follow-up.** *What's the smallest viable registry?*
- **Follow-up answer.** A Git repo of YAML manifests + a CI
  workflow that validates schema, runs evals, and writes an index
  file. That's enough for a single team or two.

## Advanced

### A1. Why would a company move from AutoGen to a newer framework?

- **Short.** Conversation-as-orchestration doesn't survive contact
  with production. They need typed durable workflows, native HITL,
  middleware, OTel-native, and a managed runtime.
- **Detailed.** Specific drivers: regulatory audit (need immutable
  trace), .NET parity (existing app stack), HITL durability (multi-day
  approvals), multi-team adoption (registry / lifecycle), one telemetry
  surface (cost, latency, errors).
- **Follow-up.** *Walk me through the migration plan.*
- **Follow-up answer.** Inventory → contracts → workflow rewrite →
  middleware → HITL primitives → evals → OTel / DevUI → dual-run →
  cutover behind a flag → decommission. Budget ~1 day per agent for
  the rewrite, ~6 weeks total for ~20 agents.

### A2. What roadblocks happen when agent prototypes become production systems?

- **Short.** Implicit state, no middleware, no HITL durability, opaque
  multi-agent traces, no governance, no managed runtime.
- **Detailed.** See [`autogen-roadblocks.md`](autogen-roadblocks.md).
  Each becomes a real on-call ticket the first time you hit scale.
- **Follow-up.** *Which roadblock costs the most when ignored?*
- **Follow-up answer.** Telemetry. Without it, every other roadblock
  is invisible.

### A3. How would you redesign AutoGen for enterprise use?

- **Short.** Replace the conversation substrate with a typed graph
  workflow; keep conversation as a node type. Then add middleware,
  HITL, observability, governance, and managed runtime.
- **Detailed.** That's almost exactly what MAF did. So good answer:
  describe MAF in your own words and call out the deltas:
  - Common base class (`AIAgent`).
  - `IChatClient`-style provider abstraction.
  - Workflow engine with checkpointer + time-travel.
  - `RequestInfoExecutor` for HITL.
  - Middleware pipeline.
  - OTel-native + DevUI.
  - Declarative YAML agents.
  - Foundry-hosted runtime.
- **Follow-up.** *What would you do differently from MAF?*
- **Follow-up answer.** Honest answer: not much, but I'd push harder
  on cross-language LangGraph-style supervisor-as-an-agent and on a
  built-in evaluation primitive that runs on every PR.

### A4. How would you build an agent runtime?

See [`system-design-lessons.md#1-design-an-enterprise-agent-platform`](system-design-lessons.md).

### A5. How would you enforce policy across tools?

- **Short.** Through middleware (in-process) for runtime-private
  concerns and a tool gateway (out-of-process) for shared tools.
- **Detailed.** Middleware: telemetry, redaction, retries, idempotency.
  Gateway: auth, rate limit, audit log, allow-list per agent.
- **Follow-up.** *How does the gateway authenticate the calling agent?*
- **Follow-up answer.** mTLS between runtime and gateway; per-runtime
  signing keys; the agent's run carries a JWT scoped to (user_id,
  tenant_id, agent_name, agent_version). Gateway verifies against
  the registry's manifest.

### A6. How would you debug multi-agent failures?

- **Short.** OTel + a graph-aware debugger (DevUI / LangSmith);
  reproduce by replaying a captured trace.
- **Detailed.** Fix the trace ID; pull all spans; visualise as a graph
  with attribution; replay the failing run from a checkpoint with the
  same prompt + tool outputs; diff against a known-good run.
- **Follow-up.** *How do you replay a non-deterministic run?*
- **Follow-up answer.** Two options: (a) record-replay tool calls
  (capture all tool inputs/outputs in the original run; replay them
  deterministically); (b) fix the model + temperature 0 and hope; the
  former is more robust.

### A7. How would you evaluate agent workflows (not just agents)?

- **Short.** Treat the workflow as the unit of test: golden inputs,
  expected outputs, cost / latency budgets, scenario coverage.
- **Detailed.** Per-workflow eval set; LLM-judge for "did the
  workflow take a reasonable path?" plus programmatic checks for
  side effects (tool was called with X, HITL was requested, final
  output matches schema). Run on every PR.
- **Follow-up.** *How do you handle expensive evals?*
- **Follow-up answer.** Two-tier: a small fast set (5–10 cases) on
  every PR; the full set nightly. Cache deterministic tool outputs
  to avoid re-running them.

### A8. How would you design agent lifecycle management?

- **Short.** A state machine on the manifest: draft → in-review →
  approved → deployed → deprecated → retired.
- **Detailed.** Each transition requires gates (eval pass, owner
  sign-off, traffic = 0). Deprecation has a sunset date and a
  replacement pointer. Threads pin the version they started with;
  deprecation does not break in-flight runs.
- **Follow-up.** *How do you handle hot-fix to a deployed manifest?*
- **Follow-up answer.** Either a new patch version with a fast-track
  approval, or a feature-flag-based override. Hot-fixes always
  generate a post-mortem.

## How to use these for prep

1. Read the short answer.
2. Try to give it from memory.
3. Compare to the detailed answer; fill the gaps.
4. Practice the follow-up exchange aloud.
5. Once you can hold a 5-minute conversation on the question without
   notes, move on.

For deeper chains, continue to [`follow-up-questions.md`](follow-up-questions.md).
