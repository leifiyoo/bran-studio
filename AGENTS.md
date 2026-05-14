# Bran Studio Agent Guide

## Mission

Bran Studio is a local-first interface design editor. Build it as a precise, stable, professional alternative to Figma and paper-based visual thinking tools.

The product should feel:
- Precise like a design tool.
- Fast like a local desktop app.
- Structured like a source-controlled document format.
- Calm and dense, not like a marketing page.

Priority order:
1. Canvas stability and selection accuracy.
2. Correct scene graph behavior and reliable `.bran.json` import/export.
3. Practical Figma-like editing: frames, layers, groups, components, tokens, assets, prototypes, inspect, and export.
4. Differentiators: local-first workflows, readable project data, design-to-code foundations, and paper-like ideation without losing precision.

## Stack

- Next.js App Router, React, TypeScript.
- Tailwind CSS v4 and local shadcn-style components in `src/components/ui`.
- Zustand for editor and project UI state.
- Dexie/IndexedDB for local-first persistence.
- Zod for `.bran.json` validation.
- Vitest for core logic.
- Playwright for editor flows.

Use `pnpm`. Do not introduce a second package manager.

## Required Commands

Before claiming completion, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Also run this when changing editor routes, canvas behavior, settings, dashboard flows, import/export UI, or anything user-visible in the editor:

```bash
pnpm test:e2e
```

If a command cannot run, state the exact blocker and what remains unverified.

## Project Map

- `src/app` - Next.js routes.
- `src/app/app/page.tsx` - local project dashboard.
- `src/app/app/projects/[projectId]/page.tsx` - editor route.
- `src/components/editor/EditorShell.tsx` - main editor shell composition.
- `src/editor/core` - pure editor logic and scene graph operations.
- `src/editor/render` - canvas rendering, overlays, hit interaction surface.
- `src/editor/panels` - toolbars, sidebars, properties, layers, assets.
- `src/editor/store` - Zustand stores that orchestrate state, persistence, selection, and history.
- `src/editor/tools` - tool-specific creation/interaction behavior.
- `src/lib/schemas.ts` - `.bran.json` validation schema.
- `src/lib/storage.ts`, `src/lib/db.ts` - local-first IndexedDB persistence.
- `src/tests` - Vitest tests.
- `src/e2e` - Playwright tests.
- `docs` - product, architecture, and agent workflow notes.

## Core Invariants

These are non-negotiable:

- `Page.nodes` is the source of truth for scene nodes.
- `Page.rootNodeIds` contains only nodes whose `parentId` is `null`.
- Every child id in `node.children` must exist in `Page.nodes`.
- Every non-root node must appear exactly once in its parent's `children`.
- Child `x` and `y` values are local to the parent.
- Rendering, hit-testing, selection bounds, snapping, drag, resize, and SVG export must derive world positions through the tree.
- Group, ungroup, duplicate, paste, import, page duplicate, and project duplicate must not leave stale parent or child ids.
- Core commands must return new objects. Do not mutate existing scene nodes in place inside `src/editor/core`.
- Store methods coordinate persistence, history, selection, and UI state. Complex scene graph logic belongs in `src/editor/core`.
- `.bran.json` shape changes require schema, migration, tests, and notes.

When in doubt, preserve scene graph correctness over UI convenience.

## Canvas Rules

- The canvas must feel stable. Avoid wobble, drift, cumulative snapping errors, or layout shifts during pointer interaction.
- Drag and resize should use transient draft state and commit once on pointer up.
- Do not attach global wheel handlers unless there is no scoped alternative and the behavior is documented.
- Snapping chooses one best candidate per axis. Do not accumulate multiple guide corrections.
- Grid renders behind nodes.
- Selection, guides, spacing overlays, and handles render above nodes.
- Handle sizes remain stable in screen space at every zoom level.
- Keyboard shortcuts should avoid typing contexts and should be implemented in core shortcut utilities where possible.
- Avoid native `alert`, `prompt`, and `confirm` in production flows. Use dialogs, inline editing, menus, or two-step destructive actions.

## Feature Priorities

P0:
- Stable canvas pan, zoom, selection, drag, resize.
- Valid scene graph operations.
- Undo/redo safety.
- Import/export validity.
- No data loss in local persistence.

P1:
- Tools, frames, layers, properties, constraints, snapping, layout guides.
- Reliable groups, duplicate, paste, lock, visibility, arrange.
- Export surfaces and inspect surfaces.

P2:
- Components, instances, variants, slots.
- Tokens, variables, shared styles, libraries.
- Assets and media handling.
- Prototype interactions.
- Dev inspect and design-to-code preparation.

P3:
- Collaboration, branches, comments, AI workflows, external integrations.

Prefer finishing a P0/P1 behavior cleanly over starting broad P2/P3 surfaces.

## Coding Rules

- Use TypeScript types instead of `any`. If a boundary must be untyped, isolate it and explain why.
- Prefer discriminated unions and existing schema/types in `src/editor/core/scene-types.ts`.
- Use structured data operations rather than ad hoc string manipulation for project data.
- Keep changes scoped. Do not rewrite unrelated styling, metadata, or route structure while fixing editor behavior.
- Do not flatten nested nodes to make rendering easier.
- Do not store duplicated derived world coordinates as source of truth unless there is a documented cache invalidation plan.
- Keep pure behavior testable in `src/editor/core`.
- Add comments only where they clarify non-obvious logic.
- Use ASCII unless the file already uses non-ASCII for a specific reason.

## UI Rules

- Editor UI should be dense, tool-like, and efficient.
- Prefer clear controls: icon buttons with tooltips, segmented controls for modes, toggles for booleans, sliders or numeric inputs for dimensions, menus for option sets, tabs for panels.
- Do not create marketing-style editor screens.
- Avoid decorative gradients, large hero sections, and oversized empty cards in app/editor routes.
- Text must fit at mobile and desktop sizes.
- Do not put cards inside cards.
- Keep panels predictable for repeated professional use.

## Data And Persistence

- IndexedDB/Dexie is the local-first persistence layer.
- Exported `.bran.json` must validate through `src/lib/schemas.ts`.
- Imports must not trust input. Validate, migrate, and normalize.
- Project data should remain readable and suitable for future source control workflows.
- Asset handling must consider size, data URLs, and future portability.

## Testing Policy

- Every `src/editor/core` behavior change needs Vitest coverage.
- Every user-visible editor behavior change needs at least one Playwright path when feasible.
- Schema changes require updates to:
  - `src/lib/schemas.ts`
  - import/export tests
  - migration behavior or migration notes
- Regressions around scene graph operations should include tests for nested nodes.
- Canvas interaction bugs should include tests for pointer/keyboard flow or a clear manual verification note if automation is not practical.

## Good Agent Workflow

1. Read the relevant files before editing.
2. Identify the invariant affected by the change.
3. Put reusable scene graph logic in `src/editor/core`.
4. Keep Zustand stores thin.
5. Add focused tests before or alongside behavior changes.
6. Run the required commands.
7. Report exactly what changed and what was verified.

For larger work, create or update a short doc in `docs` before implementation so future agents inherit the decision.

## Do Not

- Do not mutate existing scene nodes in place inside core commands.
- Do not hide type errors with `any`.
- Do not change exported project shape casually.
- Do not introduce global event listeners without cleanup and a scoped reason.
- Do not replace local-first behavior with server-first assumptions.
- Do not add cloud, auth, telemetry, billing, or collaboration dependencies unless explicitly requested.
- Do not use native browser prompt/confirm/alert in production editor flows.
- Do not break existing local projects without a migration path.

