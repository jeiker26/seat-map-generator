# 🖥️ Seatmap Builder - Frontend Plan

Technical Plan v1 - Web Application & Editor

------------------------------------------------------------------------

## 1. 🎯 Scope

This document covers the **frontend application**, including:

- **Editor**: Admin interface for creating and editing seat maps
- **Embed**: Public embeddable renderer (iframe)
- **Shared Renderer**: Konva-based rendering engine

------------------------------------------------------------------------

## 2. 🏗 Architecture

```
src/
│
├── modules/
│   ├── editor/              → Feature module (map creation)
│   │   ├── components/
│   │   │   ├── Editor/
│   │   │   ├── Toolbar/
│   │   │   ├── GridGenerator/
│   │   │   └── SeatProperties/
│   │   ├── hooks/
│   │   │   ├── useEditorState.ts
│   │   │   ├── useUndoRedo.ts
│   │   │   └── useKeyboardShortcuts.ts
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── embed/               → Feature module (public renderer)
│   │   ├── components/
│   │   │   ├── EmbedRenderer/
│   │   │   └── SeatTooltip/
│   │   ├── hooks/
│   │   │   ├── usePostMessage.ts
│   │   │   └── useSelection.ts
│   │   └── index.ts
│   │
│   ├── seatmap-renderer/    → Shared Konva rendering engine
│   │   ├── components/
│   │   │   ├── Canvas/
│   │   │   ├── Seat/
│   │   │   ├── Zone/
│   │   │   └── Background/
│   │   ├── hooks/
│   │   │   ├── useZoomPan.ts
│   │   │   └── useCoordinates.ts
│   │   ├── utils/
│   │   │   ├── coordinates.ts
│   │   │   └── rendering.ts
│   │   └── index.ts
│   │
│   └── core/                → Data model + shared utilities
│       ├── types/
│       │   ├── seatmap.types.ts
│       │   └── events.types.ts
│       ├── utils/
│       │   ├── schema.ts
│       │   └── validation.ts
│       └── index.ts
│
├── pages/
│   ├── index.tsx            → Landing / Dashboard
│   ├── editor/
│   │   ├── index.tsx        → New map
│   │   └── [id].tsx         → Edit existing map
│   └── embed/
│       └── [id].tsx         → Public embed renderer
│
└── styles/
    └── globals.scss
```

------------------------------------------------------------------------

## 3. 🧠 Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 |
| Language | TypeScript |
| Canvas | Konva.js + react-konva |
| State | Zustand |
| Gestures | @use-gesture/react |
| Styling | Sass + CSS Modules |
| Validation | Zod |
| Testing | Cypress |

------------------------------------------------------------------------

## 4. 📦 Data Model

```ts
// src/modules/core/types/seatmap.types.ts

export interface SeatMap {
  id: string
  version: "1.0"
  name: string
  createdAt: string
  updatedAt: string
  background: {
    url: string
    width: number
    height: number
    aspectRatio?: number
  }
  seats: Seat[]
  zones?: Zone[]
  settings?: SeatMapSettings
}

export interface SeatMapSettings {
  allowMultiSelect: boolean
  maxSelectable?: number
  showLabels: boolean
  theme?: 'light' | 'dark'
}

export interface Seat {
  id: string
  label: string
  x: number          // Normalized 0-1
  y: number          // Normalized 0-1
  w: number          // Normalized width
  h: number          // Normalized height
  r?: number         // Rotation degrees
  zoneId?: string
  status?: SeatStatus
  metadata?: Record<string, unknown>
}

export type SeatStatus = "available" | "reserved" | "sold" | "blocked"

export interface Zone {
  id: string
  name: string
  color: string
  price?: number
}
```

------------------------------------------------------------------------

## 5. ✏️ Editor Features

### MVP Scope

- [x] Upload background image (drag & drop)
- [x] Zoom / Pan (mouse wheel + drag)
- [x] Add seat by click
- [x] Move / Delete seat
- [x] Grid generator tool
- [x] Auto numbering (row/column patterns)
- [x] Export JSON
- [x] Import JSON
- [x] Undo / Redo (Ctrl+Z / Ctrl+Shift+Z)
- [x] Keyboard shortcuts

