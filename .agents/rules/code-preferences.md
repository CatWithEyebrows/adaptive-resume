---
trigger: always_on
---

- Files: 
  - kebab-case for routes & folders
  - PascalCase for components
  - camelCase for utils, helpers, variables
- No `any` — use `unknown` and narrow it.
- Prefer arrow functions for callbacks & short functions.
- Always create a new file (e.g., utils.ts, feature_x.ts, component_y.tsx) for new functionality and import it.
- Always use barrel exports, creating an index.ts file for them in parent folders.

