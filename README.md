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
"# bran-studio" 
"# bran-studio" 
