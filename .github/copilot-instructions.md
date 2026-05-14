# Copilot Instructions For Bran Studio

Bran Studio is a local-first Figma/Paper-style interface design editor built with Next.js, React, TypeScript, Tailwind CSS v4, Zustand, Dexie, Zod, Vitest, and Playwright.

Follow `AGENTS.md` first. The most important rules are:

- Preserve scene graph invariants in `Page.nodes`, `rootNodeIds`, `parentId`, and `children`.
- Put reusable editor logic in `src/editor/core`; keep Zustand stores thin.
- Treat child `x/y` as parent-local positions.
- Derive world positions through the tree for rendering, hit-testing, selection, snapping, and export.
- Do not mutate existing scene nodes in place inside core commands.
- Do not change `.bran.json` shape without schema, migration, and tests.
- Keep editor UI dense, precise, and tool-like.

Before completing changes, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run `pnpm test:e2e` for editor, routing, canvas, settings, dashboard, or other visible workflow changes.

