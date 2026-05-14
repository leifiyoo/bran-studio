# Bran Studio Product Vision

## North Star

Bran Studio should become a local-first visual design environment that combines the precision of Figma with the immediacy of paper.

The product is not a clone for its own sake. It should be better in the areas where local software can win:

- Fast startup and editing without waiting on a network.
- Reliable local project ownership.
- Clean, inspectable project files.
- Strong import/export and migration discipline.
- AI-assisted workflows that operate on a valid scene graph, not screenshots.
- Paper-like ideation that can mature into production-ready interface design.

## Product Pillars

### 1. Precision First

The editor must feel stable. Selection, drag, resize, snapping, guides, zoom, and undo/redo should be boringly reliable. A professional user should trust that objects stay where they put them.

### 2. Valid Documents

Every project is a structured document. The scene graph must remain valid after every operation. Import/export must be predictable and testable.

### 3. Local-First Ownership

Users should be able to create, save, duplicate, import, export, and recover projects locally. Cloud features can come later, but they must not be required for the core product.

### 4. Practical Design Workflows

Frames, layers, components, tokens, assets, prototypes, inspect, and export matter more than flashy demos. Build features until they are usable, not just visible.

### 5. AI As A Design Partner

AI should understand project structure, tokens, components, and layout intent. It should make small, reversible edits to real scene data, explain what changed, and preserve invariants.

## Near-Term Quality Bar

A feature is not done until:

- It preserves scene graph invariants.
- It behaves correctly with nested nodes where relevant.
- It can be undone/redone safely where relevant.
- It persists and exports correctly where relevant.
- It has focused tests.
- It does not make the editor feel less stable.

## Feature Roadmap Bias

Prefer this order:

1. Canvas correctness and editor stability.
2. Scene graph commands and document validity.
3. Layers, properties, frames, groups, constraints, snapping.
4. Components, styles, tokens, variables, libraries.
5. Prototypes, inspect, export, design-to-code.
6. Collaboration and external integrations.

