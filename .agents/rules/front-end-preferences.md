---
trigger: always_on
---

- All React components must be Functional Components using Hooks. 
- Class components are forbidden.
- App Router **only** — no pages/.
- No default exports except Next.js `page.tsx` / `layout.tsx`.
- Do not define business logic functions inside main.tsx.
- Colocate: server actions, tRPC routers, queries near feature.
- Server Components default — client only when needed (`"use client"`).
- No `console.log` in production code — only `console.warn/error`.
- Tailwind: use full class names (prettier-plugin-tailwindcss enforces order).
- Components:
  - `ui/`   → pure dumb UI (shadcn style). Use shadcn-ui where applicable, and if we need tailoring build them with TailwindCSS.
  - `domain/` → business logic + state
  - `layout/` → layout fragments
- Types: use type-only imports (`import type`) for types to prevent issues with `verbatimModuleSyntax`.
- Return types: use `ReactElement` (from `import type { ReactElement } from "react"`) — never `JSX.Element`, which is unavailable under `react-jsx` + `verbatimModuleSyntax`.