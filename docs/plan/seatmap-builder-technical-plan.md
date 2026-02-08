# 🪑 Seatmap Builder & Embeddable Widget

Technical Plan v2 - Overview

------------------------------------------------------------------------

## 📋 Plan Structure

This project is divided into two main technical plans:

| Document | Scope |
|----------|-------|
| [Frontend Plan](./frontend-plan.md) | Web Editor + Embed Renderer |
| [Backend Plan](./backend-plan.md) | API + Docker + Database |

------------------------------------------------------------------------

## 1. 🎯 Project Goal

Build a system composed of two main parts:

### 1️⃣ Web Editor
- Upload a floor plan image (drag & drop)
- Manually place seats on top of it
- Generate seat grids automatically
- Export a structured JSON schema
- Undo/Redo support

### 2️⃣ Embeddable Renderer
- Insertable via `iframe`
- Renders background + seats
- Fully clickable with keyboard navigation
- Bidirectional communication with host website
- Accessible (WCAG 2.1 compliant)

### 3️⃣ Backend API (Dockerized)
- REST API for CRUD operations
- PostgreSQL database
- S3-compatible storage for images
- API key authentication

------------------------------------------------------------------------

## 2. 🏗 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │     Editor      │    │      Embed      │                     │
│  │  (Admin Tool)   │    │   (Public View) │                     │
│  └────────┬────────┘    └────────┬────────┘                     │
│           │                      │                               │
│           └──────────┬───────────┘                               │
│                      │                                           │
│           ┌──────────▼──────────┐                               │
│           │  Seatmap Renderer   │  (Konva.js)                   │
│           └──────────┬──────────┘                               │
└──────────────────────┼──────────────────────────────────────────┘
                       │
                       │ HTTP/REST
                       │
┌──────────────────────┼──────────────────────────────────────────┐
│                      │        BACKEND (Docker)                   │
│           ┌──────────▼──────────┐                               │
│           │     REST API        │  (Fastify + TypeScript)       │
│           └──────────┬──────────┘                               │
│                      │                                           │
│      ┌───────────────┼───────────────┐                          │
│      │               │               │                          │
│  ┌───▼───┐     ┌─────▼─────┐   ┌─────▼─────┐                   │
│  │ PostgreSQL │ │   MinIO    │   │  Redis*   │                   │
│  │ (Maps DB)  │ │  (Images)  │   │ (Cache)   │                   │
│  └───────────┘ └───────────┘   └───────────┘                   │
│                                                                  │
│  * Redis optional for caching/sessions                          │
└──────────────────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

## 3. 🧠 Technology Stack

### Frontend
| Category | Technology |
|----------|------------|
| Framework | Next.js 16 |
| Language | TypeScript |
| Canvas | Konva.js 9 + react-konva 19 |
| State | Zustand |
| Styling | Sass + CSS Modules |

### Backend
| Category | Technology |
|----------|------------|
| Runtime | Node.js 20 LTS |
| Framework | Fastify |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Storage | S3 / MinIO |
| Container | Docker + Docker Compose |

------------------------------------------------------------------------

## 4. 📦 Shared Data Model

```ts
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
  }
  seats: Seat[]
  zones?: Zone[]
  settings?: SeatMapSettings
}

export interface Seat {
  id: string
  label: string
  x: number          // Normalized 0-1
  y: number          // Normalized 0-1
  w: number
  h: number
  r?: number
  zoneId?: string
  status?: "available" | "reserved" | "sold" | "blocked"
  metadata?: Record<string, unknown>
}
```

See detailed schemas in [Frontend Plan](./frontend-plan.md#4--data-model).

------------------------------------------------------------------------

## 5. 📈 Combined Roadmap

### Phase 1: Foundation
| Frontend | Backend |
|----------|---------|
| ~~Project setup~~ | Docker Compose setup |
| ~~Module structure~~ | PostgreSQL + MinIO |
| ~~Konva basic setup~~ | Prisma schema |
| ~~Responsive canvas~~ | Health endpoints |

### Phase 2: Core Features
| Frontend | Backend |
|----------|---------|
| ~~Editor tools (add/move/delete)~~ | Maps CRUD API |
| ~~Grid generator~~ | Image upload endpoint |
| ~~JSON export/import~~ | API key auth |
| ~~Undo/Redo~~ | Validation |

### Phase 2.5: Background & Seat Size
| Frontend | Backend |
|----------|---------|
| Background upload button + remove | - |
| Background aspect ratio rendering | - |
| Configurable seat dimensions (w/h) | - |
| Global default seat size setting | - |
| Seat aspect ratio distortion fix | - |

### Phase 3: Embed & Polish
| Frontend | Backend |
|----------|---------|
| ~~Embed renderer~~ | Bulk operations |
| ~~postMessage protocol~~ | Rate limiting |
| Keyboard navigation | API docs |
| ~~E2E tests~~ | Production Docker |

### Phase 4: Production Ready
| Frontend | Backend |
|----------|---------|
| Performance optimization | Deployment config |
| Error handling | Monitoring setup |
| Cross-browser testing | Backup strategy |

------------------------------------------------------------------------

## 6. 🎯 MVP Definition

### Frontend MVP
- ✅ Editor: Upload, add/move/delete seats, grid generator
- ✅ Editor: JSON export/import, undo/redo
- ✅ Embed: Render map, click selection, postMessage

### Backend MVP
- ✅ Docker Compose local environment
- ✅ Maps CRUD API
- ✅ Image upload to S3/MinIO
- ✅ API key authentication

------------------------------------------------------------------------

## 7. 📚 Detailed Plans

For implementation details, see:

- **[Frontend Plan](./frontend-plan.md)**: Editor features, Embed protocol, Konva setup, testing
- **[Backend Plan](./backend-plan.md)**: API endpoints, Docker config, database schema, security
