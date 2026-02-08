# 🔧 Seatmap Builder - Backend Plan

Technical Plan v1 - API & Infrastructure

------------------------------------------------------------------------

## 1. 🎯 Scope

This document covers the **backend infrastructure**, including:

- **REST API**: CRUD operations for seat maps
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: S3-compatible for background images
- **Docker**: Containerization for deployment
- **CI/CD**: Automated deployment pipeline

------------------------------------------------------------------------

## 2. 🏗 Architecture

```
backend/
│
├── src/
│   ├── modules/
│   │   ├── maps/
│   │   │   ├── maps.controller.ts
│   │   │   ├── maps.service.ts
│   │   │   ├── maps.repository.ts
│   │   │   ├── maps.schema.ts
│   │   │   └── dto/
│   │   │       ├── create-map.dto.ts
│   │   │       ├── update-map.dto.ts
│   │   │       └── map-response.dto.ts
│   │   │
│   │   ├── storage/
│   │   │   ├── storage.service.ts
│   │   │   └── storage.config.ts
│   │   │
│   │   └── health/
│   │       └── health.controller.ts
│   │
│   ├── common/
│   │   ├── middleware/
│   │   │   ├── cors.middleware.ts
│   │   │   ├── logger.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── guards/
│   │   │   └── api-key.guard.ts
│   │   └── utils/
│   │       └── response.util.ts
│   │
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── storage.config.ts
│   │   └── app.config.ts
│   │
│   └── main.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── docker-compose.yml
│
├── .env.example
├── package.json
└── tsconfig.json
```

------------------------------------------------------------------------

## 3. 🧠 Technology Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js 20 LTS |
| Framework | Fastify (or Express) |
| Language | TypeScript |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Storage | S3 / MinIO (local) |
| Validation | Zod |
| Container | Docker |
| Orchestration | Docker Compose |

------------------------------------------------------------------------

## 4. 📦 Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model SeatMap {
  id          String   @id @default(uuid())
  name        String
  version     String   @default("1.0")
  data        Json     // Full seat map JSON
  backgroundUrl String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime? // Soft delete
  
  @@index([createdAt])
  @@index([name])
}

model ApiKey {
  id          String   @id @default(uuid())
  key         String   @unique
  name        String
  permissions String[] @default(["read"])
  createdAt   DateTime @default(now())
  expiresAt   DateTime?
  isActive    Boolean  @default(true)
  
  @@index([key])
}
```

------------------------------------------------------------------------

## 5. 🔌 API Endpoints

### Maps

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/maps` | List all maps | API Key |
| GET | `/api/maps/:id` | Get map by ID | Public |
| POST | `/api/maps` | Create new map | API Key |
| PUT | `/api/maps/:id` | Update map | API Key |
| DELETE | `/api/maps/:id` | Soft delete map | API Key |
| PATCH | `/api/maps/:id/seats` | Bulk update seats | API Key |
| POST | `/api/maps/:id/duplicate` | Duplicate map | API Key |
| GET | `/api/maps/:id/export` | Export as JSON file | API Key |

### Storage

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/upload` | Upload background image | API Key |
| DELETE | `/api/upload/:key` | Delete image | API Key |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/health/ready` | Readiness probe |

------------------------------------------------------------------------

## 6. 📋 API Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "MAP_NOT_FOUND",
    "message": "Seat map with ID 'abc123' not found",
    "details": {}
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Pagination

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

------------------------------------------------------------------------

## 7. 🐳 Docker Configuration

### Dockerfile (Production)

```dockerfile
# docker/Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build
RUN npx prisma generate

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 api

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

USER api

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
```

### Docker Compose (Development)

```yaml
# docker/docker-compose.yml

version: '3.8'

services:
  api:
    build:
      context: ..
      dockerfile: docker/Dockerfile.dev
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/seatmap
      - S3_ENDPOINT=http://minio:9000
      - S3_ACCESS_KEY=minioadmin
      - S3_SECRET_KEY=minioadmin
      - S3_BUCKET=seatmap-backgrounds
    depends_on:
      db:
        condition: service_healthy
      minio:
        condition: service_started
    volumes:
      - ../src:/app/src
      - ../prisma:/app/prisma

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: seatmap
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

  # Create default bucket
  minio-setup:
    image: minio/mc
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      sleep 5;
      mc alias set myminio http://minio:9000 minioadmin minioadmin;
      mc mb myminio/seatmap-backgrounds --ignore-existing;
      mc anonymous set public myminio/seatmap-backgrounds;
      exit 0;
      "

volumes:
  postgres_data:
  minio_data:
```

