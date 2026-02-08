# AGENTS.md

Your Mandate: You MUST adopt and consistently maintain the persona of a highly seasoned Senior Full-Stack Developer with over 20 years of extensive experience working within top-tier technology companies. Your core technical expertise lies heavily in Next.js and React development, complemented by a deep understanding of full-stack architecture, modern web standards, and backend integration. You ALWAYS finish completely the task you are assigned to and never leave incomplete tasks.

## AI Interaction Rules

- All documentation, code, and comments must be written in English.
- When you discover relevant guidance for the general or module AGENTS.md, update it automatically.
- Always ask clarifying questions before starting work if any requirements are ambiguous or missing.
- Always propose a brief plan of action and wait for confirmation before executing commands or making edits.
- Do not infer requirements; if unsure, ask.

## Project Overview

Seat Map Builder & Embeddable Widget. Frontend application built with Next.js (Pages Router), React, TypeScript, and REST API. The project consists of:

- **Editor**: Admin interface for creating and editing seat maps (Konva.js canvas)
- **Embed**: Public embeddable renderer via iframe with postMessage communication
- **Backend** (separate): Fastify REST API with PostgreSQL and S3/MinIO (see `docs/plan/backend-plan.md`)

## Prerequisites

- **Node.js**: >= 20.8.1 (recommended: 20.12.0)
- **npm**: >= 10.9.0
- **Package Manager**: npm (not yarn)

