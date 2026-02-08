# Seat Map Generator

Interactive seat map builder and embeddable widget for venues, theaters, stadiums, and event spaces.

## Overview

This project provides two main interfaces:

- **Editor** (`/editor`) - Admin tool for creating and editing seat maps on a Konva.js canvas. Supports placing individual seats, bulk grid generation, drag-and-drop background images, undo/redo, keyboard shortcuts, and JSON export/import.
- **Embed** (`/embed/:id`) - Public embeddable renderer designed to be inserted via `<iframe>`. Renders seat maps with click selection, hover tooltips, and bidirectional `postMessage` communication with the host page.

Both interfaces share a common **Seatmap Renderer** module built on Konva.js that handles canvas rendering, zoom/pan, and coordinate transformations.

## Tech Stack

| Category         | Technology                          |
| ---------------- | ----------------------------------- |
| Framework        | Next.js 16 (Pages Router)          |
| UI               | React 19                            |
| Language         | TypeScript 5                        |
| Canvas           | Konva.js 9 + react-konva 19        |
| State Management | Zustand 4                           |
| Styling          | Sass (CSS Modules, BEM)            |
| Validation       | Zod 3                               |
| Testing          | Cypress 15 (E2E)                    |
| Linting          | ESLint 9 (flat config)             |
| Formatting       | Prettier 3                          |
| Git Hooks        | Husky 9 + Commitlint               |

## Prerequisites

- **Node.js** >= 20.8.1 (recommended: 20.12.0+)
- **npm** >= 10.9.0

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## Scripts

| Script              | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start development server (Turbopack)     |
| `npm run build`     | Production build                         |
| `npm start`         | Start production server                  |
| `npm run lint`      | Run ESLint                               |
| `npm run lint:fix`  | Run ESLint with auto-fix                 |
| `npm run format`    | Format code with Prettier                |
| `npm run type-check`| TypeScript type checking                 |
| `npm run cypress:open` | Open Cypress test runner (interactive) |
| `npm run cypress:run`  | Run Cypress tests (headless)           |

## Project Structure

```
src/
├── modules/
│   ├── core/                  # Shared types, utilities, constants, services
│   │   ├── constants/         # Route definitions, seatmap constants
│   │   ├── services/          # API service, maps service
│   │   ├── styles/            # Global Sass styles and variables
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Coordinate transforms, validation, Zod schemas
│   ├── editor/                # Map creation/editing interface
│   │   ├── components/        # Editor, Toolbar, GridGenerator, SeatProperties
│   │   ├── hooks/             # useEditorState (Zustand), useUndoRedo, useKeyboardShortcuts
│   │   └── services/          # Editor-specific operations
│   ├── embed/                 # Public embeddable renderer
│   │   ├── components/        # EmbedRenderer, SeatTooltip
│   │   └── hooks/             # usePostMessage, useSelection
│   └── seatmap-renderer/      # Shared Konva.js rendering engine
│       ├── components/        # Canvas, Seat, Zone, Background
│       ├── hooks/             # useZoomPan, useCoordinates
│       └── utils/             # Coordinate math, rendering helpers
├── pages/                     # Next.js pages (routing)
│   ├── index.tsx              # Home / Dashboard
│   ├── editor/
│   │   ├── index.tsx          # New map editor
│   │   └── [id].tsx           # Edit existing map
│   └── embed/
│       └── [id].tsx           # Public embed renderer
└── types/                     # Global type declarations

cypress/
├── e2e/                       # E2E test specs
│   ├── home.cy.ts             # Home page tests (5 tests)
│   ├── editor.cy.ts           # Editor tests (23 tests)
│   └── embed.cy.ts            # Embed tests (10 tests)
├── fixtures/                  # Test data
└── support/                   # Custom commands and setup
```

## Routes

| Route           | Description                     |
| --------------- | ------------------------------- |
| `/`             | Home page with CTA to editor    |
| `/editor`       | Create a new seat map           |
| `/editor/:id`   | Edit an existing seat map       |
| `/embed/:id`    | Public embeddable renderer      |

## Editor Features

- **Tools**: Select, Add Seat, Pan, Grid Generator
- **Canvas**: Zoom/pan with mouse wheel and drag, background image support
- **Grid Generator**: Bulk seat placement with configurable rows, columns, spacing, and row labeling
- **Seat Properties**: Edit label, position, size, rotation, status, and zone assignment
- **History**: Undo/Redo with 50-entry limit (Ctrl+Z / Ctrl+Shift+Z)
- **Persistence**: JSON export/import for seat map data
- **Keyboard Shortcuts**: S (Select), A (Add Seat), P (Pan), G (Grid), Delete (Remove seat)

## Embed Integration

```html
<iframe
  src="https://your-domain.com/embed/map-id"
  style="width: 100%; height: 600px; border: 0;"
  loading="lazy"
></iframe>
```

The embed communicates with the host page via `postMessage`:

```js
// Listen for seat selection events
window.addEventListener('message', (event) => {
  if (event.data.type === 'seatmap:selected') {
    console.log('Selected seats:', event.data.payload.seats)
  }
})

// Send commands to the embed
iframe.contentWindow.postMessage(
  { type: 'seatmap:clearSelection' },
  '*'
)
```

## Testing

The project uses Cypress for E2E testing. All 38 tests pass:

```
Spec                    Tests  Passing
editor.cy.ts              23       23
embed.cy.ts               10       10
home.cy.ts                 5        5
Total                     38       38
```

```bash
# Run tests headless
npm run cypress:run

# Open interactive test runner
npm run cypress:open
```

## Environment Variables

| Variable              | Description                | Default                   |
| --------------------- | -------------------------- | ------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL       | `http://localhost:3001`   |

## Backend

The backend is a separate service (Fastify + PostgreSQL + S3/MinIO). See `docs/plan/backend-plan.md` for details.

## Documentation

- `docs/plan/frontend-plan.md` - Frontend technical plan and roadmap
- `docs/plan/backend-plan.md` - Backend technical plan
- `docs/plan/seatmap-builder-technical-plan.md` - Overall architecture
- `docs/decisions-sprint-1.md` - Architecture decisions and rationale

## License

See [LICENSE](./LICENSE) for details.