### MVP Improvements (Next Sprint)

#### Background Image Enhancements
- [ ] Upload button in Toolbar (file picker, in addition to drag-and-drop)
- [ ] Remove background button (clear current image)
- [ ] Preserve aspect ratio when rendering (use `fitToContainer()` utility)
- [ ] File size validation (max 10MB) with user feedback
- [ ] Error feedback when image fails to load
- [ ] Fix Zod schema: allow empty string for `background.url` (no image state)

#### Default Seat Size & Dimensions
- [ ] Use `DEFAULT_SEAT_SIZE` constant instead of hardcoded `0.02` in Editor and GridGenerator
- [ ] Add w/h fields to SeatProperties panel (editable seat dimensions)
- [ ] Add seat size controls in GridGenerator (configure size of generated seats)
- [ ] Global default seat size setting in `SeatMapSettings` (persisted per map)
- [ ] Fix aspect ratio distortion: normalize seat dimensions relative to the shortest container axis so seats render as squares when w === h
- [ ] Minimum font size floor for seat labels (prevent unreadable text below 8px)

### Phase 2

- [ ] Multi-selection (Shift+click, drag select)
- [ ] Snap-to-grid alignment
- [ ] Zones with color coding
- [ ] Block rotation
- [ ] Auto-save (debounced)
- [ ] Bulk edit (status, zone, metadata)
- [ ] Copy/Paste seats
- [ ] Seat templates

### Editor State Management (Zustand)

```ts
// src/modules/editor/hooks/useEditorState.ts

interface EditorState {
  // Data
  seatMap: SeatMap | null
  selectedSeats: string[]
  
  // Tools
  activeTool: 'select' | 'add' | 'pan' | 'grid'
  
  // History
  history: SeatMap[]
  historyIndex: number
  
  // Actions
  setSeatMap: (map: SeatMap) => void
  addSeat: (seat: Seat) => void
  updateSeat: (id: string, updates: Partial<Seat>) => void
  deleteSeat: (id: string) => void
  undo: () => void
  redo: () => void
}
```

------------------------------------------------------------------------

## 6. 🎛 Embeddable Renderer

### Integration Example

```html
<iframe
  src="https://your-domain.com/embed/abc123"
  style="width:100%;height:600px;border:0;"
  loading="lazy"
></iframe>
```

### Communication Protocol

#### Embed → Host Events

```ts
// src/modules/core/types/events.types.ts

export type EmbedEvent = 
  | { type: "seatmap:ready" }
  | { type: "seatmap:selected"; payload: { seats: Seat[] } }
  | { type: "seatmap:deselected"; payload: { seatId: string } }
  | { type: "seatmap:error"; payload: { code: string; message: string } }
```

#### Host → Embed Commands

```ts
export type HostCommand =
  | { type: "seatmap:setStatus"; payload: { seatId: string; status: SeatStatus }[] }
  | { type: "seatmap:clearSelection" }
  | { type: "seatmap:selectSeats"; payload: { seatIds: string[] } }
  | { type: "seatmap:setTheme"; payload: { theme: 'light' | 'dark' } }
```

------------------------------------------------------------------------

## 7. 🔄 Rendering Flow

```
1. Fetch seat map JSON from API
2. Load background image (with skeleton)
3. Calculate canvas dimensions (container fit)
4. Convert normalized coordinates → pixels
5. Render layers:
   └─ Background (image)
   └─ Zones (if enabled)
   └─ Seats (shapes with status colors)
6. Register event handlers (click, hover, keyboard)
7. Emit "seatmap:ready" event
```

------------------------------------------------------------------------

## 8. 📈 Development Roadmap

### Sprint 1 - Core Foundation

- [x] Project setup (Next.js + TypeScript + Sass)
- [x] Module structure creation
- [x] Data model + TypeScript types
- [x] Zod schemas for validation
- [x] Konva basic setup
- [x] Responsive canvas component
- [x] Basic zoom/pan functionality
- [x] Coordinate transformation utils

### Sprint 2 - Functional Editor

