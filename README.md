# AdaptiveResume

A privacy-focused, local-first resume tailoring tool. No server, no sign-up, no data leaves your browser — ever.

Import your master resume, toggle variants and bullets per job application, reorder sections with drag-and-drop, and export a polished PDF or DOCX in seconds.

---

## Why AdaptiveResume?

Most resume tools are SaaS platforms that store your personal data on their servers. AdaptiveResume takes a different approach: everything runs entirely in your browser. Your resume data stays on your machine, persisted in localStorage only when you explicitly import your own file.

---

## Features

### Variant Toggling

Each resume section supports multiple content variants. Write a "Frontend Focus" summary and a "Fullstack" summary, then toggle between them instantly. The same applies to skills, education, intros, and any custom section.

### Bullet Selection

For nested sections like Work Experience, each entry has a pool of bullet points you can check on or off. Active bullets rise to the top automatically, so your most relevant accomplishments are always first.

### Drag-and-Drop Reordering

Three levels of reordering, all via drag-and-drop:

- **Sections** — reorder entire resume sections (Summary stays pinned at top)
- **Entries** — reorder work entries within a group (e.g., move your most relevant job first)
- **Bullets** — reorder individual bullet points within an entry

Visual feedback includes a ghost overlay during drag and a dashed placeholder at the drop target.

### Full Edit Mode

Toggle edit mode to unlock inline editing and CRUD operations across the entire resume:

- **Add/edit/delete** variants, bullets, work entries, and entire sections
- **Inline renaming** of section headers and entry titles (click to edit, Enter to save, Escape to cancel)
- **Two section types** when adding: Standard (variant-based) or Nested (entry-based with bullets)
- All destructive actions require confirmation via a styled dialog

### Live Preview

The right panel renders your resume at exact A4 scale (8.5" × 11") and updates in real time as you toggle, reorder, or edit content. A red dashed line marks the one-page boundary so you can see at a glance if your resume overflows.

### Import

Two ways to bring in your resume:

| Format | Description |
|--------|-------------|
| `.json` | Standard [JSON Resume](https://jsonresume.org/) schema — auto-detected and converted |
| `.md` | Markdown template with section headers, variants, and `[x]`/`[ ]` bullet syntax |

Import via drag-and-drop onto the preview area, file picker, or paste raw text in the import modal.

### Export

| Format | Method |
|--------|--------|
| **PDF** | Native browser print dialog with full formatting |
| **DOCX** | ATS-friendly Word document generated client-side via the `docx` library |
| **JSON** | Full enriched schema with all variants, bullets, and active states |
| **Markdown** | Structured template that can be re-imported to restore exact state |

Exports are disabled while using demo data — import your own resume first.

### Persistence

When you import your own resume, it's saved to `localStorage` so it survives page refreshes. Demo/template data is never persisted — if you close the tab without importing, the app resets cleanly on next visit.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)

### Install & Run

```bash
# Clone the repository
git clone https://github.com/CatWithEyebrows/adaptive-resume.git
cd adaptive-resume

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### First Launch

On first load, AdaptiveResume displays a demo resume so you can explore the interface immediately. A "Preview mode: demo data" badge appears in the corner. To start working with your own data:

1. **Download the template** — click the Template button in the toolbar to get a `.md` file pre-filled with the demo structure
2. **Edit it** — replace the placeholder content with your real resume data
3. **Import it** — drag the file onto the preview area, or use the import modal

Alternatively, import an existing [JSON Resume](https://jsonresume.org/) file directly.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite (TypeScript) |
| State | Zustand (with localStorage persistence) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Drag & Drop | @dnd-kit |
| Document Generation | docx |
| UI Primitives | Radix UI + Lucide Icons |
| Testing | Vitest |

---

## Project Structure

```
src/
├── components/
│   ├── control-panel/     # ControlPanel sub-components (headers, entries, groups)
│   └── ui/                # Reusable primitives (IconButton, DragHandle, Collapsible, etc.)
├── data/                  # Rendering constants (fonts, colors, spacing)
├── export/                # Client-side DOCX generation
├── lib/
│   ├── dnd/               # Drag-and-drop hooks and utilities
│   └── parsers/           # JSON Resume and Markdown ingestion
├── store/                 # Zustand stores (useResumeStore, useEditStore)
└── types/                 # TypeScript interfaces for the resume data tree
```

---

## Architecture

```
┌─────────────┐      ┌──────────────┐     ┌─────────────┐
│  Import     │ ──▶ │  Zustand     │ ──▶ │  Live       │
│  .json / .md│      │  Store       │     │  Preview    │
└─────────────┘      └──────┬───────┘     └─────────────┘
                            │
                     ┌──────┴───────┐
                     │  Control     │
                     │  Panel       │
                     └──────┬───────┘
                            │
                     ┌──────┴───────┐
                     │  Export      │
                     │  PDF/DOCX/MD │
                     └──────────────┘
```

1. **Ingestion** — a parser validates the imported file and converts it into the internal `ResumeData` tree
2. **State** — Zustand holds the full resume and tracks active variants, selected bullets, and section order
3. **Control** — the ControlPanel reads and writes to the store (toggle, reorder, edit)
4. **Presentation** — LivePreview reactively renders the current state at exact A4 scale
5. **Export** — the active data is piped into the docx Packer, print engine, or serialized back to JSON/Markdown

---

## Build & Deploy

```bash
# Production build
pnpm build

# Preview the production bundle locally
pnpm preview
```

AdaptiveResume is a pure static site — deploy the `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages).

---

## License

MIT
