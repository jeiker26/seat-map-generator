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
| Framework | Next.js 15 |
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

- [ ] Upload background image (drag & drop)
- [ ] Zoom / Pan (mouse wheel + drag)
- [ ] Add seat by click
- [ ] Move / Delete seat
- [ ] Grid generator tool
- [ ] Auto numbering (row/column patterns)
- [ ] Export JSON
- [ ] Import JSON
- [ ] Undo / Redo (Ctrl+Z / Ctrl+Shift+Z)
- [ ] Keyboard shortcuts

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

- [ ] Project setup (Next.js + TypeScript + Sass)
- [ ] Module structure creation
- [ ] Data model + TypeScript types
- [ ] Zod schemas for validation
- [ ] Konva basic setup
- [ ] Responsive canvas component
- [ ] Basic zoom/pan functionality
- [ ] Coordinate transformation utils

### Sprint 2 - Functional Editor

- [ ] Background image upload (drag & drop)
- [ ] Toolbar component
- [ ] Add seat by click
- [ ] Move seat (drag)
- [ ] Delete seat (keyboard + button)
- [ ] Grid generator modal
- [ ] Auto numbering logic
- [ ] JSON export / import
- [ ] Zustand store setup
- [ ] Undo / Redo stack
- [ ] Keyboard shortcuts

### Sprint 3 - Stable Embed

- [ ] Embed page route
- [ ] Renderer component
- [ ] postMessage hook
- [ ] Responsive scaling
- [ ] Click handlers
- [ ] Hover tooltips
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

### E2E Tests (Cypress)

- **Editor**: Upload → Add seats → Grid → Export
- **Embed**: Load → Select → Verify events
- **iframe**: Bidirectional communication

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
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "konva": "^9.0.0",
    "react-konva": "^18.0.0",
    "zustand": "^4.5.0",
    "@use-gesture/react": "^10.3.0",
    "zod": "^3.23.0",
    "sass": "^1.77.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "cypress": "^13.0.0",
    "@types/react": "^18.3.0",
    "@types/node": "^20.0.0"
  }
}
```

------------------------------------------------------------------------

## 12. 🎯 MVP Checklist

- [ ] Editor: Upload background
- [ ] Editor: Add/move/delete seats
- [ ] Editor: Grid generator
- [ ] Editor: JSON export/import
- [ ] Editor: Undo/Redo
- [ ] Embed: Render map from API
- [ ] Embed: Click selection
- [ ] Embed: postMessage events
- [ ] Responsive on all devices
- [ ] Basic keyboard navigation