- [x] Background image upload (drag & drop)
- [x] Toolbar component
- [x] Add seat by click
- [x] Move seat (drag)
- [x] Delete seat (keyboard + button)
- [x] Grid generator modal
- [x] Auto numbering logic
- [x] JSON export / import
- [x] Zustand store setup
- [x] Undo / Redo stack
- [x] Keyboard shortcuts

### Sprint 2.5 - Background & Seat Size Improvements

- [ ] Toolbar: Upload background button (file picker)
- [ ] Toolbar: Remove background button
- [ ] Background rendering: preserve aspect ratio via `fitToContainer()`
- [ ] Background upload: file size validation (max 10MB) + error feedback
- [ ] Background load error: user-facing error message
- [ ] Fix Zod schema: `background.url` allow empty string (no image state)
- [ ] Refactor: use `DEFAULT_SEAT_SIZE` constant in Editor + GridGenerator
- [ ] SeatProperties: add editable width/height fields
- [ ] GridGenerator: add seat size inputs (width/height for generated seats)
- [ ] SeatMapSettings: add `defaultSeatSize` field (global per-map default)
- [ ] Fix seat aspect ratio distortion (uniform normalization)
- [ ] Seat label: minimum font size floor (8px)

### Sprint 3 - Stable Embed

- [x] Embed page route
- [x] Renderer component
- [x] postMessage hook
- [x] Responsive scaling
- [x] Click handlers
- [x] Hover tooltips
- [ ] Keyboard navigation (a11y)
- [ ] Theme support (light/dark)

### Sprint 4 - Polish

- [ ] Error boundaries
- [ ] Loading states / skeletons
- [ ] Empty states
- [ ] Responsive design
- [ ] Cross-browser testing

------------------------------------------------------------------------

## 9. 🧪 Testing Strategy

### Unit Tests

- Coordinate transformations
- Schema validation (Zod)
- Zustand store actions
- Utility functions

### E2E Tests (Cypress) - 38 tests, all passing

| Spec | Tests | Coverage |
|------|-------|----------|
| `home.cy.ts` | 5 | Page rendering, navigation, meta |
| `editor.cy.ts` | 23 | Toolbar, tools, canvas, grid generator, export/import, undo/redo, keyboard shortcuts |
| `embed.cy.ts` | 10 | Loading/error states, canvas rendering, API mocking, edit page flow |

### Visual Regression

- Canvas snapshots
- Responsive breakpoints
- Theme variations

------------------------------------------------------------------------

## 10. ♿ Accessibility (a11y)

### Keyboard Navigation (Embed)

| Key | Action |
|-----|--------|
| Tab | Navigate between seats |
| Arrow keys | Spatial navigation |
| Enter / Space | Select/deselect seat |
| Escape | Clear selection |

### Screen Reader Support

- ARIA labels: `aria-label="Seat A1, Row A, Available"`
- Live regions for selection changes
- Role announcements

### Visual

- Focus indicators visible
- WCAG 2.1 AA contrast
- Color-blind friendly status colors
- 200%+ zoom support

------------------------------------------------------------------------

## 11. 📚 Dependencies

```json
{
  "dependencies": {
    "next": "^16.1.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "konva": "^9.0.0",
    "react-konva": "^19.2.2",
    "zustand": "^4.5.0",
    "@use-gesture/react": "^10.3.0",
    "zod": "^3.23.0",
    "sass": "^1.77.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "cypress": "^15.10.0",
    "eslint": "^9.39.0",
    "eslint-config-next": "^16.1.6",
    "@types/react": "^19.0.0",
    "@types/node": "^20.0.0"
  }
}
```

------------------------------------------------------------------------

## 12. 🎯 MVP Checklist

- [x] Editor: Upload background (drag & drop)
- [ ] Editor: Upload background (file picker button)
- [ ] Editor: Remove background
- [ ] Editor: Background respects aspect ratio
- [x] Editor: Add/move/delete seats
- [x] Editor: Grid generator
- [ ] Editor: Configurable seat size (SeatProperties + GridGenerator)
- [ ] Editor: Global default seat size setting
- [x] Editor: JSON export/import
- [x] Editor: Undo/Redo
- [x] Embed: Render map from API
- [x] Embed: Click selection
- [x] Embed: postMessage events
- [ ] Responsive on all devices
- [ ] Basic keyboard navigation

