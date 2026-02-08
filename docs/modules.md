# Feature modules

## Goal

A feature module is the unit of ownership for a functional area of the application.

A module should:

- Own its UI (components)
- Own its feature-level services (GraphQL queries/mutations, adapters)
- Expose a small, stable public API via `src/modules/<module>/index.ts`
- Be wired from Next.js pages (`src/pages/**`) via a thin page wrapper

## Location and naming

- Modules live under `src/modules/<module-name>/`.
- Folder names must be kebab-case.

Examples:

- `src/modules/announcements/`
- `src/modules/traveler-management/`

## Minimal module structure

This is the minimal structure for a new module:

- `src/modules/<module-name>/index.ts`
- `src/modules/<module-name>/components/`

Recommended additions:

- `src/modules/<module-name>/AGENTS.md` (module ownership, routes, notes)

## Optional folders (use as needed)

Use these only when the module requires them:

- `hooks/` for module-specific hooks
- `services/` for GraphQL queries/mutations, REST clients, adapters
- `types/` for module-specific types
- `utils/` for module-specific helpers
- `submodules/` for large modules that contain multiple distinct flows

## Components conventions

- Colocate a component with its `*.module.scss`.
- Prefer a single "feature root" component that represents the main entry for the route.

Example:

- `src/modules/announcements/components/announcements/Announcements.tsx`

See `docs/scss.md` for `*.module.scss` conventions.

## Module public API (`index.ts`)

Each module must expose its public API via `src/modules/<module-name>/index.ts`.

Guidelines:

- Export only what is used by pages or other modules.
- Inside the module, prefer relative imports.
- Outside the module, import from the module entrypoint (do not deep-import internals).

Example usage from a page:

- `import { Announcements } from '@/modules/announcements'`

## Pages wiring (Next.js)

Pages live under `src/pages` and should be thin wrappers.

Conventions:

- Under `src/pages`, create a folder matching the route and place the entry in `index.tsx`.
- A page should:
  - Wrap with `PrivateRoute` or `PublicRoute`
  - Render a single top-level component from a feature module (the feature root)

Example:

- `src/pages/announcements/index.tsx` renders `Announcements` from `@/modules/announcements`

## Routing

- All routes must be defined in `utils/constants/routes.url.ts`.
- Use `ROUTER_URL` constants instead of string literals.

## i18n conventions for modules (fixed key-root convention)

This project uses `react-i18next` and the `newCommon` namespace for UI copy.

### Fixed convention: key root naming

When adding new keys for a feature/module, choose a key root that is:

- Lower camelCase
- Stable (do not include hyphens)

Rules:

- If the module folder is kebab-case, convert it to lower camelCase.
  - Example: `dashboard-2` -> `dashboard2`
  - Example: `traveler-management` -> `travelerManagement`

Then place all feature keys under that root:

- `dashboard2.title`
- `dashboard2.sections.priorityAttention`

See `docs/i18n.md` for translation usage (`useTranslation('newCommon')` + `tw(t, key)`) and key conventions.

## Styling

- Use Sass (`.scss`) and CSS Modules (`*.module.scss`) for page and component styles.
- Use UI Kit tokens for design values.

See `docs/scss.md`.

## Checklist: creating a new module

- Create `src/modules/<module-name>/` (kebab-case)
- Add `index.ts` exporting the module public API
- Add `components/<feature-root>/<FeatureRoot>.tsx` + `<FeatureRoot>.module.scss`
- (Recommended) Add `src/modules/<module-name>/AGENTS.md` with:
  - Purpose
  - Routes owned
  - Public entry points
  - i18n namespaces
- Add routes to `utils/constants/routes.url.ts`
- Add pages under `src/pages/<route>/index.tsx` that:
  - Wrap with `PrivateRoute`/`PublicRoute`
  - Delegate to the module feature root
- Add UI strings to `public/static/locales/en/newCommon.json` under the fixed key root