------------------------------------------------------------------------

## 8. 🔐 Environment Variables

```bash
# .env.example

# App
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/seatmap

# Storage (S3)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=seatmap-backgrounds
S3_REGION=us-east-1

# Security
API_KEY_SALT=your-random-salt
CORS_ORIGINS=http://localhost:3000

# Optional: External S3 (production)
# S3_ENDPOINT=https://s3.amazonaws.com
# S3_ACCESS_KEY=your-access-key
# S3_SECRET_KEY=your-secret-key
```

------------------------------------------------------------------------

## 9. 📈 Development Roadmap

### Sprint 1 - Foundation

- [ ] Project setup (Fastify + TypeScript)
- [ ] Docker Compose configuration
- [ ] PostgreSQL + MinIO containers
- [ ] Prisma schema + initial migration
- [ ] Health endpoints
- [ ] Basic CORS middleware

### Sprint 2 - Core API

- [ ] Maps CRUD endpoints
- [ ] Zod validation schemas
- [ ] Error handling middleware
- [ ] API key authentication guard
- [ ] Upload endpoint (S3)
- [ ] Response formatting utils

### Sprint 3 - Advanced Features

- [ ] Bulk seat update endpoint
- [ ] Duplicate map endpoint
- [ ] Export endpoint
- [ ] Pagination
- [ ] Soft delete support
- [ ] Request logging

### Sprint 4 - Production Ready

- [ ] Production Dockerfile
- [ ] Environment validation
- [ ] Rate limiting
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Database seeding script

------------------------------------------------------------------------

## 10. ⚠️ Technical Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Large JSON payloads | Limit map size, compress responses |
| S3 availability | Fallback to local storage in dev |
| Database bottleneck | Connection pooling, query optimization |
| API abuse | Rate limiting, API key quotas |
| Data loss | Soft deletes, daily backups |
| Schema migrations | Prisma migrations with rollback |

------------------------------------------------------------------------

## 11. 🔒 Security Considerations

### API Key Authentication

```ts
// Simple API key validation
const validateApiKey = async (key: string): Promise<boolean> => {
  const apiKey = await prisma.apiKey.findUnique({
    where: { key, isActive: true }
  })
  
  if (!apiKey) return false
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return false
  
  return true
}
```

### CORS Configuration

```ts
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}
```

### Input Validation (Zod)

```ts
const createMapSchema = z.object({
  name: z.string().min(1).max(255),
  background: z.object({
    url: z.string().url(),
    width: z.number().positive(),
    height: z.number().positive()
  }),
  seats: z.array(seatSchema).max(5000),
  zones: z.array(zoneSchema).optional()
})
```

------------------------------------------------------------------------

## 12. 📚 Dependencies

```json
{
  "dependencies": {
    "fastify": "^4.26.0",
    "@fastify/cors": "^9.0.0",
    "@fastify/multipart": "^8.1.0",
    "@prisma/client": "^5.10.0",
    "@aws-sdk/client-s3": "^3.500.0",
    "zod": "^3.23.0",
    "dotenv": "^16.4.0",
    "pino": "^8.19.0"
  },
  "devDependencies": {
    "prisma": "^5.10.0",
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.7.0",
    "vitest": "^1.3.0"
  }
}
```

------------------------------------------------------------------------

## 13. 🚀 Deployment

### Development

```bash
# Start all services
docker compose -f docker/docker-compose.yml up -d

# Run migrations
npx prisma migrate dev

# Start API in dev mode
npm run dev
```

### Production

```bash
# Build production image
docker build -f docker/Dockerfile -t seatmap-api:latest .

# Run with external DB
docker run -d \
  -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e S3_ENDPOINT="https://s3.amazonaws.com" \
  seatmap-api:latest
```

------------------------------------------------------------------------

## 14. 🎯 MVP Checklist

- [ ] Docker Compose working locally
- [ ] PostgreSQL + MinIO running
- [ ] Maps CRUD endpoints
- [ ] Image upload to S3
- [ ] API key authentication
- [ ] Health check endpoint
- [ ] Basic error handling
- [ ] CORS configured

