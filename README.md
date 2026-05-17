# Vibe Judge IDE

A modern competitive-programming web IDE built with **React**, **Next.js App Router**, **Tailwind CSS**, **TypeScript**, **Monaco Editor**, **Zustand**, **Framer Motion**, and a WebSockets-ready judge integration layer.

This is intentionally **not** a cloud IDE. It focuses on the workflow competitors need: write one solution, test against custom stdin/testcases, run, submit, and read verdicts quickly.

## Features

- VSCode/Judge0/USACO-inspired dark IDE layout.
- Monaco Editor with syntax highlighting, line numbers, autoclosing brackets, snippets, IntelliSense hooks, Scanner-aware Java completions, and optional minimap.
- Supported languages: C++, Python, Java, JavaScript, Rust, and Go, with competitive-programming snippets per language.
- Top toolbar with language selector, Run, Submit, execution phase, verdict, runtime, and memory.
- Resizable bottom panel with Output, Input, and Testcases tabs.
- Output sections for stdout, stderr, compile errors, logs, and verdict colors.
- Expandable testcase manager with expected input, expected output, actual output, and visual status.
- Keyboard shortcuts:
  - `Ctrl/Cmd + Enter` → Run
  - `Ctrl/Cmd + Shift + Enter` → Submit
  - `Ctrl/Cmd + S` → save locally
- Local persistence for code, selected language, stdin, testcases, and UI preferences.
- Framer Motion transitions, toast notifications, loading states, and a responsive layout.

## Frontend-only judge integration

The app is prepared for an external judge backend. It does **not** implement a backend, Linux terminal, shell, Docker, Git integration, or a complex file workspace.

Expected HTTP endpoints:

```txt
POST /run
POST /submit
GET /submission/:id
```

Expected WebSocket stream:

```txt
WS /submission/:id
```

Configure endpoints with:

```bash
NEXT_PUBLIC_JUDGE_API_URL="https://your-judge-api.example.com"
NEXT_PUBLIC_JUDGE_WS_URL="wss://your-judge-api.example.com"
```

## Project structure

```txt
app/          Next.js App Router pages and global styles
components/   IDE UI components
hooks/        Keyboard shortcuts and WebSocket status stream
lib/          Language definitions and verdict utilities
services/     External judge API client
store/        Zustand IDE state and persistence
types/        Shared TypeScript contracts
```

## Development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run typecheck
npm run build
```

> Note: this environment may block npm registry access. If install fails with a registry 403, run the checks in an environment that can install the dependencies listed in `package.json`.
