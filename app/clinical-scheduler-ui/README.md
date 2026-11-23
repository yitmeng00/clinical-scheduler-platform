# CareShift UI

React 19 + TypeScript single-page app for the CareShift clinical staff scheduler. For the full project overview, architecture, API reference and backend setup, see the [root README](../../README.md).

## Requirements

- Node.js 24.15+ or 22.22.2+
- The ASP.NET Core API running on `http://localhost:5172` (see the root README)

## Getting started

```bash
npm ci
npm run dev        # http://localhost:5173
```

The Vite dev server proxies `/api` and `/hubs` (including WebSockets) to the API, so the app always uses relative URLs. Sign in with one of the seed accounts listed in the root README.

## Scripts

| Script                  | Description                                                 |
| ----------------------- | ----------------------------------------------------------- |
| `npm run dev`           | Start the Vite dev server with HMR                          |
| `npm run build`         | Type-check (`tsc -b`) and build for production into `dist/` |
| `npm run preview`       | Serve the production build on `http://localhost:4173`       |
| `npm run lint`          | Run ESLint                                                  |
| `npm run test`          | Run Vitest in watch mode                                    |
| `npm run test:run`      | Run Vitest once                                             |
| `npm run test:coverage` | Run Vitest with V8 coverage                                 |
| `npm run test:e2e`      | Run Playwright end-to-end tests                             |
| `npm run test:e2e:ui`   | Run Playwright in interactive UI mode                       |

Before the first E2E run (or after upgrading Playwright), install the browser with `npx playwright install chromium`.

## Tooling notes

- **Build:** Vite 8 (Rolldown) with `@vitejs/plugin-react` and Tailwind CSS v4 via `@tailwindcss/vite`.
- **React Compiler:** enabled through `@rolldown/plugin-babel` with `reactCompilerPreset()` in `vite.config.ts`. Components are memoized automatically, so manual `useMemo` / `useCallback` is rarely needed.
- **Tests:** Vitest 5 + jsdom + React Testing Library. MSW v3 intercepts HTTP in `src/test/mocks/`, and `src/test/setup.ts` registers the `@testing-library/jest-dom/vitest` matchers.
- **Linting:** ESLint 9 flat config (`eslint.config.js`) with `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` and `eslint-plugin-import` (import ordering).

## Project layout

```
src/
├── app/          # Redux store, typed hooks, router
├── components/   # Shared layout and UI components
├── constants/    # Static config (sidebar navigation)
├── features/     # Feature modules (page, components, RTK Query endpoints)
├── hooks/        # Shared hooks
├── schemas/      # Zod form schemas
├── services/     # Base RTK Query API (with token refresh) and shared endpoints
├── signalr/      # Hub connection and useSignalR hook
├── test/         # Vitest setup, MSW handlers, fixtures, render helpers
├── types/        # Shared TypeScript types
└── utils/        # Pure utility functions
e2e/              # Playwright specs
```
