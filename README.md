# Bran Studio

Bran Studio is a local-first interface design editor built with Next.js, React, TypeScript, Tailwind CSS, Zustand, Dexie, and Zod.

It is an early open-source Figma/Paper-like editor focused on product screens, frames, reusable components, design tokens, gradients, clean JSON project data, and future design-to-code workflows.

## Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` or `http://127.0.0.1:3000`.

## Quality Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

## Routes

- `/` - marketing homepage
- `/onboarding` - first-run onboarding
- `/app` - local project dashboard
- `/app/projects/[projectId]` - editor
- `/app/settings` - settings

## Local-First Data

Projects, pages, and assets are stored in IndexedDB through Dexie. Projects can be exported and imported as `.bran.json` files.

## AI And Project Guidance

This repository includes guidance for AI coding agents and contributors:

- `AGENTS.md` - main project rules, invariants, workflow, and verification policy.
- `docs/PRODUCT_VISION.md` - product north star and roadmap bias.
- `docs/ARCHITECTURE.md` - data model, core/store/render boundaries, and persistence notes.
- `docs/AI_WORKFLOW.md` - practical workflow for future AI changes.
- `.github/copilot-instructions.md` - GitHub Copilot summary.
- `.cursor/rules/bran-studio.mdc` - Cursor-compatible rule file.
