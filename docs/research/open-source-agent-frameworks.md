# Open-Source Agent Frameworks — Senior Architect's Research Report

> Author: AI Platform Architecture research note
> Last updated: May 2026
> Scope: Open-source frameworks for building, orchestrating and operating LLM agents and multi-agent systems.

This report is a deep, opinionated study of the major open-source agent frameworks, with extra weight given to the two Microsoft-owned options (**Microsoft AutoGen** and **Microsoft Agent Framework / MAF**), since the host repository is `microsoft/agent-framework`. It is intended to help architects choose, combine and operate these frameworks in production.

---

## Table of contents

1. [Summary table](#1-summary-table)
2. [Detailed framework-by-framework notes](#2-detailed-framework-by-framework-notes)
   1. [Microsoft AutoGen](#21-microsoft-autogen)
   2. [Microsoft Agent Framework (MAF)](#22-microsoft-agent-framework-maf)
   3. [Semantic Kernel](#23-semantic-kernel)
   4. [LangGraph](#24-langgraph)
   5. [CrewAI](#25-crewai)
   6. [OpenAI Agents SDK](#26-openai-agents-sdk)
   7. [LlamaIndex Workflows / AgentWorkflow](#27-llamaindex-workflows--agentworkflow)
   8. [Haystack Agents](#28-haystack-agents)
   9. [AutoGPT / Forge](#29-autogpt--forge)
   10. [Other notable frameworks](#210-other-notable-frameworks)
3. [Comparison matrix](#3-comparison-matrix)
4. [Recommended learning path](#4-recommended-learning-path)
5. [Best framework choices by use case](#5-best-framework-choices-by-use-case)
6. [Curated link index — best docs, guides, repos](#6-curated-link-index--best-docs-guides-repos)
7. [References](#7-references)

---

## 1. Summary table

| # | Framework | Owner | Languages | Primary abstraction | Multi-agent style | Workflow engine | HITL | Observability | Maturity (May 2026) | License |
|---|-----------|-------|-----------|---------------------|-------------------|-----------------|------|---------------|---------------------|---------|
| 1 | **Microsoft AutoGen** | Microsoft Research | Python (.NET-light) | Conversable agents + actor Core | GroupChat, Swarm, Magentic, custom | AgentChat / Core actors | Yes (UserProxyAgent, approvals) | OpenTelemetry, AutoGen Studio | Mature; 0.4.x stable, research-led, succeeded by MAF | MIT |
| 2 | **Microsoft Agent Framework (MAF)** | Microsoft (Foundry/CTO) | Python + .NET | `AIAgent` + graph `Workflow` | Sequential / concurrent / handoff / group / Magentic | First-class graph workflows w/ checkpoint, time-travel | Native `RequestInfo` + approvals | OpenTelemetry, DevUI debugger | **GA 1.0 (Apr 2026)**, LTS, production focus | MIT |
| 3 | **Semantic Kernel** | Microsoft DevDiv | C#, Python, Java | `Kernel` + plugins / planners | Agent Framework + Process Framework | Process Framework (state machine) | Yes (filters, function-call hooks) | OpenTelemetry | Mature; converging into MAF | MIT |
| 4 | **LangGraph** | LangChain Inc. | Python + JS/TS | StateGraph (nodes/edges, reducers) | Supervisor / swarm / hierarchical | Graph + persistence + interrupts | First-class `interrupt()` | LangSmith | Mature; de-facto OSS standard | MIT |
| 5 | **CrewAI** | CrewAI Inc. | Python | Agents, Tasks, Crews + Flows | Role-based crews | Flows (event-driven) | Yes (HumanInput tools) | Built-in + OpenLIT/Langfuse | Mature, enterprise tier (Crew Enterprise) | MIT (core) |
| 6 | **OpenAI Agents SDK** | OpenAI | Python + TS | `Agent` + handoffs + guardrails | Handoff graph (agents-as-tools) | Lightweight runner; sessions | Approvals + interrupts | Built-in tracing (OAI dashboard) | Production-ready, 1.x | MIT |
| 7 | **LlamaIndex AgentWorkflow** | LlamaIndex Inc. | Python + TS | Event-driven `Workflow` + `AgentWorkflow` | Multi-agent over events + Context | Workflows 1.0 (asyncio events) | `wait_for_event`, HITL events | Llama Cloud, OpenInference | Mature for RAG-heavy agents | MIT |
| 8 | **Haystack Agents** | deepset | Python | `Pipeline` + `Agent` component | Agent + sub-pipelines as tools | Pipelines (DAG with branches/loops) | Custom (HumanInput tool) | OpenTelemetry, deepset Studio | Mature 2.x, retrieval-first | Apache 2.0 |
| 9 | **AutoGPT / Forge** | Significant Gravitas | Python + TS (UI) | Block-graph runtime + Forge SDK | Single autonomous agent w/ blocks | AutoGPT Platform graph builder | Manual approval per step | Platform telemetry | Niche; pivoted to platform/marketplace | Polyform Shield (platform) + MIT (Forge/Classic) |
| 10a | **Pydantic AI** | Pydantic Team | Python | Type-safe `Agent` + tools | Agent-as-tool, A2A | Lightweight | Yes (function approvals) | Logfire | Fast-rising, 1.x | MIT |
| 10b | **Smolagents** | Hugging Face | Python | Code-writing agents | Manager + worker code agents | None (loop) | Manual | HF + OpenTelemetry | Lightweight, growing | Apache 2.0 |
| 10c | **Letta** (ex-MemGPT) | Letta Labs | Python + TS | Stateful `Agent` server with memory | Multi-agent shared memory | Letta server | Yes | Built-in | Memory-specialist | Apache 2.0 |
| 10d | **MetaGPT** | DeepWisdom | Python | Role-based "software company" | SOP-driven role hierarchy | StanFord-SOP graph | Limited | Custom | Research-heavy | MIT |
| 10e | **Google ADK** | Google | Python + Java | `LlmAgent` + tools + sessions | Sequential/parallel/loop agents | ADK Runner | Yes | Vertex AI + OTel | New (2025), maturing fast | Apache 2.0 |

#### Interview questions — Summary table

1. **Looking only at the table, which frameworks are credible for a Microsoft-shop production deployment in 2026?** MAF first (.NET parity, Foundry hosting, durable workflows, native HITL, OTel-native, GA 1.0). Semantic Kernel as a still-supported alternative if already in production. AutoGen for research/prototyping. LangGraph as the strongest non-Microsoft cross-cutting alternative.
2. **Which frameworks combine durable workflow checkpointing AND first-class HITL?** Only MAF and LangGraph (and SK Process Framework as a state-machine variant). Everything else either has weak persistence or DIY HITL.
3. **Which frameworks are language-portable beyond Python?** MAF (Python + .NET), Semantic Kernel (.NET + Python + Java), LangGraph (Python + JS/TS), OpenAI Agents SDK (Python + TS), LlamaIndex (Python + TS), Letta (Python + TS), Google ADK (Python + Java).
4. **Which frameworks ship a managed runtime in addition to the OSS library?** MAF (Foundry-hosted), LangGraph (LangGraph Platform), CrewAI (Crew Enterprise), LlamaIndex (Llama Cloud), Haystack (deepset Cloud), Letta (Letta Cloud), AutoGPT (AutoGPT Platform), Google ADK (Vertex Agent Engine). OpenAI Agents SDK and Pydantic AI deliberately ship library-only.
5. **If license matters (Apache 2.0 over MIT), what are your options?** Haystack, Smolagents, Letta, Google ADK. Everything else in this list is MIT (or Polyform Shield in the case of AutoGPT Platform).

---

## 2. Detailed framework-by-framework notes

For each framework I use a consistent template:

> Problem · When to use · Architecture · Lifecycle · Tools · Memory · Multi-agent · Workflow · HITL · Eval · Observability · Deployment · Enterprise · Examples · Docs · Community · Maturity · Pros / Cons · Compared to AutoGen · Compared to MAF.

---

### 2.1 Microsoft AutoGen

**Repo:** [`microsoft/autogen`](https://github.com/microsoft/autogen) · **Docs:** [microsoft.github.io/autogen](https://microsoft.github.io/autogen/stable/) · **License:** MIT.

**Problem it solves.** AutoGen pioneered the *conversable multi-agent* pattern: arbitrary teams of LLM-driven agents (and humans) collaborate by *messaging* each other to solve a task. It originated as a Microsoft Research project to study how LLM agents could plan, code, critique and self-correct in groups.

**When to use.**
- Research on multi-agent collaboration, debate, planner/executor, code-execution-in-the-loop.
- Prototyping novel orchestration patterns (Magentic-One, Swarm, GroupChatManager) before standardising on a production platform.
- Code-heavy agentic tasks where the **CodeExecutor** (Docker / Jupyter) is a first-class citizen.

**Architecture.** Since v0.4 (Jan 2025), AutoGen has a **layered architecture**:

1. **`autogen-core`** — async, event-driven actor runtime. Agents are addressable entities communicating by messages. Single-process or distributed (gRPC) runtimes.
2. **`autogen-agentchat`** — high-level conversational API: `AssistantAgent`, `UserProxyAgent`, `RoundRobinGroupChat`, `SelectorGroupChat`, `Swarm`, `MagenticOneGroupChat`.
3. **`autogen-ext`** — extensions: model clients (OpenAI, Azure, Anthropic, Ollama), code executors (Docker, Jupyter, Azure ACI), tools, web surfers, MCP.
4. **AutoGen Studio** — low-code web UI on top of AgentChat for design/test.
5. **AutoGen Bench** — benchmark harness for agent evaluation.

**Agent lifecycle.** Build → register with runtime → start runtime → publish task message → agents subscribe and respond → termination condition (`MaxMessageTermination`, `TextMentionTermination`, etc.) → runtime stop. Streaming via async iterators of `BaseChatMessage`.

**Tool-calling model.** Functions become tools with type hints; `FunctionTool` wraps Python callables. MCP tools are first-class via `mcp_server_tools()`. Tools are bound to an agent at construction; the LLM emits OpenAI-style tool calls which the framework executes and feeds back as `ToolCallResultMessage`.

**Memory model.** Stateless by default — `AssistantAgent` keeps a model context (sliding window, buffered, head-and-tail, or a `Memory` provider). The `Memory` interface allows pluggable stores (ChromaDB, Mem0, custom). Long-term memory is intentionally an extension point, not built in.

**Multi-agent orchestration.** This is AutoGen's headline feature:
- `RoundRobinGroupChat` — deterministic rotation.
- `SelectorGroupChat` — an LLM picks the next speaker.
- `Swarm` — agents handoff via tool calls (similar to OpenAI Swarm).
- `MagenticOneGroupChat` — Magentic-One orchestrator coordinates web/file/code/coder agents.
- Custom: write your own subclass of `BaseGroupChat` or wire up Core actors directly.

**Workflow support.** AutoGen treats orchestration as *conversation*, not as a DAG. There is no first-class graph workflow type (that is exactly what MAF added). Repeatable structured pipelines must be built atop Core actors.

**Human-in-the-loop.** `UserProxyAgent` participates as a human; `input_func` callbacks let you wire web/CLI/Slack inputs. Magentic / Swarm patterns can pause and ask for input.

**Evaluation.** `autogen-bench` runs scenario suites (HumanEval, GAIA, AssistantBench, etc.) and reports scores. `autogen-agentchat` supports message-level assertions for tests.

**Observability.** OpenTelemetry traces and metrics across runtime + AgentChat (spans for agent runs, model calls, tool calls). AutoGen Studio includes a session viewer.

**Deployment.** Local Python process; distributed `agentic` runtime over gRPC; AutoGen Studio is a FastAPI app. Containerisable but not opinionated about hosting.

**Enterprise readiness.** Mid-tier. OTel + code-execution sandboxing are good, but governance, durable workflow checkpointing and managed hosting are not first-class — that gap is exactly what MAF was created to close. Microsoft's official statement: AutoGen continues as a research playground; production users are guided to MAF.

**Examples.** [`python/samples`](https://github.com/microsoft/autogen/tree/main/python/samples) (agentchat, core, magentic-one, distributed). Notable: `magentic_one`, `gaia_runner`, `swarm`.

**Documentation quality.** Strong: layered tutorials (Core, AgentChat, Extensions), migration guides from 0.2 and to MAF, architecture deep-dives. Some examples lag the latest API changes.

**Community activity.** Very high (40k+ GitHub stars, Discord, weekly office hours). Maintained primarily by MSR + community.

**Maturity level.** Mature research framework; v0.4.x is the stable line; Microsoft has positioned MAF as the production successor.

**Pros.**
- Best-in-class multi-agent conversation primitives.
- Rich research patterns (Magentic-One, Swarm).
- Strong code-execution story.
- Healthy community.

**Cons.**
- API churn between 0.2 → 0.4.
- No native durable workflow / time-travel.
- Production deployment patterns are DIY.
- .NET support is limited (community).

**Vs. Microsoft Agent Framework.** AutoGen is the *research lineage* — chat-centric, flexible, exploratory. MAF is the *production lineage* — same agent ergonomics plus typed graph workflows, checkpointing, hosting and .NET parity. If you're doing novel multi-agent research, stay on AutoGen; if you're shipping, port to MAF (Microsoft publishes a [migration guide](https://learn.microsoft.com/en-us/agent-framework/migration-guide/from-autogen/)).

#### Interview questions — AutoGen

1. **Walk me through AutoGen v0.4's three layers and what each is for.** Expected: Core (event-driven actor runtime, async messaging, single-process or distributed gRPC), AgentChat (conversational high-level API: AssistantAgent / UserProxyAgent / RoundRobin / Selector / Swarm / Magentic), Extensions (model clients, code executors, tools, memory). Studio + Bench sit above AgentChat.
2. **When do you pick `SelectorGroupChat` vs `Swarm` vs `MagenticOneGroupChat`?** Selector when an LLM should pick the next speaker in an open conversation; Swarm when specialist agents own the conversation and explicitly hand off; Magentic when you need a planner/orchestrator with a task ledger and progress tracking for long open-ended goals.
3. **How does AutoGen handle code execution safely?** Through pluggable `CodeExecutor`s — `DockerCommandLineCodeExecutor`, `JupyterCodeExecutor`, `AzureContainerCodeExecutor`. Each runs in an isolated container/kernel with no host filesystem access; egress can be locked down; results stream back as `CodeResult` messages.
4. **A team says "we love AutoGen but need production durability and HITL." What do you recommend?** Migrate to MAF: same agent feel plus typed graph workflows, durable checkpointer, time-travel, `RequestInfoExecutor` HITL, .NET parity, OTel-native, and Foundry-hosted runtime. Use Microsoft's official migration guide; run both side-by-side and diff traces.
5. **How do you prevent runaway loops in an AutoGen group chat?** Use `MaxMessageTermination`, `TextMentionTermination`, structured "DONE" flags, per-thread token/cost budgets, and Magentic-style progress ledgers that detect no-progress and either replan or escalate to `UserProxyAgent`.
6. **How is `UserProxyAgent` actually used for HITL?** Treat it as a peer agent that, instead of calling an LLM, calls an `input_func` (CLI / web / Slack). It can also auto-execute code blocks. Termination conditions can target the human's reply.

---

### 2.2 Microsoft Agent Framework (MAF)

**Repo:** [`microsoft/agent-framework`](https://github.com/microsoft/agent-framework) · **Docs:** [learn.microsoft.com/agent-framework](https://learn.microsoft.com/en-us/agent-framework/) · **License:** MIT.

**Problem it solves.** MAF unifies and *productionises* the best ideas from AutoGen and Semantic Kernel into a single, multi-language, opinionated framework: ergonomic agent abstractions, graph-based workflows, durable state, observability, governance, and turnkey hosting on Microsoft Foundry — while staying provider-agnostic.

**When to use.** This is Microsoft's recommended default for any new agent system, especially:
- You need *both* .NET and Python.
- You want graph-based workflows with checkpointing, restart, and time-travel.
- You care about OTel observability, governance, and Foundry / Azure hosting.
- You're migrating off Semantic Kernel or AutoGen and need an LTS API.

**Architecture (high level).**
- **`AIAgent`** — the agent abstraction. Concrete implementations: `ChatAgent` (provider-agnostic), `OpenAIChatClient`, `AzureOpenAIChatClient`, `AnthropicChatClient`, `FoundryChatClient`, `OllamaChatClient`, `BedrockChatClient`, etc. Backed by Microsoft.Extensions.AI (`IChatClient`).
- **Tools** — function tools, MCP tools, OpenAPI tools, Foundry-hosted tools (Bing, file search, code interpreter), plus first-class `AIFunction`/Python `@ai_function`.
- **Middleware** — request/response/exception pipelines (telemetry, retries, redaction, security filters).
- **Workflows** — typed graph engine (`Workflow`, `Executor`, `Edge`, `WorkflowBuilder`). Supports sequential, concurrent (fan-out/fan-in), handoff, group chat, Magentic and custom topologies. Streaming events, **checkpointing**, **resume**, **time-travel**, **sub-workflows**.
- **Memory** — `IMemory` providers (Foundry memory, Redis, custom), thread-scoped state (`AgentThread`).
- **Skills** — domain knowledge bundles (files, snippets, libraries) discoverable by agents.
- **Hosting / runtime** — local dev, ASP.NET Core, FastAPI, Foundry-hosted agents (deploy with two extra lines of code), Agent Harness for shell/file/messaging loops.
- **DevUI** — browser debugger that visualises message flow, tool calls, state, and workflow graphs in real time.
- **Front-end adapters** — AG-UI, CopilotKit, ChatKit.

**Agent lifecycle.** `Create chat client → build AIAgent (instructions, tools, memory) → optional middleware → invoke (streaming or not) → AgentThread carries state across turns → optional checkpoint to durable store → optional rehydration / handoff to workflow`.

**Tool-calling model.** Annotated functions (`[Description]` in .NET, type hints + docstring in Python) are turned into tool schemas via Microsoft.Extensions.AI. Tool execution is middleware-routed; supports parallel tool calls, approvals, and Foundry hosted tools (no local execution).

**Memory model.** Per-thread message store + pluggable long-term `IMemory`. Foundry-hosted memory (preview), Redis, custom providers. Memory is queried as part of the agent's prompt assembly; explicit recall semantics rather than LangChain's chain-of-runnables.

**Multi-agent orchestration.** Workflow patterns shipped out of the box:
- **Sequential** — chain agents.
- **Concurrent** — fan-out + fan-in / map-reduce.
- **Handoff** — agents transfer control via typed handoff edges.
- **Group chat** — moderated conversation among agents.
- **Magentic** — orchestrator + worker pattern from MSR.

**Workflow support.** Best in class among generalist frameworks: typed messages between executors, durable checkpoints, resumable runs, sub-workflows, conditional/dynamic edges, streaming events, graph visualisation in DevUI.

**Human-in-the-loop.** First-class. `RequestInfoExecutor` pauses a workflow and emits a `RequestInfo` event; the host application returns a `RespondInfo` to resume. Supports tool-call approval flows and front-end adapters (CopilotKit / AG-UI / ChatKit).

**Evaluation.** Preview: workflow-level evaluators (regression, golden-set, LLM-as-judge), `agent-framework-lab` packages, integration with Foundry evaluations.

**Observability.** Native OpenTelemetry (spans for agent run, model call, tool call, executor, workflow event). Drop-in for App Insights, Jaeger, Honeycomb, Langfuse, Phoenix. DevUI uses the same OTel feed locally.

**Deployment.** Local; ASP.NET Core or FastAPI service; **Foundry-hosted agents** (managed, autoscaled); Azure Container Apps / AKS; Agent Harness for shell-and-file loops; works with any compute that runs Python or .NET.

**Enterprise readiness.** Highest of any open-source agent framework today: stable APIs (1.0 LTS, April 2026), governance, OTel, durable workflows, signed builds, AAD/Entra integration, Foundry policy controls, Microsoft commercial support paths.

**Examples.**
- [`python/samples`](../../python/samples/) — getting-started, agents (providers, middleware, observability), workflows (sequential, concurrent, handoff, magentic, checkpointing, HITL), hosting (Foundry, ASP.NET parity).
- [`dotnet/samples`](../../dotnet/samples/) — same hierarchy in .NET.
- [`declarative-agents/`](../../declarative-agents/) — YAML-defined agents.

**Documentation quality.** Excellent: MS Learn site, devblogs.microsoft.com/agent-framework, design decision records (ADRs) in [`docs/decisions`](../decisions/), feature specs in [`docs/features`](../features/), migration guides from AutoGen and SK.

**Community activity.** Rapidly growing; Microsoft Foundry Discord, weekly Foundry community calls, increasing third-party samples.

**Maturity level.** GA 1.0 since April 2026 with LTS commitment for core building blocks (agents, workflows, memory, middleware, orchestration). DevUI, evaluations, Foundry-hosted agents, and front-end adapters remain in preview.

**Pros.**
- True .NET + Python parity.
- Graph workflows with durability, checkpointing, time-travel, HITL.
- Provider-agnostic (Foundry, Azure OpenAI, OpenAI, Anthropic, Bedrock, GitHub Copilot SDK, Claude Code SDK, Ollama).
- DevUI is best-in-class for local debugging.
- Clean OTel.

**Cons.**
- Younger community than AutoGen / LangGraph.
- Some preview features (DevUI, evaluations) still moving.
- Steeper learning curve than CrewAI for newcomers.

**Vs. AutoGen.** Same agent feel; adds graph workflows, durability, HITL primitives, .NET parity, hosting and DevUI. AutoGen is research; MAF is production.

#### Interview questions — Microsoft Agent Framework

1. **What are MAF's core building blocks?** `AIAgent`, tools (functions / MCP / OpenAPI / Foundry-hosted), middleware, `AgentThread`, `IMemory`, Skills, Workflows (`Workflow`/`Executor`/`Edge`/`WorkflowBuilder`), hosting surfaces, DevUI, and front-end adapters.
2. **What is `RequestInfoExecutor` and why is it important?** A workflow node that pauses execution, persists a checkpoint, and emits a typed `RequestInfo` event to the host. The host (UI, Slack, ticketing system) returns a `RespondInfo` that resumes the workflow at the same checkpoint. This is how MAF gets first-class HITL without bolting it onto a chat loop.
3. **What's the difference between an `AIAgent` and a workflow `Executor`?** An `AIAgent` is an LLM-driven actor with tools, memory and instructions. An `Executor` is a typed node in a graph workflow — it can wrap an agent, a deterministic function, a HITL pause, or a sub-workflow. Workflows compose executors; agents are one kind of executor.
4. **Walk me through deploying to Foundry-hosted agents.** Build the agent or workflow locally; add `.WithFoundryHosting(...)` (.NET) or the Python equivalent; configure your project endpoint and identity; the framework pushes the agent definition to Foundry, which provisions managed compute, autoscale, networking, identity (Entra), telemetry (App Insights) and policy controls.
5. **How does MAF stay provider-agnostic?** Through `Microsoft.Extensions.AI.IChatClient` (and the Python protocol equivalent). Concrete implementations exist for Foundry, Azure OpenAI, OpenAI, Anthropic, Bedrock, Ollama, GitHub Copilot SDK and Claude Code SDK; swapping providers is a configuration change.
6. **Which MAF features are GA in 1.0 vs preview?** GA / LTS: agents, workflows, memory, middleware, orchestration patterns, checkpointing, OTel observability, declarative YAML agents. Preview: DevUI, Foundry-hosted agents, Foundry-backed memory and tools, evaluations, AG-UI / CopilotKit / ChatKit adapters, reusable Skills, Copilot/Claude Code SDK integration, Agent Harness.
7. **How would you migrate an AutoGen 0.4 group chat to MAF?** Map `AssistantAgent` → `AIAgent`; replace `SelectorGroupChat` with the MAF group-chat workflow pattern (or a typed handoff graph); replace `UserProxyAgent` with `RequestInfoExecutor` plus a CopilotKit/AG-UI adapter; map memory provider to `IMemory`; turn on OTel + DevUI to verify behavioural parity; add a checkpointer for durability.
8. **How does MAF observability work end-to-end?** Native OpenTelemetry spans for `agent.run`, `llm.call`, `tool.call`, `executor`, `workflow.event`, `request_info`. Attributes follow the GenAI semantic conventions (model, tokens, cost, tool name, redacted args, thread_id). Spans flow to App Insights / Jaeger / Honeycomb / Phoenix / Langfuse / DevUI.

---

### 2.3 Semantic Kernel

**Repo:** [`microsoft/semantic-kernel`](https://github.com/microsoft/semantic-kernel) · **Docs:** [learn.microsoft.com/semantic-kernel](https://learn.microsoft.com/en-us/semantic-kernel/) · **License:** MIT.

**Problem it solves.** SK was Microsoft's first-generation "AI orchestration SDK": treat LLM functions as plugins inside a `Kernel`, build planners and chat completion agents, and integrate cleanly into existing C# / Python / Java apps.

**When to use.**
- You're already on SK and on a stable workload — no need to rewrite.
- You want a lightweight C#/Java-first SDK to call LLMs and tools without going full agent-platform.
- You need the **Process Framework** (state-machine business processes with LLM steps).

**Architecture.**
- `Kernel` — DI container holding plugins, AI services, filters, prompts.
- **Plugins** — collections of `KernelFunction`s (native or prompt-template).
- **Connectors** — chat completion / embedding / vector store providers.
- **Filters / hooks** — pre/post invocation interception.
- **Agent Framework** (in SK) — `ChatCompletionAgent`, `OpenAIAssistantAgent`, group chats. *This is the lineage that became MAF.*
- **Process Framework** — long-running state-machine workflows with steps that can be agents, functions or human steps.

**Lifecycle, tools, memory.** Function-calling with auto invoke; memory via `ITextMemory` / vector connectors; prompt templating with Handlebars/Liquid.

**Multi-agent.** Through SK Agent Framework: `AgentGroupChat` with a `SelectionStrategy` and `TerminationStrategy`. Process Framework can host agents as steps.

**Workflow.** Process Framework — explicit state machine with events, parallel steps, retries.

**HITL.** Human steps in Process Framework; filters for tool-call approval.

**Evaluation / observability.** OTel, integrates with App Insights and Foundry Evaluations.

**Deployment.** Library — bring your own host (ASP.NET, FastAPI, Spring).

**Enterprise readiness.** High — used widely inside Microsoft and Fortune 500 .NET shops.

**Examples / docs.** Hundreds of [samples](https://github.com/microsoft/semantic-kernel/tree/main/python/samples) per language. Excellent documentation but increasingly redirects to MAF.

**Community.** Large and very active; SK Champions program; Microsoft devblog.

**Maturity.** Mature; in **convergence mode** — Microsoft positions MAF as the successor to SK Agent Framework. SK as a Kernel/plugin SDK remains supported; agent-specific APIs are guided to MAF.

**Pros / Cons.** Pros: stable, multi-language, big ecosystem, strong .NET integration, Process Framework. Cons: agent abstractions are now duplicated in MAF; future investment focuses on MAF.

**Vs. AutoGen.** SK is enterprise-app-friendly with DI/plugins/Process Framework; AutoGen is researchy. SK's agent layer is less powerful than AutoGen's group chats but more enterprise-shaped.

**Vs. MAF.** MAF is the successor — same .NET feel + multi-language parity + workflows + hosting. New projects should start on MAF unless you're tied to SK Process Framework today.

#### Interview questions — Semantic Kernel

1. **What problem did Semantic Kernel originally solve?** A polyglot (.NET / Python / Java) DI-friendly orchestration SDK that treats LLM functions as plugins inside a `Kernel`, plus connectors and planners — designed to drop into existing enterprise apps rather than imposing a new runtime.
2. **What is the SK Process Framework and when use it over a MAF Workflow?** Process Framework models long-running business processes as state machines with steps, events, parallel branches and retries. It predates MAF Workflows and remains the right choice when you already have SK in production and your model is *process state machine* rather than *agent graph*. New projects with HITL + durable agent graphs should prefer MAF Workflows.
3. **How are SK plugins different from MAF tools?** Plugins are collections of `KernelFunction`s (native code or prompt templates) registered with the `Kernel` — first-class `KernelArguments`, prompt-template functions, and DI integration. MAF tools are `AIFunction`/Python `@ai_function` callables registered with an agent; simpler surface, but tools can also be MCP, OpenAPI, or Foundry-hosted.
4. **How are SK filters different from MAF middleware?** SK filters are sync/async hooks around prompt rendering and function invocation — good for redaction, telemetry, retries inside a `Kernel` call. MAF middleware sits around the agent run and tool call lifecycle and is composable across the workflow. Same intent, different scope.
5. **When should a team migrate from SK Agent Framework to MAF?** When they need durable graph workflows, time-travel, native HITL primitives, .NET + Python parity for agents, or Foundry-hosted runtime. SK as a Kernel/plugin SDK can still coexist.

---

### 2.4 LangGraph

**Repo:** [`langchain-ai/langgraph`](https://github.com/langchain-ai/langgraph) · **Docs:** [docs.langchain.com/oss/python/langgraph](https://docs.langchain.com/oss/python/langgraph) · **License:** MIT.

**Problem it solves.** Bring *graph + state-machine* discipline to LLM agent control flow: explicit nodes, edges, reducers, persistence and interrupts — instead of opaque chains.

**When to use.**
- You want a programmable, durable, debuggable agent graph.
- You need first-class HITL with `interrupt()` and time-travel.
- You're already in the LangChain / LangSmith ecosystem.

**Architecture.**
- `StateGraph` — typed state (TypedDict) with **reducers** controlling how each field merges across steps.
- **Nodes** — Python functions (sync/async) that receive state and return updates.
- **Edges** — static or conditional routing functions.
- **Checkpointer** — pluggable persistence (`MemorySaver`, `SqliteSaver`, `PostgresSaver`, Redis, AWS Bedrock Sessions, etc.). Each step is a checkpoint inside a *thread*.
- **Interrupts** — `interrupt()` halts a thread and surfaces a value to the host; `Command(resume=…)` resumes.
- **LangGraph Studio / Platform** — visualiser, deploy runtime, scheduling, REST/SSE/Streaming, plus LangSmith for tracing/eval.

**Agent lifecycle.** Build graph → compile with checkpointer → invoke with `thread_id` → state reduces step by step → optional interrupt → resume → terminal.

**Tool-calling.** Through LangChain `Tool` / `@tool` decorator; `ToolNode` handles execution. Prebuilt `create_react_agent` returns a ready-made ReAct StateGraph.

**Memory.** Short-term: graph state + checkpointer. Long-term: `BaseStore` (`InMemoryStore`, Postgres) for cross-thread memories; LangMem for vector-backed long-term memory.

**Multi-agent orchestration.** Patterns: **supervisor**, **swarm**, **hierarchical**, **network**. `langgraph-supervisor` and `langgraph-swarm` are dedicated packages. Each agent is a sub-graph.

**Workflow.** This *is* the workflow engine — LangGraph is in many ways closer to Temporal-lite than to a chat framework. Good for long-running, branching processes; integrates with Temporal for very-long-running workloads.

**HITL.** Native: `interrupt()` + Studio approval UI; can fork or rewind threads.

**Evaluation.** LangSmith evaluations, `langgraph-evals` patterns, dataset replay against checkpoints.

**Observability.** LangSmith out of the box; OTel exporters available; Studio visualises live graph state.

**Deployment.** Self-host with Postgres; **LangGraph Platform** (managed runtime with scheduling, queues, cron); JS/TS port for Node deployments.

**Enterprise readiness.** High — used at Klarna, Replit, Elastic, etc.; SOC2 LangSmith.

**Examples.** [`langgraph/examples`](https://github.com/langchain-ai/langgraph/tree/main/examples), templates for ReAct, RAG, multi-agent supervisor/swarm, deep research; canonical book is the LangChain Academy "Introduction to LangGraph" course.

**Documentation quality.** Excellent and improving (rewritten in 2025–26). Concept docs and how-tos are unusually good.

**Community.** Very large — LangChain ecosystem. Discord, weekly office hours.

**Maturity.** Mature; arguably the de-facto OSS agent workflow engine.

**Pros.**
- Graph + persistence is the right abstraction for agentic workflows.
- HITL and time-travel are native.
- LangSmith is a strong eval/observability story.

**Cons.**
- Best inside LangChain ecosystem; some impedance otherwise.
- State schema + reducers feels heavy at first.
- Latency of LangSmith hosted features is opinionated.

**Vs. AutoGen.** LangGraph is a workflow engine first, conversation second; AutoGen is the inverse. LangGraph has stronger durability and HITL; AutoGen has richer pre-built multi-agent chat patterns.

**Vs. MAF.** Closest peer — both are graph-workflow-first agent frameworks. MAF has .NET parity, Foundry hosting, declarative agents, and a tighter Microsoft ecosystem; LangGraph has a more mature OSS ecosystem, LangSmith and a larger community. Many teams use both: LangGraph + LangSmith for OSS-only stacks, MAF for Azure-anchored .NET/Python stacks.

#### Interview questions — LangGraph

1. **Explain reducers in `StateGraph`.** State is a `TypedDict` whose fields are `Annotated[T, reducer]`. After each node returns a partial update, the runtime applies the reducer to merge it into the current state (e.g., `add` for list concatenation, `operator.or_` for set union, custom for typed merges). Reducers prevent overwrite races and let multiple nodes update the same field safely.
2. **How does `interrupt()` actually work?** The runtime raises a special exception carrying a payload; the graph's checkpoint at that step is persisted. The host catches the value, asks the human, then resumes via `graph.invoke(..., Command(resume=value))` which seeks to the checkpoint and continues with the human input merged into state.
3. **`MemorySaver` vs `SqliteSaver` vs `PostgresSaver` vs `BaseStore` — when do you pick each?** `MemorySaver` for tests and local dev. `SqliteSaver` for single-process apps with simple persistence. `PostgresSaver` for production with multiple workers and horizontal scale. `BaseStore` (separate from checkpointers) for cross-thread long-term memory (user preferences, KB).
4. **Supervisor vs Swarm packages — which when?** `langgraph-supervisor` for one-coordinator-many-workers (research writer, support orchestrator). `langgraph-swarm` for peer-to-peer handoffs where the "right" specialist owns the conversation (multi-domain triage).
5. **How does LangSmith integrate with LangGraph?** The LangChain runtime auto-emits traces to LangSmith including the per-step state delta, model call, and tool call; you can attach datasets, run regression evals, and replay any trace. LangSmith's UI is graph-aware so you can see the same nodes you built.
6. **When should you reach for Temporal instead of LangGraph?** When workflows can run for days/weeks with cross-system side effects, exactly-once guarantees, complex retry/backoff matrices, and you need the operations team to manage the runtime. Pattern: keep agent reasoning inside LangGraph; orchestrate the surrounding business workflow in Temporal.
7. **How is LangGraph different from old-style LangChain `AgentExecutor`?** `AgentExecutor` was an opaque ReAct loop with no first-class state, persistence, or HITL. LangGraph exposes the loop as an explicit graph you control, persists every step, supports interrupts, and is the recommended replacement.

---

### 2.5 CrewAI

**Repo:** [`crewAIInc/crewAI`](https://github.com/crewAIInc/crewAI) · **Docs:** [docs.crewai.com](https://docs.crewai.com/) · **License:** MIT (core).

**Problem it solves.** Make multi-agent collaboration feel like staffing a team: you describe **roles**, **goals**, **tasks** and **a crew**, and CrewAI orchestrates the rest. Add **Flows** for event-driven production pipelines.

**When to use.**
- Business automation where natural-language role definitions map cleanly to org structure ("Researcher", "Editor", "Strategist").
- Quick wins for non-engineers and PMs.
- Production pipelines stitching multiple crews via Flows.

**Architecture.**
- **Agent** — role + goal + backstory + tools + LLM.
- **Task** — description + expected output + assigned agent.
- **Crew** — list of agents + tasks + process (`sequential` or `hierarchical` with manager LLM) + memory + cache.
- **Flow** — event-driven graph layer (`@start`, `@listen`, `@router`) with state; can call crews or arbitrary code as steps.
- **Tools** — `BaseTool` subclasses or LangChain tools; rich built-in catalogue (web search, file IO, RAG, code interpreters).

**Lifecycle.** Define roles → instantiate crew → `crew.kickoff(inputs={...})` → tasks run sequentially or via manager → outputs flow → optional Flow handles broader pipeline.

**Tool-calling.** Native function-calling for OpenAI/Anthropic/Bedrock/Ollama. Tools support caching and result schemas.

**Memory.** Short-term, long-term, and entity memory backed by `mem0` or local vector stores; per-crew + per-agent.

**Multi-agent orchestration.** Hierarchical (manager + workers) or peer (sequential). Flows compose multiple crews.

**Workflow.** Flows ≈ event-driven micro-workflows; not as expressive as LangGraph or MAF but covers most business cases.

**HITL.** `human_input=True` on a task; approval/feedback in CLI; tools wrapping web/email forms.

**Evaluation.** Official `crewai-eval` suite; integration with OpenLIT, Langfuse, Arize, AgentOps.

**Observability.** OpenLIT/Langfuse/AgentOps/PromptLayer integrations; Crew Enterprise has built-in dashboards.

**Deployment.** Python module; Crew Studio (drag-and-drop); **Crew Enterprise** (managed runtime, deployments, dashboards, RBAC).

**Enterprise readiness.** Mid-to-high (with Crew Enterprise commercial tier).

**Examples.** [`crewAI-examples`](https://github.com/crewAIInc/crewAI-examples) — research crews, code review, marketing, finance, content generation. Lots of YouTube tutorials.

**Documentation quality.** Friendly and tutorial-heavy; less rigorous than LangGraph/MAF.

**Community.** Large and very active in the "vibe coder" / business-automation segment.

**Maturity.** Mature for its niche; rapid releases.

**Pros.**
- Lowest friction for role-based multi-agent.
- Excellent for business teams.
- Flows give a production-ish layer.

**Cons.**
- Less control over LLM cost/latency than graph frameworks.
- Reasoning traces can be loose.
- Heavily LLM-dependent (failure modes are emergent).

**Vs. AutoGen.** CrewAI is more opinionated and friendlier; AutoGen exposes more knobs and patterns. AutoGen better for research; CrewAI better for "ship a multi-agent pipeline this week".

**Vs. MAF.** MAF is more rigorous and durable; CrewAI is faster to start. Pair them: prototype in CrewAI, harden in MAF if you need workflows + governance.

#### Interview questions — CrewAI

1. **Crews vs Flows — when use which?** Crews for autonomous, role-based collaboration where agents decide who delegates and how (research, content, marketing). Flows for production pipelines that need event-driven, deterministic structure with state, conditional logic and triggers. Most real systems compose them: a Flow orchestrates one or more Crews.
2. **How does the hierarchical `Process` work?** A manager LLM is given the list of agents and tasks; for each task it picks the best-suited agent, dispatches, observes output, and either accepts or routes for revision — like an LLM-driven foreman.
3. **What memory layers does CrewAI provide?** Short-term (current run), long-term (across runs, default mem0-backed), entity memory (per-entity facts), and a tool cache (deterministic tool re-runs). Per-crew and per-agent.
4. **How would you scale CrewAI to many concurrent users?** Run each `kickoff` in a stateless worker (FastAPI / Celery / Cloud Run); externalise memory (mem0 / Redis); cap tools and tokens per task; add Langfuse/OpenLIT tracing; for production guarantees consider wrapping the Flow in Temporal or moving the orchestration to LangGraph/MAF.
5. **What are CrewAI's limitations to be aware of?** Loose reasoning traces, less control over LLM cost/latency than graph frameworks, hierarchical process can over-rely on the manager LLM, and durability/checkpointing is partial. Mitigate with budget guardrails and explicit Flows.

---

### 2.6 OpenAI Agents SDK

**Repo:** [`openai/openai-agents-python`](https://github.com/openai/openai-agents-python) (+ [`openai/openai-agents-js`](https://github.com/openai/openai-agents-js)) · **Docs:** [openai.github.io/openai-agents-python](https://openai.github.io/openai-agents-python/) · **License:** MIT.

**Problem it solves.** A small, opinionated agent SDK that grew out of OpenAI's Swarm experiment. Provides clean primitives: **Agents**, **Tools**, **Handoffs**, **Guardrails**, **Sessions**, **Tracing** — minimal magic, production-friendly.

**When to use.**
- You're targeting OpenAI Responses API but want provider-agnostic structure.
- You like minimal frameworks (Pydantic-AI feel) and want first-class handoffs.
- You want OpenAI's hosted tracing dashboard "for free".

**Architecture.** Pure Python (and TS):
- `Agent(name, instructions, tools, handoffs, guardrails)`.
- **Runner** loop drives turns until terminal.
- **Sessions** hold thread state.
- **Handoffs** are *tools* the LLM emits to delegate.
- **Guardrails** are async checks running in parallel with execution; tripwire raises and halts.
- **Tracing** is automatic and exports to OpenAI's dashboard or any OTel/Logfire/Langfuse exporter.

**Lifecycle.** `Runner.run(agent, input, session)` → loop: model call → tool calls / handoffs / guardrails → terminal output.

**Tools.** `@function_tool` decorator on Python functions; hosted tools (web search, file search, computer use, code interpreter) via OpenAI; agents-as-tools (`agent.as_tool()`); MCP support.

**Memory.** Sessions provide per-thread memory; long-term memory is BYO (vector store, etc.).

**Multi-agent.** Handoffs build a directed graph of specialists. Agents-as-tools is the "manager" alternative.

**Workflow.** Deliberately minimal — no graph engine. For complex flows, embed Agents SDK calls inside Temporal/LangGraph/MAF.

**HITL.** `RunHooks` and approvals on tool calls; interrupts and human-loop patterns documented.

**Eval / observability.** Built-in tracing with spans (model, tool, handoff, guardrail); pluggable processors (Logfire, Langfuse, Phoenix, Datadog, AgentOps).

**Deployment.** Library; pair with FastAPI/Express. No managed runtime.

**Enterprise readiness.** Solid for OpenAI-centric stacks; less opinionated for multi-cloud and durability.

**Examples.** [`examples/`](https://github.com/openai/openai-agents-python/tree/main/examples) — research bot, customer service, voice, MCP, financial research.

**Documentation quality.** Crisp and well-structured.

**Community.** Growing fast; backed by OpenAI; TS port has parity with Python.

**Maturity.** Production-ready 1.x.

**Pros.** Minimal, ergonomic, great handoffs/guardrails/tracing; provider-agnostic *in practice*; TS parity.

**Cons.** No graph workflow; no durable runtime; hosted tracing is OpenAI by default.

**Vs. AutoGen.** Smaller surface; lacks AutoGen's group-chat patterns; gains tracing & guardrails.

**Vs. MAF.** Comparable for single-agent and handoff scenarios; MAF wins on workflows, durability, .NET, hosting; OpenAI Agents SDK wins on minimalism and Responses-API-native ergonomics.

#### Interview questions — OpenAI Agents SDK

1. **How are handoffs implemented under the hood?** Each handoff is exposed to the LLM as a tool whose schema represents "transfer control to agent X". When the model calls it, the runner switches the active agent and feeds the conversation forward; optional `input_filter`s strip or transform context before the next agent sees it.
2. **What is a guardrail and when does it run?** An async function that runs *in parallel* with the agent step. It returns `tripwire=True` to halt execution. Input guardrails run on user input; output guardrails run on agent output; tool guardrails run around tool calls. They fail-fast and never block the happy path.
3. **How does `Sessions` work?** Sessions persist conversation state (thread of messages, tool results) outside the runner, keyed by an ID. Restart the process or move to another worker — passing the same `session` resumes the conversation.
4. **Compare agents-as-tools with handoffs.** Agents-as-tools: parent retains control, calls a child agent like a function and synthesises the reply. Handoffs: control transfers entirely. Pick agents-as-tools for orchestrator/specialist; pick handoffs for triage/routing.
5. **What does the tracing dashboard show?** Per-run: spans for each model call, tool call, handoff, and guardrail; inputs/outputs, latency, and costs. Pluggable trace processors export the same spans to Logfire / Langfuse / Phoenix / Datadog or any OTel backend.
6. **What's missing from OpenAI Agents SDK that LangGraph/MAF provide?** A graph workflow engine, durable checkpointing, time-travel, typed multi-step state, and a managed runtime — by design. For complex flows, embed the SDK inside Temporal/LangGraph/MAF.

---

### 2.7 LlamaIndex Workflows / AgentWorkflow

**Repo:** [`run-llama/llama_index`](https://github.com/run-llama/llama_index) · **Docs:** [developers.llamaindex.ai](https://developers.llamaindex.ai/) · **License:** MIT.

**Problem it solves.** Treat agent and RAG pipelines as **event-driven workflows** of Python coroutines reacting to events on a shared `Context`. AgentWorkflow layers a multi-agent orchestrator on top of Workflows 1.0 (June 2025 GA).

**When to use.**
- RAG-heavy applications where retrieval, reranking, citation and tool-use must compose with agent reasoning.
- You like Python `asyncio` event-driven semantics.
- You want a single framework that spans RAG and agents.

**Architecture.**
- `Workflow` — class with `@step` methods that consume and emit `Event`s; runs to completion.
- `Context` — shared state across steps (kv, streaming).
- `AgentWorkflow` — pre-built workflow orchestrating a list of `FunctionAgent` / `ReActAgent` instances with handoffs.
- Tools are `FunctionTool`/`QueryEngineTool`.

**Lifecycle.** `workflow.run(input)` → step graph driven by events → context updates → final event.

**Tools / memory.** Functions, query engines, retrievers, MCP. Memory via `ChatMemoryBuffer`, vector stores, llama-cloud.

**Multi-agent.** AgentWorkflow handles routing/handoffs and a global Context.

**Workflow.** Native event-driven `Workflow` engine — closest to LangGraph's StateGraph but expressed as event handlers; supports streaming, branching, loops, sub-workflows, retries.

**HITL.** `wait_for_event` pattern (e.g., `HumanResponseEvent`); UI integrations.

**Eval / observability.** LlamaIndex Evaluations, OpenInference, Llama Cloud traces.

**Deployment.** Library; **Llama Cloud** managed runtime for production deployments.

**Enterprise readiness.** Mid-to-high, especially when paired with Llama Cloud.

**Examples.** Many under [`docs/examples/agent`](https://docs.llamaindex.ai/en/stable/examples/agent/), notably `agent_workflow_multi`, `agent_workflow_basic`.

**Docs.** Excellent for RAG; AgentWorkflow docs improving steadily.

**Community.** Very large in the RAG community.

**Maturity.** Workflows 1.0 GA; AgentWorkflow stable.

**Pros.** Best RAG integration of any agent framework; clean event semantics; multi-agent + Context.

**Cons.** Smaller multi-agent pattern catalogue; less .NET; primarily Python.

**Vs. AutoGen.** AutoGen has richer multi-agent chat; LlamaIndex has stronger RAG and event-driven workflows.

**Vs. MAF.** MAF has stronger durability/checkpointing and .NET; LlamaIndex has stronger RAG and Llama Cloud. Pair them: MAF for orchestration, LlamaIndex query engines as tools.

#### Interview questions — LlamaIndex AgentWorkflow

1. **How is LlamaIndex Workflow different from LangGraph StateGraph?** Workflow is event-driven: `@step` handlers consume events and emit new events; the framework dispatches by event type. StateGraph is node/edge with reducers over a typed state. Both are graph engines; events feel more natural for streaming and pub/sub-style flows, state graphs are better when "the state" is the central concept.
2. **What is `Context` and what does it buy you?** A shared kv store + streaming sink across all steps in a workflow run. Steps read/write context for cross-step data without re-emitting events; tools also access it. It's the LlamaIndex equivalent of LangGraph's state.
3. **How does `AgentWorkflow` do handoffs?** It takes a list of agents (with declared tools and handoffs); the orchestrator agent emits a handoff event; the workflow routes it to the named agent which then becomes the active agent for subsequent events. Context is preserved.
4. **`FunctionAgent` vs `ReActAgent` — which when?** `FunctionAgent` for native function-calling models (OpenAI/Anthropic) — single tool-call message per step. `ReActAgent` for non-function-calling models or when you want the *thought / action / observation* trace explicit (text-based reasoning).
5. **Why is LlamaIndex AgentWorkflow particularly good for RAG-heavy agents?** Tools include `QueryEngineTool`, `RetrieverTool`, and seamless integration with the LlamaIndex retrieval stack (sub-question, hierarchical, hybrid). Agents call retrieval as just another tool, but the tool can carry rich citations and structured data back through Context.

---

### 2.8 Haystack Agents

**Repo:** [`deepset-ai/haystack`](https://github.com/deepset-ai/haystack) · **Docs:** [docs.haystack.deepset.ai](https://docs.haystack.deepset.ai/docs/intro) · **License:** Apache 2.0.

**Problem it solves.** Bring rigorous, typed, production-grade pipeline composition to LLM apps and agents — with a strong retrieval / search heritage from deepset.

**When to use.**
- Search-heavy production systems (enterprise RAG, semantic search, doc QA).
- Teams wanting Apache 2.0 licensing and explicit pipelines.
- Hybrid agentic + classical NLP pipelines.

**Architecture.**
- **Components** — typed inputs/outputs.
- **Pipelines** — DAG with branches and loops.
- **Agent** — pipeline component that loops a `ChatGenerator` with a `ToolInvoker` until termination.
- **Tools** — `Tool` class, `ComponentTool` (any component as tool), `@tool` decorator. State injection via `State` parameter.

**Lifecycle.** Build pipeline → `pipeline.run({...})` → component graph executes → Agent component loops until done.

**Tools.** Function tools, component tools, MCP, OpenAPI; multiple chat generator integrations (OpenAI, Anthropic, Ollama, Bedrock, Cohere, vLLM).

**Memory.** Conversation memory components, document stores (Elastic, Opensearch, Qdrant, Weaviate, pgvector, MongoDB Atlas).

**Multi-agent.** Sub-pipelines and component tools; less canonical "team of agents" abstraction than CrewAI/AutoGen.

**Workflow.** Pipelines with branches and loops; explicit and typed.

**HITL.** Custom tools (HumanInput); pipelines with confirmation steps.

**Eval / observability.** `haystack-eval`, deepset Studio dashboards, OTel.

**Deployment.** Library + Docker; **deepset Cloud** managed.

**Enterprise readiness.** High in retrieval-heavy enterprise.

**Examples.** [`tutorials`](https://haystack.deepset.ai/tutorials) — tool-calling agent, function calling chat, multi-modal pipelines.

**Docs.** Strong, rigorous; pipeline diagrams; cookbook of recipes.

**Community.** Mature European community; deepset is the commercial backer.

**Maturity.** Haystack 2.x is mature.

**Pros.** Type-safe pipelines; great retrieval; Apache 2.0; deepset Studio.

**Cons.** Multi-agent abstractions are thinner; less "agentic" mindshare than LangGraph/CrewAI.

**Vs. AutoGen / MAF.** Haystack's center of gravity is retrieval pipelines; AutoGen and MAF are agent-first. Use Haystack for sophisticated retrieval and embed it inside MAF/AutoGen as a tool.

#### Interview questions — Haystack

1. **What's the difference between `Tool`, `ComponentTool`, and the `@tool` decorator?** `Tool` is the base abstraction (name, description, JSON schema, callable). `ComponentTool` wraps any Haystack component as a tool — its inputs/outputs become the schema automatically. `@tool` decorates a Python function and uses its signature + docstring. Pick `@tool` for ad-hoc functions, `ComponentTool` to expose existing pipelines as tools.
2. **How does the `Agent` component loop work?** It feeds the system prompt + history to a `ChatGenerator`; if the response includes tool calls, it invokes them via a `ToolInvoker`, appends results to history, and re-invokes the generator until the model returns a non-tool message or termination. State is injected through the live `State` parameter.
3. **Why pick Haystack for an Apache 2.0 stack?** Most agent frameworks are MIT, but some enterprises require Apache 2.0 for patent grant clarity. Haystack is permissive Apache 2.0 with corporate backing (deepset) and a strong retrieval pedigree.
4. **How do branches and loops work in pipelines?** Components declare typed inputs/outputs; the pipeline DAG can fan out (multiple components consume the same output) and loop (an Agent can call itself or an upstream component again until a condition holds). Loops require explicit termination guards.
5. **When pick Haystack over LangGraph for a RAG agent?** When you want type-safe pipelines, strong retrieval primitives, and don't need a deep multi-agent or HITL story. For pure agent + workflow + HITL, LangGraph or MAF is stronger.

---

### 2.9 AutoGPT / Forge

**Repo:** [`Significant-Gravitas/AutoGPT`](https://github.com/Significant-Gravitas/AutoGPT) (and historical [`Auto-GPT-Forge`](https://github.com/Significant-Gravitas/Auto-GPT-Forge)) · **License:** Polyform Shield (platform) + MIT (Forge / Classic).

**Problem it solves.** AutoGPT was the original "give a goal, get an autonomous agent" project. It has since pivoted into:
- **AutoGPT Platform** — a low-code visual block-graph builder with marketplace, credits, model routing.
- **AutoGPT Classic + Forge** — the original autonomous agent + an SDK template.

**When to use.**
- You want a low-code visual platform with a marketplace of "blocks".
- You're studying autonomous agent design and the original Forge SDK pattern.

**Architecture.** Block graphs of typed inputs/outputs; backend in Python; UI in Next.js; marketplace + credits + multi-tenant infra. Forge SDK provides ability registration, memory, LLM abstraction.

**Lifecycle / tools / memory / workflow / HITL / eval / observability.** Platform-level: built-in. Library-level (Forge): basic ability registration, vector memory, OpenAI-style tool calls.

**Deployment.** Self-host or managed AutoGPT Platform; Polyform Shield restricts commercial redistribution.

**Enterprise readiness.** Lower than the others above; more of a *product* than a *framework*.

**Examples / docs / community.** Big nostalgic community; smaller technical mindshare today than in 2023.

**Maturity.** The platform is maintained; Forge is stable but no longer the centre of gravity.

**Pros.** Visual builder; marketplace; battle-tested autonomous loop ideas.

**Cons.** Polyform license restricts commercial use of platform; less suited for embedded library use.

**Vs. AutoGen / MAF.** Different category — AutoGPT Platform is closer to a *product* (think n8n for agents) than a developer SDK. MAF/AutoGen are SDKs you embed.

#### Interview questions — AutoGPT / Forge

1. **What's the relationship between AutoGPT Platform, AutoGPT Classic, and Forge?** AutoGPT Classic is the original autonomous-agent project. Forge is an SDK template for building Auto-GPT-style agents (abilities, memory, LLM abstraction). AutoGPT Platform is a newer block-graph low-code product with marketplace and credits — a different category from the original library.
2. **Why does the Polyform Shield license matter?** It restricts commercial redistribution of AutoGPT Platform — fine for internal business use, problematic if you want to embed it in a commercial product or fork it for resale. Forge and Classic remain MIT.
3. **Why has AutoGPT lost developer mindshare to LangGraph and MAF?** Because production teams need typed graphs, durability, HITL, OTel, and managed runtime; AutoGPT's sweet spot moved to a *product* ("low-code visual builder") rather than a *library*. The original autonomous-loop pattern was inspirational but not directly productionable.
4. **When (if ever) would you pick AutoGPT today?** When you want a low-code visual builder with a marketplace and a community of pre-built blocks for non-developers, and the Polyform license is acceptable. For embedded library use, prefer MAF / LangGraph / OpenAI Agents SDK.

---

### 2.10 Other notable frameworks

These deserve mention because they show up frequently in 2026 architecture decisions.

#### Pydantic AI
[`pydantic/pydantic-ai`](https://github.com/pydantic/pydantic-ai) · MIT.
"FastAPI-feel" for agents — type-safe `Agent[deps, output]`, structured outputs via Pydantic models, function tools, A2A and MCP, dependency injection, Logfire observability. Excellent for teams that already love Pydantic / FastAPI.

**Compared to MAF/AutoGen.** Smaller surface; closest peer is OpenAI Agents SDK + Pydantic typing. Less multi-agent / workflow ambition. Often used inside MAF/LangGraph nodes for type-safe sub-agents.

#### Smolagents
[`huggingface/smolagents`](https://github.com/huggingface/smolagents) · Apache 2.0.
HuggingFace's minimalist code-writing agent: instead of JSON tool calls, the LLM writes Python that the framework executes in a sandbox. Two flavors: `CodeAgent` and `ToolCallingAgent`. Multi-agent via `ManagedAgent`.

**Compared to MAF/AutoGen.** Much smaller; great for code-centric tasks where the model is strong; depends heavily on model quality.

#### Letta (formerly MemGPT)
[`letta-ai/letta`](https://github.com/letta-ai/letta) · Apache 2.0.
Stateful agents with hierarchical memory (core, archival, recall) running as a server. Good for assistants that need long-term memory across sessions and devices.

**Compared to MAF.** Memory-specialist; complementary — embed Letta as a memory backend behind a MAF agent.

#### MetaGPT
[`FoundationAgents/MetaGPT`](https://github.com/FoundationAgents/MetaGPT) · MIT.
"Software company" of role-based agents (PM, architect, engineer, QA) producing PRDs, designs and code. Heavy SOP-driven hierarchy.

**Compared to AutoGen.** Less general; more opinionated about software-development outputs. AutoGen's Magentic-One is the closest counterpart.

#### Google Agent Development Kit (ADK)
[`google/adk-python`](https://github.com/google/adk-python) · Apache 2.0.
Google's official agent SDK (Python + Java). `LlmAgent`, `SequentialAgent`, `ParallelAgent`, `LoopAgent`, sessions, callbacks, A2A protocol, Vertex AI integration.

**Compared to MAF.** Strong on Google Cloud / Gemini side; MAF parity-with-.NET wins on Microsoft side; both speak A2A / MCP for cross-vendor interop.

#### Mastra (TS) and AG2 (community AutoGen fork)
- **Mastra** — TypeScript-first agent framework; nice for Node-only shops.
- **AG2** — community fork of AutoGen 0.2 that kept the original API style; smaller momentum than v0.4 / MAF.

#### LangChain Agents (legacy)
The classic `AgentExecutor`/`initialize_agent` API is now deprecated in favor of LangGraph. New projects should use LangGraph.

#### Interview questions — Other frameworks

1. **Why pick Pydantic AI?** When the team values type-safety, structured outputs (Pydantic models for both inputs and outputs), DI, and a "FastAPI for agents" feel — and a single-agent or light-multi-agent shape is sufficient. A2A and MCP are first-class; Logfire gives clean observability.
2. **What's the trade-off with Smolagents' code-as-action approach?** Strong models produce solid Python; weaker models (sub-7B) introduce subtle bugs. Sandboxing is mandatory. The upside is composability — the agent can express loops, conditionals, and data manipulation as code instead of repeated tool-call rounds.
3. **When does Letta beat building memory yourself?** When you need hierarchical, server-managed long-term memory across sessions and devices and you don't want to design eviction, archival, recall and consistency. Embed Letta as a memory backend behind a MAF or LangGraph agent.
4. **What's MetaGPT's niche?** Generating end-to-end software artifacts (PRD, architecture, code, tests) from a single brief, by simulating a software company with role-based agents. Less flexible for general agent workflows but a reference for SOP-driven hierarchies.
5. **How does Google ADK compare to MAF?** Strong on Google Cloud / Gemini side with `LlmAgent`, `SequentialAgent`, `ParallelAgent`, `LoopAgent`, sessions, callbacks, and Vertex AI integration. MAF wins on .NET parity and the broader provider matrix; both speak A2A and MCP for cross-vendor interop.
6. **Why is the legacy LangChain `AgentExecutor` deprecated?** It hides state, has no first-class HITL, no checkpointing, and a confusing failure model. LangGraph replaces it with explicit graphs, persistence, and interrupts.

---

## 3. Comparison matrix

### 3.1 Feature matrix

| Capability | AutoGen | MAF | SK | LangGraph | CrewAI | OpenAI SDK | LlamaIndex | Haystack | AutoGPT | Pydantic AI | Smolagents | Letta | MetaGPT | Google ADK |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Languages | Py | Py + .NET | C#/Py/Java | Py + TS | Py | Py + TS | Py + TS | Py | Py + TS UI | Py | Py | Py + TS | Py | Py + Java |
| Single-agent ergonomics | Good | Excellent | Excellent | Good | Excellent | Excellent | Good | Good | n/a | Excellent | Good | Good | Mid | Excellent |
| Multi-agent patterns | Best-in-class | Best-in-class | Mid | Excellent | Excellent | Good (handoffs) | Good | Mid | n/a | Mid | Mid | Mid | Strong (SDLC) | Strong |
| Graph workflow engine | No (Core actors) | **Yes** | Process Fwk | **Yes** | Flows | No | Workflows | Pipelines | Block graph | No | No | No | No | Sequential/Parallel/Loop |
| Durable checkpointing | Limited | **Yes** | In Process Fwk | **Yes** | Partial | No | Partial | No | Platform-level | No | No | Server-side | No | Sessions |
| Time-travel / replay | No | **Yes** | Limited | **Yes** | No | No | Limited | No | No | No | No | Limited | No | No |
| HITL primitives | UserProxy | RequestInfo + adapters | Process Fwk steps | `interrupt()` | human_input | Approvals | wait_for_event | DIY tool | Manual approval | Approvals | Manual | Yes | Limited | Callbacks |
| MCP support | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Limited | Yes | Yes | Yes | Limited | Yes |
| OpenTelemetry | Yes | Yes (native) | Yes | Yes (+LangSmith) | Yes (integrations) | Yes (built-in) | Yes (OpenInference) | Yes | Platform only | Yes (Logfire) | Yes | Yes | Limited | Yes |
| Eval support | autogen-bench | AF Labs + Foundry Eval | Foundry Eval | LangSmith Eval | crewai-eval | Hosted + custom | LI Evals | haystack-eval | Platform | DIY | DIY | DIY | DIY | Vertex Eval |
| Managed runtime | AutoGen Studio | Foundry-hosted agents | n/a | LangGraph Platform | Crew Enterprise | None | Llama Cloud | deepset Cloud | AutoGPT Platform | None | None | Letta Cloud | None | Vertex Agent Engine |
| Front-end adapters | Studio UI | AG-UI / CopilotKit / ChatKit | n/a | Studio | Crew Studio | None | Chat UI | deepset Studio | Built-in | None | None | Built-in | None | Built-in |
| Declarative agents | No | YAML | Prompt configs | Templates | YAML | No | Workflow YAML | YAML | Visual | No | No | JSON | YAML | YAML |
| License | MIT | MIT | MIT | MIT | MIT | MIT | MIT | Apache 2.0 | Polyform/MIT mix | MIT | Apache 2.0 | Apache 2.0 | MIT | Apache 2.0 |

### 3.2 Architecture vs orchestration vs durability tradeoff

```mermaid
quadrantChart
    title Agent frameworks: orchestration depth vs production durability
    x-axis "Light orchestration" --> "Deep orchestration"
    y-axis "Library only" --> "Durable platform"
    quadrant-1 "Production platforms"
    quadrant-2 "Durable libraries"
    quadrant-3 "Lightweight SDKs"
    quadrant-4 "Orchestration libs"
    "OpenAI Agents SDK": [0.25, 0.25]
    "Pydantic AI": [0.2, 0.2]
    "Smolagents": [0.2, 0.15]
    "Haystack": [0.55, 0.55]
    "LlamaIndex": [0.6, 0.6]
    "AutoGen": [0.7, 0.4]
    "CrewAI": [0.65, 0.6]
    "LangGraph": [0.85, 0.8]
    "MAF": [0.9, 0.9]
    "Semantic Kernel": [0.5, 0.55]
    "AutoGPT Platform": [0.55, 0.85]
    "Google ADK": [0.7, 0.75]
```

> See diagram source in [`diagrams/comparison-quadrant.mmd`](diagrams/comparison-quadrant.mmd).

### 3.3 When-to-pick decision tree

```mermaid
flowchart TD
    A[New agent project] --> B{Need .NET?}
    B -- Yes --> C[MAF or Semantic Kernel<br/>Prefer MAF for new builds]
    B -- No --> D{Need durable graph workflows<br/>+ HITL?}
    D -- Yes --> E{Already in LangChain/LangSmith?}
    E -- Yes --> F[LangGraph]
    E -- No --> G[MAF Python or LangGraph<br/>MAF if Azure-anchored]
    D -- No --> H{Multi-agent pattern important?}
    H -- Yes --> I{Research / experimental?}
    I -- Yes --> J[AutoGen 0.4]
    I -- No --> K{Role-based simple?}
    K -- Yes --> L[CrewAI]
    K -- No --> M[OpenAI Agents SDK<br/>or MAF]
    H -- No --> N{RAG-heavy?}
    N -- Yes --> O{Pipeline-strict / Apache 2.0?}
    O -- Yes --> P[Haystack]
    O -- No --> Q[LlamaIndex AgentWorkflow]
    N -- No --> R[OpenAI Agents SDK<br/>or Pydantic AI]
```

> Source in [`diagrams/decision-tree.mmd`](diagrams/decision-tree.mmd).

#### Interview questions — Comparison matrix &amp; decision tree

1. **Which capability matters most when picking a framework for a regulated enterprise (banking / healthcare)?** Durable checkpointing + HITL primitives + OTel observability + clear data residency. MAF and LangGraph are the strongest combinations; AutoGen and CrewAI need extra wiring.
2. **Walk me through the decision tree for a Python-only team building a long-running research agent on AWS.** Need .NET? No → durable graph workflows + HITL? Yes → already in LangChain/LangSmith? Probably yes → **LangGraph**. If MAF was acceptable, MAF Python is also fine; the deciding factors become observability stack and team familiarity.
3. **You inherit an AutoGen 0.2 codebase that's hitting production-durability walls. What's your recommendation?** Migrate to MAF (preferred path Microsoft publishes a guide for) or to LangGraph if the team is OSS-only. AG2 stays on the 0.2 API but doesn't solve the durability problem. AutoGen 0.4 fixes architecture but not durability.
4. **Why does the decision tree branch on .NET first?** Because language parity is a hard constraint that knocks out most options immediately. Once .NET is required, the choice collapses to MAF or Semantic Kernel.
5. **Defend or attack: "LangGraph and MAF are interchangeable."** Defend: both are typed graph engines with checkpointing, HITL, time-travel, multi-agent patterns, OTel. Attack: MAF has true .NET parity, declarative YAML agents, Foundry-hosted runtime, and Microsoft commercial support; LangGraph has a far larger OSS community, LangSmith, and a more mature managed platform. They're peers, not interchangeable.

---

## 4. Recommended learning path

A 6-week curriculum for a senior engineer who wants production fluency in agent systems.

**Week 1 — Foundations.**
- Read: OpenAI "Building Agents" cookbook + Anthropic "Building effective agents".
- Build a single-agent ReAct loop with **OpenAI Agents SDK** (Python).
- Add a guardrail and tracing.

**Week 2 — Multi-agent + tools.**
- Build a 3-agent research/writer/critic pipeline with **AutoGen 0.4 AgentChat** (`SelectorGroupChat`).
- Wire MCP tools.
- Run AutoGen Bench on a small task suite.

**Week 3 — Graph workflows.**
- Build the same pipeline in **LangGraph** with checkpointer + `interrupt()` + LangSmith.
- Compare developer experience and observability.

**Week 4 — Microsoft Agent Framework deep dive.**
- Walk the [getting-started Python samples](../../python/samples/01-getting-started/).
- Read [user guide](https://learn.microsoft.com/en-us/agent-framework/user-guide/overview).
- Implement Magentic + handoff workflows; turn on **DevUI**; wire OpenTelemetry to Aspire / Phoenix.
- Repeat one sample in **.NET** to feel the parity.

**Week 5 — Production concerns.**
- Add **HITL** with `RequestInfoExecutor` (MAF) and `interrupt()` (LangGraph).
- Add **memory**: short-term (`AgentThread`), long-term (Foundry memory or Redis).
- Add **evaluations** (Foundry Eval / LangSmith Eval) and a regression test.
- Deploy to Foundry-hosted agents + CopilotKit / AG-UI front-end.

**Week 6 — RAG + business automation.**
- Build a RAG agent with **LlamaIndex AgentWorkflow** or **Haystack Agent**.
- Build a role-based research crew with **CrewAI**.
- Compare against the equivalent in MAF.

**Capstone.** A multi-agent ticketing assistant (intake → triage → research → draft → human approval → resolve) implemented twice — once in LangGraph, once in MAF — instrumented with OTel and evaluated on a 50-task golden set.

#### Interview questions — Learning path

1. **Why start with OpenAI Agents SDK in Week 1?** Smallest surface, fastest path to a working ReAct loop with guardrails and tracing — concepts you will reuse everywhere. Avoids ecosystem-lock-in early.
2. **Why is AutoGen Week 2 and LangGraph Week 3?** Multi-agent conversation primitives (AutoGen) teach the *patterns*; graph workflows (LangGraph) teach the *plumbing* — patterns first, plumbing after, so you can recognise what the plumbing solves.
3. **Why dedicate a full week to MAF?** Because it's the union of agent patterns + workflow plumbing + .NET parity + production hosting; experiencing all four together is what makes the architectural picture click.
4. **What does the capstone optimise for?** Hands-on comparison of MAF vs LangGraph on the *same* realistic problem with HITL, OTel, and an eval set — exactly the comparison senior interviews probe.
5. **A junior asks: "should I skip ahead to MAF?" What do you say?** No. The earlier weeks build vocabulary (ReAct, handoff, group chat, reducer, checkpoint, interrupt) that MAF assumes. Skipping makes MAF feel arbitrary.

---

## 5. Best framework choices by use case

| Use case | Top pick (May 2026) | Strong alternative | Why |
|---|---|---|---|
| **Enterprise agent platform** (governance, multi-language, durability, hosted) | **Microsoft Agent Framework (MAF)** | LangGraph + LangGraph Platform | Only OSS framework with .NET + Python parity, durable graph workflows, HITL primitives, OTel-native, declarative YAML, Foundry-hosted runtime, 1.0 LTS. |
| **Multi-agent research** | **AutoGen 0.4** | LangGraph (supervisor/swarm), MetaGPT | Richest pre-built multi-agent patterns (Magentic-One, Swarm); best community for novel collaboration research; AutoGen Bench. |
| **Production workflow automation** | **LangGraph** | MAF | Mature graph + persistence, time-travel, LangSmith evaluations; very large community. MAF chosen if Microsoft stack. |
| **LLM application backend** (single-agent or light multi-agent inside an existing app) | **OpenAI Agents SDK** | Pydantic AI, MAF (single-agent mode) | Minimal API, handoffs, guardrails, native tracing; Python + TS parity. |
| **Agent observability / evaluation** | **LangSmith** (with LangGraph) | Langfuse (with any), Foundry Eval (with MAF), Arize Phoenix | Best end-to-end traces + evaluations; deeply integrated with LangGraph. |
| **Low-code / no-code agent builder** | **AutoGPT Platform** | n8n + AI nodes, CrewAI Studio, Foundry Agent Studio | Visual block graph + marketplace; non-coder accessible. CrewAI Studio for role-based teams. |
| **RAG-heavy agent system** | **LlamaIndex AgentWorkflow** | Haystack Agent | Best RAG integration; AgentWorkflow + Workflows 1.0 unify retrieval and reasoning. |
| **TypeScript-first** | **OpenAI Agents JS** | LangGraph JS, Mastra | Best TS ergonomics today; LangGraph JS for graph workflows. |
| **Azure / Microsoft 365 / Copilot embeds** | **MAF** (with declarative agents + Copilot adapters) | Semantic Kernel | Designed for it; declarative agents + Copilot SDK + AG-UI / ChatKit. |
| **Long-term memory assistants** | **Letta** behind MAF/LangGraph | LangMem, mem0 | Specialised hierarchical memory engine. |
| **Code-writing agents** | **Smolagents** or **MAF Agent Harness** | OpenAI Agents SDK + computer use | Code-as-action models work best when sandboxed. |

#### Interview questions — Use-case picks

1. **An enterprise platform team asks why MAF over LangGraph for an "internal ChatOps copilot." Defend it.** .NET parity (most internal services are .NET), Foundry-hosted managed runtime + Entra/AAD integration, declarative YAML agents for review/governance, OpenTelemetry into existing App Insights, and a Microsoft commercial support path. LangGraph would still work but adds OSS-only operations.
2. **A research lab needs to publish a multi-agent benchmark. Which framework and why?** AutoGen 0.4 + AutoGen Bench: Magentic-One and Swarm are baseline patterns that reviewers recognise; AgentChat is permissive enough to express new patterns; OTel + Studio sessions make traces shareable.
3. **A PM wants a "ChatGPT clone for our docs" yesterday. What do you ship?** OpenAI Agents SDK + a hosted file-search tool, or LlamaIndex AgentWorkflow if RAG quality matters more than throughput-to-prod. Both are days, not weeks.
4. **A bank asks for a "loan application copilot" with multi-step approvals.** MAF or LangGraph: typed workflow + RequestInfoExecutor / interrupt for officer approvals + checkpointer for audit + OTel for observability + golden-set eval before production.
5. **The CTO is allergic to MIT licenses (legal team prefers Apache 2.0). Recommend a stack.** Haystack (RAG + agent), Smolagents (code agent), Letta (memory), Google ADK (orchestration). All Apache 2.0; you give up some of MAF/LangGraph's depth but keep the licensing posture.

---

## 6. Curated link index — best docs, guides, repos

### Microsoft AutoGen
- Docs: <https://microsoft.github.io/autogen/stable/>
- Repo: <https://github.com/microsoft/autogen>
- Migration to MAF: <https://learn.microsoft.com/en-us/agent-framework/migration-guide/from-autogen/>
- v0.4 launch blog: <https://devblogs.microsoft.com/autogen/autogen-reimagined-launching-autogen-0-4/>
- Magentic-One paper + repo path: `python/packages/autogen-ext/.../magentic_one`

### Microsoft Agent Framework (MAF)
- Docs: <https://learn.microsoft.com/en-us/agent-framework/>
- Workflows: <https://learn.microsoft.com/en-us/agent-framework/workflows/>
- Repo: <https://github.com/microsoft/agent-framework>
- Devblog: <https://devblogs.microsoft.com/agent-framework/>
- Python samples: [`python/samples`](../../python/samples/) (especially `03-workflows/` and `02-agents/observability/`)
- .NET samples: [`dotnet/samples`](../../dotnet/samples/)
- Decisions / ADRs: [`docs/decisions`](../decisions/)
- 1.0 GA blog: <https://devblogs.microsoft.com/agent-framework/microsoft-agent-framework-version-1-0/>

### Semantic Kernel
- Docs: <https://learn.microsoft.com/en-us/semantic-kernel/>
- Agent Framework section: <https://learn.microsoft.com/en-us/semantic-kernel/frameworks/agent/>
- Repo: <https://github.com/microsoft/semantic-kernel>

### LangGraph
- Docs: <https://docs.langchain.com/oss/python/langgraph/>
- Repo: <https://github.com/langchain-ai/langgraph>
- Academy course: <https://academy.langchain.com/courses/intro-to-langgraph>
- Persistence: <https://docs.langchain.com/oss/python/langgraph/persistence>

### CrewAI
- Docs: <https://docs.crewai.com/>
- Repo: <https://github.com/crewAIInc/crewAI>
- Examples: <https://github.com/crewAIInc/crewAI-examples>
- Flows: <https://docs.crewai.com/en/concepts/flows>

### OpenAI Agents SDK
- Docs (Py): <https://openai.github.io/openai-agents-python/>
- Repo (Py): <https://github.com/openai/openai-agents-python>
- Repo (JS): <https://github.com/openai/openai-agents-js>
- Tracing: <https://openai.github.io/openai-agents-python/tracing/>
- Handoffs: <https://openai.github.io/openai-agents-python/handoffs/>

### LlamaIndex
- Docs: <https://developers.llamaindex.ai/python/framework/>
- AgentWorkflow blog: <https://www.llamaindex.ai/blog/introducing-agentworkflow-a-powerful-system-for-building-ai-agent-systems>
- Workflows 1.0: <https://www.llamaindex.ai/blog/announcing-workflows-1-0-a-lightweight-framework-for-agentic-systems>

### Haystack
- Docs: <https://docs.haystack.deepset.ai/docs/intro>
- Repo: <https://github.com/deepset-ai/haystack>
- Tool-calling tutorial: <https://haystack.deepset.ai/tutorials/43_building_a_tool_calling_agent>

### AutoGPT
- Repo: <https://github.com/Significant-Gravitas/AutoGPT>
- Forge: <https://github.com/Significant-Gravitas/Auto-GPT-Forge>

### Other
- Pydantic AI: <https://ai.pydantic.dev/>
- Smolagents: <https://huggingface.co/docs/smolagents>
- Letta: <https://docs.letta.com/>
- MetaGPT: <https://github.com/FoundationAgents/MetaGPT>
- Google ADK: <https://google.github.io/adk-docs/>

---

## 7. References

Primary sources consulted (May 2026):

- Microsoft Agent Framework GA 1.0 announcement and release notes.
- AutoGen v0.4 launch blog and Microsoft Research forum talk.
- LangGraph persistence and patterns docs (LangChain, 2026).
- CrewAI Flows + Crews architecture docs and 2026 evolution write-ups.
- OpenAI Agents SDK Python and TS docs (handoffs, guardrails, tracing).
- LlamaIndex Workflows 1.0 and AgentWorkflow announcements.
- Haystack 2.x agents and tool-calling docs.
- AutoGPT releases and platform/Forge separation.
- 2026 community comparisons (Langfuse, Datadog State of AI Engineering, Morphllm framework breakdown, OpenAgents survey).

> See companion mermaid diagrams in [`docs/research/diagrams/`](diagrams/) for high-resolution architecture sketches of MAF, AutoGen, LangGraph, CrewAI and the cross-framework comparison.
