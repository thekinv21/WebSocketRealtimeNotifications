# WebSocket Realtime Notifications Frontend

Next.js 16 app (App Router) with TypeScript, Tailwind CSS and a realtime WebSocket layer,
structured with **Feature-Sliced Design (FSD)**.

FSD reference (source of truth for every architecture question): https://fsd.how/ru/

- Layers: https://fsd.how/ru/docs/reference/layers
- Slices & segments: https://fsd.how/ru/docs/reference/slices-segments
- Public API: https://fsd.how/ru/docs/reference/public-api
- Next.js integration: https://fsd.how/ru/docs/guides/tech/with-nextjs

## Stack

- Next.js 16.4.0 (App Router, Server Components by default)
- React 19.3.0
- TypeScript (strict mode), path alias `@/*` → `./src/*`
- Tailwind CSS v4
- TanStack Query (react-query)
- Lucide React for icons
- React Hook Form + Zod + @hookform/resolvers for forms and validation
- Axios for the HTTP client instance
- Bun as package manager (`bun install`, `bun run <script>`)

## Commands

- `bun run dev` — dev server
- `bun run build` — production build
- `bun run lint` — ESLint (incl. FSD import rules) + Steiger (FSD structure). Must pass with 0 errors.
- `bun run lint:fix` — autofix what can be fixed
- `bun run lint:fsd` — Steiger only
- `bun run format` / `bun run format:check` — Prettier

Husky `pre-commit` runs `bun run lint`; a commit with any FSD violation is rejected.
Commit message format: `type:[branchName][developerName]: description` (e.g. `feat:[master][Vadim]: add auth`).

## Architecture: Feature-Sliced Design

### Folder layout

```
frontend/
├── app/                 # Next.js routing ONLY (page.tsx, layout.tsx, route.ts, loading/error/not-found)
├── pages/               # Empty on purpose: stops Next.js from treating src/pages as Pages Router. Do not delete.
└── src/
    ├── app/             # FSD app layer: providers, global setup, api-route handlers
    ├── pages/           # FSD pages layer: one slice per screen
    ├── widgets/         # large self-contained UI blocks
    ├── features/        # user interactions that bring business value
    ├── entities/        # business entities (user, notification, ...)
    └── shared/          # reusable foundation, no business logic
```

The `processes` layer is deprecated — never create it.

### Layers (top → bottom)

| Layer                 | Has slices | May import from                                |
| --------------------- | ---------- | ---------------------------------------------- |
| `app/` (Next routing) | —          | `@/app`, `@/pages`, `@/shared`                 |
| `src/app`             | no         | pages, widgets, features, entities, shared     |
| `pages`               | yes        | widgets, features, entities, shared            |
| `widgets`             | yes        | features, entities, shared                     |
| `features`            | yes        | entities, shared                               |
| `entities`            | yes        | shared (+ other entities only via `@x`)        |
| `shared`              | no         | nothing in the project, only external packages |

### Import rules (enforced by lint)

1. **Only downward.** A module may import only from layers strictly below its own. Never upward.
2. **No cross-slice imports on the same layer.** `features/auth` must not import `features/like`;
   `widgets/header` must not import `widgets/sidebar`. If two slices need the same thing, move it
   down a layer or compose them in a higher layer.
3. **Entities cross-reference only via `@x`.** If `entities/notification` needs `entities/user`,
   `entities/user` exposes `entities/user/@x/notification.ts` and notification imports
   `@/entities/user/@x/notification`. Nothing else.
4. **Public API only.** From outside a slice, import only its `index.ts`:
   - slices: `@/entities/user`, `@/entities/user/ui/UserCard`
   - shared: per segment/module index: `@/shared/ui/button`, `@/shared/api`, `@/shared/ui/button/Button`
   - `src/app` from Next routing: `@/app/providers`
5. **Explicit public API.** `index.ts` re-exports by name: `export { UserCard } from './ui/UserCard'`.
   `export *` is forbidden. Export only what consumers need.
6. **Inside a slice use relative imports** (`../model/store`), never the slice's own `@/...` index —
   that creates circular imports.
7. `src/app` and `src/shared` have no slices: their segments may import each other freely.

### Segments