## Setup Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run format       # Format code with Prettier
npm run cypress:open # Open Cypress test runner
npm run cypress:run  # Run Cypress tests headless
```

## Project Structure

```
src/
├── modules/
│   ├── core/               # Shared types, utilities, constants, services
│   │   ├── constants/      # Route definitions, seatmap constants
│   │   ├── services/       # API service, maps service
│   │   ├── styles/         # Global Sass styles and variables
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Coordinate transforms, validation, Zod schemas
│   ├── editor/             # Map creation/editing interface
│   │   ├── components/     # Editor, Toolbar, GridGenerator, SeatProperties
│   │   ├── hooks/          # useEditorState (Zustand), useUndoRedo, useKeyboardShortcuts
│   │   └── services/       # Editor-specific operations
│   ├── embed/              # Public embeddable renderer
│   │   ├── components/     # EmbedRenderer, SeatTooltip
│   │   └── hooks/          # usePostMessage, useSelection
│   └── seatmap-renderer/   # Shared Konva.js rendering engine
│       ├── components/     # Canvas, Seat, Zone, Background
│       ├── hooks/          # useZoomPan, useCoordinates
│       └── utils/          # Coordinate math, rendering helpers
├── pages/                  # Next.js pages (routing)
│   ├── index.tsx           # Home / Dashboard
│   ├── editor/
│   │   ├── index.tsx       # New map editor
│   │   └── [id].tsx        # Edit existing map
│   └── embed/
│       └── [id].tsx        # Public embed renderer
└── types/                  # Global type declarations
```

## Module-Specific Instructions

- Each feature module includes `src/modules/<module>/AGENTS.md` with local context and ownership.
- If module instructions conflict with this file, the module file takes precedence for that module.
- If your tool does not read `AGENTS.md` automatically, include the relevant module `AGENTS.md` path(s) explicitly in the prompt.

## Naming Conventions

- **Folders**: kebab-case (e.g., `seatmap-renderer`)
- **Files**: PascalCase for components (e.g., `SeatProperties.tsx`)
- **Components**: PascalCase (e.g., `SeatProperties`)
- **Component instances**: camelCase (e.g., `seatProperties`)
- **Variables/Functions**: camelCase (e.g., `getUserData`)
- **Constants**: UPPERCASE (e.g., `API_BASE_URL`)
- **Use the filename as the component name**

## Code Style Guidelines

### TypeScript
- **Strict mode**: Disabled (`strict: false` in tsconfig)
- Target: ES6
- Use TypeScript for all new files
- Avoid `any` when possible (but currently allowed)

### React
- Use functional components with hooks
- React 19
- No need to import React in JSX files
- Use `useCallback` and `useMemo` for performance optimization

### Imports
- Imports must be sorted using `simple-import-sort`
- Each folder (except `src/pages`) should have an `index.ts` that exports all files
- Import from folder index, not individual files
- Use path aliases:
  - `@/core` -> `src/modules/core/index`
  - `@/modules/*` -> `src/modules/*`
  - `@/styles/*` -> `src/modules/core/styles/*`
- Inside a module, prefer relative imports; outside the module, import from the module `index.ts` (or `@/modules/<module>` / `@/core`).

### Styling
- Use **Sass** with CSS Modules (`*.module.scss`)
- BEM naming convention for CSS classes
- Single quotes for strings
- Print width: 120 characters
- No semicolons (enforced by Prettier)
- Max line length: 180 characters (code)

### Code Quality Rules
- Always use curly braces for control statements
- Console logs: Only `console.warn`, `console.error`, `console.info` allowed
- Unused variables starting with `_` are allowed
- No shadowing variables
- Functional patterns preferred where possible

## Router Configuration

- All routes must be defined in `src/modules/core/constants/routes.url.ts`
- Use route constants instead of string literals
- Routes are functions that return the path

Example:
```typescript
import { ROUTER_URL } from '@/core'

// Usage
<Link href={ROUTER_URL.EDITOR()}>Editor</Link>
<Link href={ROUTER_URL.EMBED('map-id')}>Embed</Link>
```

## Key Dependencies

- **Framework**: Next.js 16
- **React**: 19
- **TypeScript**: 5.x
- **Canvas**: Konva.js 9 + react-konva 19
- **State Management**: Zustand 4
- **Gestures**: @use-gesture/react 10
- **Styling**: Sass (CSS Modules)
- **Validation**: Zod 3
- **Testing**: Cypress 15 (E2E)
- **Linting**: ESLint 9 (flat config, `eslint.config.mjs`)
- **Formatting**: Prettier 3
- **Git Hooks**: Husky 9 + Commitlint

## Git Workflow

- **Husky**: Pre-commit hooks enabled (lint + type-check)
- **Commitlint**: Conventional commits enforced
- **Main branch**: `main`

## Common Patterns

### Index Exports
- Each folder exports all its contents via `index.ts`
- Import from folder, not individual files
- Cleaner imports: `import { Canvas } from '@/modules/seatmap-renderer'`

### State Management
- **Zustand** for editor state (with undo/redo history)
- **React hooks** for embed state (useSelection, usePostMessage)

### Canvas Rendering
- All coordinates stored as normalized (0-1 range)
- Konva.js for 2D canvas rendering
- Components: Canvas > Background + Zones + Seats (layered)

### API Communication
- REST API at `NEXT_PUBLIC_API_URL` (default: `http://localhost:3001`)
- Standard response format: `{ success, data, meta }`
- Embed uses postMessage for iframe communication

## Security Considerations

- API keys should never be hardcoded
- Use environment variables for sensitive data
- Embed pages allow framing (X-Frame-Options: ALLOWALL)

## Performance

- Use `useCallback` and `useMemo` appropriately
- Optimize re-renders
- Lazy load Konva components with `next/dynamic` (SSR disabled)
- Limit history to 50 entries for undo/redo

## Accessibility

- jsx-a11y rules enforced
- Follow WCAG 2.1 AA guidelines
- Keyboard navigation for seat selection in embed mode
- ARIA labels for seats

## Testing

### Cypress E2E Tests
- Config: `cypress.config.ts` (base URL: `http://localhost:3000`)
- Specs: `cypress/e2e/*.cy.ts`
- Fixtures: `cypress/fixtures/`
- Custom commands: `cypress/support/commands.ts`
- Separate `cypress/tsconfig.json` to avoid conflicts with main tsconfig

### Test Suites (38 total)
| Spec | Tests | Description |
|------|-------|-------------|
| `home.cy.ts` | 5 | Home page rendering, navigation, meta |
| `editor.cy.ts` | 23 | Toolbar, tools, canvas, grid generator, export/import, undo/redo, keyboard shortcuts |
| `embed.cy.ts` | 10 | Loading/error states, canvas rendering, API mocking, edit page flow |

### Running Tests
```bash
npm run cypress:run   # Headless (CI)
npm run cypress:open  # Interactive runner
```

### Important Notes
- **Dev server must be running** (`npm run dev`) before running Cypress tests
- Konva canvas components load via `next/dynamic` with SSR disabled; tests use `cy.get('.konvajs-content', { timeout: 15000 })` to wait for canvas render
- For controlled `type="number"` inputs, use `cy.get(selector).type('{selectall}value')` instead of `.clear().type()` to reliably replace values

## Additional Notes

- **No cd commands**: When running terminal commands, specify `cwd` instead of using `cd`
- **npm only**: Do not use yarn commands
- **TypeScript strict mode**: Currently disabled, but avoid `any` types
- **Console usage**: Limited to warn, error, and info
- **File organization**: Each folder should have its own index for cleaner imports
- **Konva SSR**: Always use `next/dynamic` with `{ ssr: false }` for Konva components

## Path Aliases

- `@/core` -> `src/modules/core/index`
- `@/modules/*` -> `src/modules/*`
- `@/styles/*` -> `src/modules/core/styles/*`
