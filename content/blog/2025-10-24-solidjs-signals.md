---
title: "SolidJS Signals Deep Dive"
date: "2025-10-24"
preview: "Understanding fine-grained reactivity and how it differs from React hooks."
slug: "solidjs-signals"
---

# SolidJS Signals

SolidJS brings reactivity back to its roots. Unlike React's VDOM re-renders, Solid updates only what needs to change.

## Fine-Grained Reactivity

Signals are the atoms of state. When a signal changes, only the specific DOM nodes subscribed to that signal are updated.