Group code by purpose, not by type. Use the standard segment names:

- `ui` — components, styles, formatters bound to UI
- `model` — state, stores, Zod schemas, business logic, types of the domain
- `api` — requests, query keys, TanStack Query hooks, DTOs, mappers
- `lib` — internal helpers of the slice
- `config` — constants, feature flags

Forbidden segment names (Steiger `segments-by-purpose`): `components`, `hooks`, `types`, `utils`,
`helpers`, `modals`, etc. Put types next to their purpose (`model`, `api`), helpers in `lib`.

`shared` segments: `api` (axios instance, socket client), `ui` (UI kit), `lib`, `config` (env, constants),
`routes` (route paths). Each `shared/ui/<component>` and `shared/lib/<module>` gets its own `index.ts`.

### Next.js integration

- Root `app/` is routing only. A `page.tsx` re-exports the FSD page:
  ```ts
  // app/notifications/page.tsx
  export { NotificationsPage as default, metadata } from '@/pages/notifications'
  ```
- `layout.tsx` wires `@/app/providers`; no business logic in the root `app/`.
- Route handlers: logic lives in `src/app/api-routes`, `app/api/**/route.ts` only re-exports it.
- `proxy.ts` (Next 16 replacement for middleware) and `instrumentation.ts` live at the project root.

### Realtime / WebSocket placement

- Socket client instance and connection config → `shared/api` (`shared/config` for URLs).
- Notification domain (types, Zod schema, cache updates, UI card) → `entities/notification`.
- User actions (mark as read, subscribe, settings) → `features/*`.
- Notification bell / feed composed of features+entities → `widgets/*`.
- Socket connection lifecycle provider → `src/app/providers`.

## Lint enforcement

- **ESLint** (`eslint.config.mjs`) with `eslint-plugin-boundaries`:
  `boundaries/dependencies` (layer order, cross-slice ban, `@x`, public API),
  `boundaries/no-unknown-files` (every file under `src/` must belong to a known layer),
  `no-restricted-syntax` on `src/**/index.ts` (no `export *`). Shows errors directly in the editor.
- **Steiger** (`steiger.config.ts`, official FSD linter, `@feature-sliced/steiger-plugin` recommended set):
  public-api presence, public-api sidestep, forbidden imports, segment naming, deprecated layers, etc.
  `fsd/insignificant-slice` is a warning (slice with 0–1 consumers should be merged into its consumer).
- Never disable these rules with `eslint-disable` or by editing the configs to make code pass.
  Fix the structure instead.

## Conventions

- Server Components by default. Add `"use client"` only for interactivity, browser APIs or hooks.
- Server data: fetch in Server Components / Server Actions. Client-side and realtime data:
  TanStack Query hooks in the slice's `api` segment; WebSocket events update the Query cache.
- Validate all inputs with Zod. Schemas live in the `model` segment of the owning slice;
  generic validators in `shared/lib`.
- Use `next/image` for all images, never raw `<img>`.
- Use `next/link` for internal navigation; route paths come from `shared/routes`.
- CSS: Tailwind utility classes only. No CSS modules, no styled-components. Global styles: `app/globals.css`.
- Naming: PascalCase for component files (`UserCard.tsx`), kebab-case for other files and all folders/slices
  (`mark-as-read`, `use-notifications.ts`).
- Formatting: Prettier (tabs, single quotes, no semicolons). Imports are auto-sorted by FSD layer.

## Component patterns

- FSD page components live in `src/pages/<slice>/ui`, exported via the slice `index.ts`.
- Client components go in separate files with the `"use client"` directive.
- Loading states use `loading.tsx` (Suspense boundary) in root `app/`.
- Error boundaries use `error.tsx` with `"use client"` in root `app/`.

## Testing

Not set up yet. When added: Vitest for unit tests, Playwright for e2e,
tests colocated with the slice they cover. Do not reference `test` scripts until they exist in `package.json`.

## Common gotchas

- Don't import server-only code in client components.
- Don't use `useState`/`useEffect` in Server Components.
- Always handle loading and error states.
- Use dynamic imports for heavy client components.
- Environment variables: `NEXT_PUBLIC_` prefix for client-side access; read them only in `shared/config`.
