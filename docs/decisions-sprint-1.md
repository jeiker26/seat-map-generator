# Decisions & Open Questions - Sprint 1 Frontend Implementation

## Decisions Made

### 1. Removed GraphQL / Apollo Client
**Decision**: Used REST API with native `fetch` instead of Apollo Client + GraphQL.
**Rationale**: The backend plan (`docs/plan/backend-plan.md`) explicitly defines a Fastify REST API, not a GraphQL server. The AGENTS.md reference to Apollo Client was a template artifact from a different project. The REST approach aligns with the actual backend architecture.

### 2. Removed Unused Template Dependencies
**Decision**: Did NOT include React Hook Form, Luxon, Moment, Validator, Styled Components, DataDog, DOMPurify, or react-i18next.
**Rationale**: None of these appear in the `frontend-plan.md`. They were carried over from a different project's AGENTS.md. If i18n or form management becomes necessary in Sprint 2+, these can be added then.

### 3. Sass CSS Modules (not plain Sass)
**Decision**: Used `*.module.scss` (CSS Modules) for all component styles.
**Rationale**: The original AGENTS.md said "Use Sass (not CSS modules)" but `docs/scss.md` explicitly documents CSS Modules as the convention. CSS Modules provide scoped styling which is more maintainable. The frontend plan also specifies "Sass + CSS Modules".

### 4. Zustand (not React Context or Apollo Cache)
**Decision**: Used Zustand for editor state management.
**Rationale**: Explicitly specified in `frontend-plan.md`. The AGENTS.md reference to React Context providers was a template artifact.

### 5. ESLint 9 (flat config)
**Decision**: Upgraded to ESLint 9 with native flat config (`eslint.config.mjs`).
**Rationale**: Next.js 16 removed the `next lint` command and `eslint-config-next@16` ships native ESLint 9 flat config arrays. The `FlatCompat` wrapper is no longer needed. ESLint is now run directly via `eslint src/`.

### 6. Route Constants Location
**Decision**: Routes defined at `src/modules/core/constants/routes.url.ts` (not `utils/constants/routes.url.ts`).
**Rationale**: The module-based architecture places all shared code under `src/modules/core/`. The `utils/constants/` path in the original AGENTS.md was from the template project.

### 7. No PrivateRoute / PublicRoute Wrappers
**Decision**: Pages render feature components directly without auth wrappers.
**Rationale**: The current scope has no authentication system. The editor is an admin tool but auth is not part of the MVP. Auth wrappers can be added when the backend API key system is integrated.

### 8. Dynamic Imports for Konva
**Decision**: All Konva canvas components are loaded via `next/dynamic` with `{ ssr: false }`.
**Rationale**: Konva.js requires DOM APIs (`window`, `document`, `canvas`) that are not available during server-side rendering. This is a standard pattern for canvas libraries in Next.js.

### 9. History Deep Cloning Strategy
**Decision**: Used `JSON.parse(JSON.stringify(seatMap))` for immutable history snapshots.
**Rationale**: Simple, reliable deep cloning for the data structures involved (plain objects, arrays, primitives). The SeatMap type does not contain functions, Dates, Maps, Sets, or circular references, making JSON serialization safe. Performance is acceptable for the 50-entry history limit.

### 10. Normalized Coordinates (0-1 Range)
**Decision**: All seat positions stored as normalized values between 0 and 1.
**Rationale**: Specified in the technical plan. Makes seat maps resolution-independent and allows rendering at any container size without recalculation.

### 11. react-konva v19 (React 19 Compatibility)
**Decision**: Upgraded `react-konva` from `18.2.14` to `19.2.2`.
**Rationale**: `react-konva@18` bundles `react-reconciler@0.29` which requires React 18. With React 19, the reconciler silently fails and the Konva canvas never renders (no `.konvajs-content` element in the DOM). `react-konva@19` ships `react-reconciler@0.33` which is compatible with React 19. Zero API changes were required in our components — all imports (`Stage`, `Layer`, `Group`, `Rect`, `Text`, `Image`) and patterns (refs, event handlers, props) work identically.

### 12. Cypress E2E Testing in Sprint 1
**Decision**: Set up Cypress E2E testing infrastructure and wrote 38 tests as part of Sprint 1 (rather than deferring to Sprint 4).
**Rationale**: Having E2E tests early caught the react-konva incompatibility and validates that all features work end-to-end. The test suite covers home page (5), editor (23), and embed (10). Cypress runs headless via `npm run cypress:run` and requires the dev server to be running.

---

## Open Questions for Future Sprints

### Q1: Authentication Strategy
The editor currently has no authentication. How should admin access be protected?
- **Option A**: API key in environment variable (simplest)
- **Option B**: Username/password login with JWT
- **Option C**: OAuth provider (Google, GitHub)

### Q2: Image Upload - Local vs Remote
Currently, background images are loaded as data URLs from drag-and-drop. For production:
- Should images upload directly to the backend S3/MinIO?
- Should there be a file size limit? (Suggested: 10MB)
- What image formats should be supported? (Suggested: PNG, JPG, WebP)

### Q3: Internationalization
The `docs/i18n.md` describes a full `react-i18next` setup with `newCommon` namespace. Is i18n needed for MVP?
- The editor could be English-only for MVP
- The embed widget may need localization for public-facing use

### Q4: Auto-save Strategy
The frontend plan mentions "auto-save (debounced)" in Phase 2. When implementing:
- Debounce interval? (Suggested: 3 seconds after last change)
- Should auto-save require the backend API to be available, or save to localStorage as fallback?
- Visual indicator for save status?

### Q5: Multi-selection UX
Phase 2 includes multi-selection (Shift+click, drag select). Decisions needed:
- Should drag-select create a rubber-band selection rectangle?
- Should Shift+click add to selection (toggle) or extend selection?
- Maximum number of seats selectable at once?

### Q6: Seat Shape Variety
Currently all seats are rectangles (Konva Rect). Should we support:
- Circular seats (Konva Circle)
- Custom SVG shapes
- Different sizes per seat type (VIP, regular, accessible)

### Q7: Embed Security
The embed page uses `X-Frame-Options: ALLOWALL`. For production:
- Should we restrict to specific domains?
- Should the postMessage origin be validated against a whitelist?
- Should embed URLs require an API key or token?

### Q8: Testing Priority — RESOLVED
Cypress E2E testing was set up in Sprint 1 with 38 tests covering all three page groups (home, editor, embed). See Decision #12. Unit testing with Jest/Vitest for coordinate transforms and Zustand store actions can still be added in a future sprint for finer-grained coverage.

### Q9: Dashboard Page
The home page (`/`) is currently a simple landing page with a "Create New Map" button. Should it:
- List existing maps from the API?
- Show map thumbnails/previews?
- Support map deletion and duplication?

### Q10: Offline Support
Should the editor support offline usage?
- localStorage persistence for work-in-progress maps
- Service worker for offline access
- Sync with backend when reconnected
