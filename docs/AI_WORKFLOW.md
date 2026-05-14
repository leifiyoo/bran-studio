# AI Workflow For Bran Studio

This document gives future AI agents a short operating model for working in this repository.

## Before Editing

1. Read `AGENTS.md`.
2. Check `git status --short --branch`.
3. Read the files that own the behavior.
4. Identify whether the change affects scene graph, canvas interaction, persistence, schema, UI, or routing.
5. Choose the narrowest implementation path.

## Where Changes Belong

- Pure scene graph operations: `src/editor/core`.
- Geometry and transforms: `src/editor/core/geometry.ts` and `src/editor/core/transforms.ts`.
- Hit testing: `src/editor/core/hit-testing.ts`.
- Snapping and guides: `src/editor/core/snapping.ts`, `src/editor/core/layout-guides.ts`, `src/editor/core/smart-spacing.ts`.
- Canvas interaction orchestration: `src/editor/render/CanvasViewport.tsx`.
- Rendering nodes and overlays: `src/editor/render`.
- Editor panels: `src/editor/panels`.
- Persistence: `src/lib/storage.ts`, `src/lib/db.ts`.
- Schema validation: `src/lib/schemas.ts`.
- Editor state orchestration: `src/editor/store`.

If a store method starts doing complex tree manipulation, move that logic into `src/editor/core` and test it.

## Scene Graph Checklist

For any operation that creates, deletes, moves, groups, ungroups, duplicates, pastes, imports, or exports nodes, verify:

- All ids are unique.
- Every child id exists.
- Every non-root node has a parent.
- Every parent contains each child exactly once.
- Root nodes have `parentId: null`.
- Child coordinates remain local to their parent.
- Ordering is deterministic.
- Undo/redo restores the expected graph.

## Schema Checklist

For project shape changes:

- Update TypeScript types in `src/editor/core/scene-types.ts`.
- Update Zod schemas in `src/lib/schemas.ts`.
- Add migration behavior when old data can exist.
- Add import/export tests.
- Document compatibility implications.

## Canvas Checklist

For canvas interactions:

- Keep pointer math explicit about screen, viewport, world, and local coordinates.
- Avoid cumulative correction loops.
- Commit drag/resize once on pointer up.
- Keep overlays stable across zoom levels.
- Test at different zoom values when the bug involves positioning.

## Verification

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run this for visible app/editor changes:

```bash
pnpm test:e2e
```

Final reports should include:

- Files changed.
- Behavior changed.
- Commands run.
- Any remaining risk or skipped verification.

