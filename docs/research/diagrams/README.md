# Agent framework research — diagrams

Mermaid sources for the diagrams referenced from
[`../open-source-agent-frameworks.md`](../open-source-agent-frameworks.md).

| File | What it shows |
|---|---|
| `maf-architecture.mmd` | Microsoft Agent Framework (MAF) high-level architecture |
| `autogen-architecture.mmd` | Microsoft AutoGen v0.4 layered architecture (Core / AgentChat / Ext) |
| `langgraph-architecture.mmd` | LangGraph: build → run → persist → observe → deploy |
| `crewai-architecture.mmd` | CrewAI Crews + Flows |
| `openai-agents-sdk.mmd` | OpenAI Agents SDK runner loop |
| `llamaindex-agentworkflow.mmd` | LlamaIndex Workflows + AgentWorkflow |
| `haystack-architecture.mmd` | Haystack 2.x Agent + Pipeline |
| `comparison-quadrant.mmd` | Orchestration depth vs production durability quadrant |
| `decision-tree.mmd` | Decision tree for picking an agent framework |

## How to render

GitHub renders fenced ```mermaid blocks natively in markdown. For these `.mmd`
sources you have several options:

- VS Code: install **Markdown Preview Mermaid Support** or **Mermaid Editor**.
- CLI: `npx -y @mermaid-js/mermaid-cli -i diagram.mmd -o diagram.svg`.
- Browser: paste contents into <https://mermaid.live>.

The main report embeds the same diagrams inline as fenced ```mermaid blocks so
they render directly on GitHub.
