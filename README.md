# ✏️ Lexical Rich Text Editor

A feature-rich collaborative text editor built with **Next.js 16**, **Lexical**, and **TypeScript**.

🌐 **Live Demo:** [lexical-project.vercel.app](https://lexical-project.vercel.app)

## 🚀 Features

### 📝 Rich Text Editing
Full formatting toolbar with bold, italic, underline, strikethrough, headings, lists, blockquotes, code blocks, and image insertion. A slash-command floating menu provides quick access to block-level formatting.

### 🔗 Intelligent Link Cards
Paste a URL and it auto-converts into a custom link node. Hover to see a preview card with OG metadata (title, description, favicon) fetched server-side via `/api/link-preview`. Inline editing lets you modify or unlink URLs directly.

### 📊 Resizable Tables
Custom table nodes with drag-to-resize handles, insert/remove row and column buttons on hover, and dimension persistence via MutationObserver.

### 👥 Real-Time Collaboration
A dedicated `/collaboration` page powered by **Yjs** + **y-websocket**. Features include name entry on join, presence avatars, remote cursors, connection status indicator, observer (read-only) mode, and LevelDB persistence on the server.

### 📈 Status Bar
Minimizable status bar showing word count, character count, and estimated reading time. Collapses into an animated breathing dot that flashes on content changes.

## 🎨 Design Library

All UI components use [`@huzaifah191001/design-library`](https://www.npmjs.com/package/@huzaifah191001/design-library) which provides:

- **Button** — 4 variants: `default`, `subtle`, `filled`, `danger`
- **Checkbox** — `highlighted` and `minimal` variants
- **Select**, **ThemeProvider**, **useTheme()** — full light/dark theme support with semantic color tokens

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (Turbopack) |
| Editor | Lexical |
| State | Redux Toolkit |
| Collaboration | Yjs, y-websocket, @lexical/yjs |
| Persistence | sessionStorage (solo), LevelDB (collab) |

## 📦 Getting Started

```bash
npm install
npm run dev          # Start the editor
npm run collab-server  # Start WebSocket server for collaboration
```
