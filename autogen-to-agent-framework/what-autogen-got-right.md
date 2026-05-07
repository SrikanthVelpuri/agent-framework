---
title: What AutoGen got right
---

# What AutoGen got right

> Before the lessons-learned page, an honest list of what AutoGen *nailed*.
> Every successor framework, including MAF, inherits these wins. If you skip
> this page you'll miss why MAF looks the way it does.

## 1. It made multi-agent feel obvious

**Why it mattered.** Before AutoGen, multi-agent systems were a research
curiosity with bespoke implementations per paper. AutoGen's `ConversableAgent`
+ `GroupChat` made the pattern *cheap to try*.

**Example.** Two-agent code-writer / code-reviewer in <30 lines. A planner +
worker + critic in <60 lines.

**What modern frameworks still copy.** Every modern framework now has named
multi-agent patterns (LangGraph supervisor/swarm, MAF group chat / handoff,
OpenAI SDK handoffs, CrewAI Crews). The vocabulary AutoGen popularised
(*group chat*, *speaker selection*, *handoff*) is the lingua franca.

## 2. It treated humans as first-class participants

**Why it mattered.** Most early agent libraries treated humans as an
afterthought ("add a confirmation step"). AutoGen's `UserProxyAgent`
*was a participant* in the same group chat as the LLM agents — the
orchestrator didn't need a special case.

**What modern frameworks still copy.** MAF's HITL (`RequestInfoExecutor`)
and LangGraph's `interrupt()` are more rigorous, but the conceptual move —
treating humans as a node in the orchestration graph — is AutoGen's.

## 3. It made code execution legitimate

**Why it mattered.** Code-as-action is the most powerful tool an agent can
have. AutoGen built it in: `code_execution_config={"work_dir": "coding"}`
and you had a working REPL agent.

**What modern frameworks still copy.** MAF's Agent Harness, OpenAI's code
interpreter, Smolagents' `CodeAgent` — all descend from the AutoGen pattern.
The community even standardised the *Docker-as-default-sandbox* idiom.

## 4. It made multi-agent prototyping cheap

**Why it mattered.** Time-to-first-experiment for a multi-agent demo went
from days (writing your own loop) to minutes (writing config). Researchers
could compare patterns; engineers could iterate on prompts.

**What modern frameworks still copy.** Every successful agent framework now
benchmarks itself on "how many lines for hello-world multi-agent."

## 5. It made tool calling structured

**Why it mattered.** Tools were Python functions decorated and registered.
AutoGen handled the schema generation, the tool call message, and the
execution loop.

**What modern frameworks still copy.** MAF's `AIFunction` / Python
`@ai_function`, LangChain's `@tool`, OpenAI SDK's `@function_tool`,
LlamaIndex's `FunctionTool` — all roughly the same shape AutoGen popularised.

## 6. It opened the research-to-production door

**Why it mattered.** Researchers used AutoGen to prove that multi-agent +
code execution + HITL was a viable programming model. That research
credibility is what made enterprises take agentic patterns seriously.

**What modern frameworks still copy.** The patterns themselves.
Magentic-One, Swarm, Group Chat — all became canonical.

## 7. It pioneered AutoGen Studio (low-code agent UX)

**Why it mattered.** Authoring an agent and watching its trace in a browser
was a new experience for many developers. Studio sessions made multi-agent
behaviour visible.

**What modern frameworks still copy.** MAF's DevUI (browser debugger),
LangGraph Studio, CrewAI Studio — all directly inspired by AutoGen Studio's
"see your agents work" UX.

## 8. It made benchmarking feasible

**Why it mattered.** AutoGen Bench gave a *programmatic* way to score agent
quality on tasks (HumanEval, GAIA, AssistantBench). Before that, "is your
agent any good?" was anecdotal.

**What modern frameworks still copy.** Foundry Evaluations, LangSmith
evaluations, `agent-framework-lab` — all stand on AutoGen Bench's
shoulders.

## 9. It built a community vocabulary

**Why it mattered.** Terms like *speaker selection*, *handoff*,
*ConversableAgent*, *Magentic*, *swarm of agents* now have shared meaning
because AutoGen normalised them.

**What modern frameworks still copy.** A common vocabulary lets
practitioners move between frameworks. That's a public good AutoGen
contributed.

## 10. It chose the right license and home

**Why it mattered.** MIT-licensed, public GitHub, Microsoft Research as
the brand. That combination invited contribution while signalling
seriousness.

**What modern frameworks still copy.** Most modern agent frameworks are
MIT or Apache; nearly all are open with public roadmaps.

## What MAF inherits directly

If you read the MAF source and docs after AutoGen, you'll see the
inheritance:

| AutoGen concept | MAF equivalent |
|---|---|
| `ConversableAgent` (uniform abstraction) | `AIAgent` (uniform abstraction over `IChatClient`)[^iChatClient] |
| `AssistantAgent` | `ChatClientAgent` / `ChatAgent` / `FoundryAgent` |
| `UserProxyAgent` for HITL | `RequestInfoExecutor` (typed, durable, resumable) |
| `GroupChat`, `SelectorGroupChat` | MAF group-chat workflow pattern |
| `Swarm` | MAF handoff workflow pattern |
| `MagenticOneGroupChat` | MAF Magentic workflow pattern |
| `FunctionTool` | `AIFunction` / `@ai_function` |
| `CodeExecutor` | Agent Harness + tools |
| AutoGen Studio | DevUI |

## The right lens

> **AutoGen wasn't a draft of MAF. AutoGen was the *experiment* that gave MAF
> a recipe.** Every "what AutoGen got right" item above is now table stakes
> for any serious agent framework. The next page lays out where the
> experimental design *did* hit limits — not as a critique, but as the
> ground truth that MAF (and its peers) were built to address.

---

[^iChatClient]: Microsoft Agent Framework — Building Blocks for AI (.NET Blog) confirms MAF is built directly on `IChatClient` from `Microsoft.Extensions.AI`.
