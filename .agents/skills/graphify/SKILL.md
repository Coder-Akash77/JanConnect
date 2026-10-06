---
name: graphify
description: >-
  Transform entire codebases into a queryable knowledge graph using AST parsing
  and semantic extraction. Use to map dependencies, trace relationships between
  files/functions, find god nodes, and generate interactive architecture visualizers.
---

# Graphify — Codebase Knowledge Graph Skill

Graphify extracts the structural and semantic relationships across codebases (Python, JavaScript, TypeScript, SQL, JSON, YAML, etc.) and generates an interactive, queryable knowledge graph.

## Quick CLI Reference

### 1. Build / Update the Knowledge Graph
```bash
# Build the graph for the current repository
graphify build

# Build with specific output directory
graphify build --output graphify-out/

# Incremental update on recent file changes
graphify update
```

### 2. Query the Knowledge Graph
```bash
# Natural language semantic query
graphify query "How does intake routing connect to department agents?"

# Trace shortest path between two components
graphify path --from "backend/services/routing.py" --to "backend/services/agents.py"

# Explain a specific node / function / file
graphify explain "route_complaint"
```

### 3. Generate Visualizations & Reports
```bash
# Export interactive HTML graph visualization
graphify export --format html --output graphify-out/graph.html

# Generate comprehensive architecture Markdown report
graphify report --output graphify-out/GRAPH_REPORT.md
```

## Generated Artifacts
- `graphify-out/graph.json` — Raw structured knowledge graph (nodes, edges, confidence labels).
- `graphify-out/graph.html` — Interactive D3/WebGL graph visualizer for browsers.
- `graphify-out/GRAPH_REPORT.md` — High-level architecture map and god-node analysis.
