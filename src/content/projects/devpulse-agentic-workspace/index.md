---
title: "DevPulse Agentic Workspace"
summary: "A kanban board with a Notion sync bridge, built as vanilla-JS components over an Express server."
featured: true
order: 50
tags: ["JavaScript", "Express", "Notion API"]
---

A task board assembled from hand-written components — `Board`, `TaskCard`, and
`ActivityFeed` — over a small central store, with an Express server providing the sync
bridge to Notion. No framework: the component boundaries and state flow are explicit
rather than delegated.

The sync bridge is the interesting part, reconciling local board state against the Notion
API as the source of truth.
