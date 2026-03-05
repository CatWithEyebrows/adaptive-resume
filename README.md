# AdaptiveResume

A privacy-focused, local-first React application that allows users to seamlessly tailor their master resumes to specific job descriptions with real-time PDF and DOCX exporting.

## Features
- **Local-First & Offline Capable:** Zero backend database. All parsing, state management, and file generation happens entirely in your browser.
- **Dynamic Variant Toggling:** Switch between different bullet points, intros, and skills per job application instantly.
- **Live Glassmorphic Preview:** See your resume exact-scale (8.5x11") update live as you toggle variants via the control panel.
- **Robust Parsers:** Drag-and-drop ingestion of standard `json-resume` schemas or simple Markdown files.
- **High-Fidelity Exports:** Generate pure `.pdf` or fully styled, ATS-friendly `.docx` files natively.

## Tech Stack
- **Framework:** React 19 + Vite (TypeScript)
- **State Management:** Zustand
- **Styling:** Tailwind CSS + Framer Motion
- **Document Generation:** `docx` (Word templates)
- **UI Components:** Radix UI primitives + Lucide Icons
- **Testing:** Vitest

## Installation

Ensure you have Node.js and `pnpm` installed.

```bash
# Install dependencies
pnpm install
```

## Quick Start
```bash
# Start the local development server
pnpm dev
```
Visit `http://localhost:5173` to view the application.

## Project Structure
```
src/
├── components/          # React UI components (LivePreview, ControlPanel, etc.)
│   ├── ui/              # Dumb primitives (Buttons, Checkboxes)
├── data/                # Hardcoded stylistic rendering constants (colors, fonts)
├── export/              # Native DOCX generation logic
├── lib/parsers/         # Markdown and JSON structure ingestion algorithms
├── store/               # Zustand global state (useResumeStore)
└── types/               # Strict TypeScript interfaces representing the Resume tree
```

## Architecture
`AdaptiveResume` relies on a strict internal JSON schema (`ResumeData`). The application flow operates as follows:
1. **Ingestion:** A user drops a `.json` or `.md` file. The specific parser validates it and converts it into the internal `ResumeData` tree.
2. **State:** The `useResumeStore` (Zustand) holds the `ResumeData` and tracks which variants/bullets the user has currently toggled "active".
3. **Presentation:** The `ControlPanel` reads/writes to the store to toggle states, while `LivePreview` strictly reads the store to render the scaled visual sheet.
4. **Export:** The active data tree is piped directly into the `docx` Packer or native `window.print()` engine.

## Development Rules
Please refer to the internal `.agents/rules` directory for opinionated guidelines, but generally:
- Prefer **TypeScript** over JavaScript and avoid `any`.
- All styling must use full **Tailwind CSS** class names.
- Components should be functional utilizing modern React Hooks.

## Deployment
This is a pure static Vite application. It can be easily deployed to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages).

```bash
# Build the production static bundle
pnpm build

# Test the production bundle locally
pnpm preview
```

---
*Last refreshed: March 4, 2026*
