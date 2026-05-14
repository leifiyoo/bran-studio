# Bran Studio Architecture Notes

## Data Model

The editor is built around `Project`, `Page`, and `SceneNode` types in `src/editor/core/scene-types.ts`.

- A project owns pages, components, styles, tokens, variable collections, libraries, and settings.
- A page owns `nodes` and `rootNodeIds`.
- A scene node owns geometry, visual properties, layout properties, children, metadata, export settings, annotations, and comments.

`Page.nodes` is the source of truth. Arrays like `rootNodeIds` and `children` are structural indexes that must stay consistent with it.

## Core Layer

`src/editor/core` should contain deterministic, reusable logic:

- Commands that transform project/page/node data.
- Geometry calculations.
- Hit testing.
- Snapping.
- Layout helpers.
- Import/export.
- History utilities.
- Shortcut interpretation.

Core logic should avoid React, browser APIs, and persistence APIs where possible.

## Store Layer

`src/editor/store` uses Zustand to coordinate:

- Loading projects.
- Active project/page selection.
- Current tool and selection.
- History commits.
- Persistence.
- Clipboard and assets.

Stores may call core functions, but they should not become the place where complex scene graph behavior lives.

## Render Layer

`src/editor/render` owns the canvas presentation and pointer interaction surface.

Important coordinate spaces:

- Screen coordinates: pointer/client values from browser events.
- Viewport coordinates: screen values adjusted by pan and zoom.
- World coordinates: page-level positions.
- Local coordinates: child node values relative to parent.

Any nested-node feature must be explicit about converting between these spaces.

## Persistence

Local data lives in IndexedDB through Dexie. Exported projects should be valid `.bran.json` documents and should remain readable enough for future source-control workflows.

## UI Composition

Routes in `src/app` compose app and editor surfaces. Editor panels should remain dense and task-oriented. Shared low-level UI components live in `src/components/ui`.

