# Vibe Judge IDE

English · [Español](README.es.md)

Vibe Judge IDE is a browser-based competitive-programming workspace built with **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, **Monaco Editor**, **Zustand**, and WebSocket integrations for judge and LSP workflows.

It is designed for online-judge platforms that need a focused coding UI: competitors can read the problem, write a single-file solution, run it with custom input or test cases, submit it to a judge backend, and follow execution status in real time.

## What this repository contains

This checkout contains the **web IDE**:

- Next.js application shell and custom WebSocket server (`server.mjs`).
- Monaco-based code editor.
- Persisted UI/code state with Zustand.
- Judge HTTP + optional WebSocket client integration.
- Vibe handoff support: launch tokens from the OJ, quick problem loading with `/ide?id=<problemId>`, and session token persistence for browser refreshes.
- Browser-to-server LSP proxy routes under `/api/lsp/*`.

The actual language-server runtime is expected to run separately and be reachable through `LSP_SERVER_WS_BASE` (for example `ws://127.0.0.1:3001`). Some scripts still target a local `lsp/` companion directory; they only work when that directory is present in your checkout.

## Highlights

| Area | Capability |
| --- | --- |
| Editor | Monaco Editor with language-aware file names and configurable themes |
| Languages | C++17, Python 3, Java 17, JavaScript, Rust, and Go |
| Problem view | Built-in Spanish problem statement panel with a draggable split view and MathJax rendering for LaTeX |
| Execution UI | Separate panels for output, stdin, test cases, logs, runtime, and memory |
| Persistence | Code, selected language, test cases, layout sizes, minimap, theme persist locally, and the last launch token persists in session storage |
| Judge integration | Vibe context handoff, `run`/`submit` HTTP calls, polling, and optional WebSocket status updates |
| LSP proxy | Browser connects to `/api/lsp/<language>` while the server forwards the private token upstream |
| Shortcuts | `Ctrl+Enter` to run, `Ctrl+Space` for editor suggestions |

## Screenshots

### IDE workspace

![Vibe Judge IDE workspace](docs/assets/ide-overview.png)

### Completion UI

![Monaco completion suggestions](docs/assets/monaco-completion.png)

### LSP status and panels

![LSP indicator and output panels](docs/assets/lsp-and-panels.png)

## Architecture

```mermaid
flowchart LR
  User[User in browser]
  UI[Next.js IDE UI]
  Monaco[Monaco Editor]
  Store[Zustand persisted state]
  Judge[Judge HTTP + WebSocket API]
  Proxy[Next.js WebSocket LSP proxy]
  Runtime[External LSP runtime]
  Servers[clangd / pyright / jdtls / rust-analyzer / gopls / tsserver]

  User --> UI
  UI --> Store
  UI --> Monaco
  UI --> Judge
  Monaco -->|WS /api/lsp/*| Proxy
  Proxy -->|Authorization header| Runtime
  Runtime -->|stdio LSP| Servers
```

### LSP message flow

```mermaid
sequenceDiagram
  participant E as Monaco Editor
  participant P as Next.js LSP Proxy
  participant R as External LSP Runtime
  participant S as Language Server

  E->>P: WebSocket JSON-RPC on /api/lsp/cpp
  P->>R: WebSocket JSON-RPC with private Authorization token
  R->>S: LSP stdio frame
  S-->>R: LSP response or diagnostics
  R-->>P: JSON-RPC response
  P-->>E: completions, hovers, diagnostics
```

### Judge flow

```mermaid
sequenceDiagram
  participant UI as IDELayout
  participant API as Judge API
  participant WS as Judge WebSocket
  participant Panels as Output/Testcase Panels

  UI->>API: POST /run or POST /submit
  API-->>UI: result, runId, or submissionId
  UI->>WS: connect /submission/:id
  WS-->>UI: phase, verdict, logs, stdout, stderr
  UI-->>Panels: render execution state
```

## Folder structure

| Path | Purpose |
| --- | --- |
| `app/` | Next.js App Router entry points and global styles |
| `components/` | IDE layout, editor, toolbar, status badges, and panels |
| `docs/assets/` | README screenshots |
| `hooks/` | Keyboard shortcuts, panel resize, toast, LSP editor wiring, and judge actions |
| `lib/` | Language metadata, UI config, verdict helpers, themes, and error formatting |
| `services/` | HTTP, judge API, file download, and LSP client exports |
| `store/` | Zustand store and default persisted state |
| `types/` | Shared TypeScript contracts |
| `server.mjs` | Custom Next.js server plus `/api/lsp/*` WebSocket proxy |

## Requirements

- Node.js 20+ recommended
- npm 10+
- A judge backend if you want real run/submit execution
- Optional: an external LSP runtime listening on `LSP_SERVER_WS_BASE`
- Optional: Docker and Docker Compose if your checkout includes the companion `lsp/` runtime directory

## Quick start

```bash
git clone <repo-url>
cd vibe-ide
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

If you run the full Patito compose stack, the local URLs are HTTP-only by default:

```txt
http://patito.localhost/oj/
http://patito.localhost/ide/
http://patito.localhost/api/
```

The compose Traefik router listens on port `80` and does not redirect to HTTPS. Use `ws://` for WebSocket endpoints in local config.

## Loading a Patito problem

The normal flow is:

1. The OJ opens `/oj/vibe-ide-launch.php?id=<problemId>` or the contest equivalent.
2. The launch route creates a short-lived token and redirects to `/ide?token=<token>`.
3. Vibe IDE stores that token in `sessionStorage`, removes it from the address bar, and loads `/api/vibe/context`.

For fast local loading, Vibe IDE also accepts query parameters on the IDE URL and redirects through the same launch flow:

```txt
http://patito.localhost/ide?id=1010
http://patito.localhost/ide?cid=3&pid=0
```

After a successful token launch, refreshing `http://patito.localhost/ide/` in the same browser tab/session reloads the last problem from the persisted launch token.

## LaTeX and rich problem statements

Problem sections may contain HTML plus LaTeX delimiters such as `$N$`, `\(N\)`, `$$...$$`, or `\[...\]`. The IDE sanitizes the HTML first, writes it into the problem DOM node, and then runs MathJax over that node. This order prevents React re-renders, such as toast notifications, from replacing rendered math with raw LaTeX text.

If you only want to inspect the UI, the judge backend and LSP runtime can be offline. Run/submit and LSP features will show connection errors until their services are available.

## Configure the judge backend

The frontend expects these endpoints:

```txt
POST /vibe/runs
GET  /vibe/runs/{id}
POST /vibe/submissions
GET  /vibe/submissions/{id}
WS   /vibe/submissions/{id}/events (optional)
```

Set the judge URLs in `.env.local` or `public/vibe-config.json`:

```env
NEXT_PUBLIC_JUDGE_API_URL="http://localhost:8080"
NEXT_PUBLIC_JUDGE_WS_URL="ws://localhost:8080"
NEXT_PUBLIC_VIBE_IDE_CONTEXT_URL="http://localhost:8080/api/vibe/context"
```

In the Patito compose stack these are same-origin runtime values:

```json
{ "apiBaseUrl": "/api", "paths": { "context": "/vibe/context" } }
```

If `NEXT_PUBLIC_JUDGE_WS_URL` is omitted, the app derives it from `NEXT_PUBLIC_JUDGE_API_URL`.

## Configure LSP

The browser should not know the private LSP token. Monaco connects only to same-origin proxy URLs:

```env
NEXT_PUBLIC_LSP_CPP_WS="/api/lsp/cpp"
NEXT_PUBLIC_LSP_PYTHON_WS="/api/lsp/python"
NEXT_PUBLIC_LSP_JAVA_WS="/api/lsp/java"
NEXT_PUBLIC_LSP_JAVASCRIPT_WS="/api/lsp/js"
NEXT_PUBLIC_LSP_RUST_WS="/api/lsp/rust"
NEXT_PUBLIC_LSP_GO_WS="/api/lsp/go"
```

`server.mjs` receives those WebSocket upgrades, then connects to the external LSP runtime with a private server-side token:

```env
LSP_AUTH_TOKEN="dev-lsp-token"
LSP_SERVER_WS_BASE="ws://127.0.0.1:3001"
```

Do **not** rename `LSP_AUTH_TOKEN` to `NEXT_PUBLIC_*`; anything with `NEXT_PUBLIC_` is bundled into browser code.

Expected upstream routes from the external LSP runtime:

```txt
/lsp/java
/lsp/cpp
/lsp/python
/lsp/js
/lsp/rust
/lsp/go
```

## Example `.env.local`

```env
NEXT_PUBLIC_JUDGE_API_URL="http://localhost:8080"
NEXT_PUBLIC_JUDGE_WS_URL="ws://localhost:8080"
NEXT_PUBLIC_VIBE_IDE_CONTEXT_URL="http://localhost:8080/api/vibe/context"

NEXT_PUBLIC_LSP_CPP_WS="/api/lsp/cpp"
NEXT_PUBLIC_LSP_PYTHON_WS="/api/lsp/python"
NEXT_PUBLIC_LSP_JAVA_WS="/api/lsp/java"
NEXT_PUBLIC_LSP_JAVASCRIPT_WS="/api/lsp/js"
NEXT_PUBLIC_LSP_RUST_WS="/api/lsp/rust"
NEXT_PUBLIC_LSP_GO_WS="/api/lsp/go"

LSP_AUTH_TOKEN="dev-lsp-token"
LSP_SERVER_WS_BASE="ws://127.0.0.1:3001"
```

## Judge API contract

### `POST /run`

Request:

```json
{
  "sourceCode": "#include <bits/stdc++.h>...",
  "language": "cpp",
  "stdin": "5\n",
  "testcases": []
}
```

Response:

```json
{
  "runId": "run_123",
  "result": {
    "id": "run_123",
    "phase": "completed",
    "verdict": "Accepted",
    "stdout": "5\n",
    "stderr": "",
    "compileErrors": "",
    "logs": ["Finished."],
    "runtimeMs": 12,
    "memoryKb": 4096
  }
}
```

### `POST /submit`

```json
{ "submissionId": "sub_123" }
```

### WebSocket status message

```json
{
  "submissionId": "sub_123",
  "phase": "running",
  "verdict": "Pending",
  "logs": ["Compiling..."]
}
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the custom Next.js development server (`server.mjs`) |
| `npm run build` | Build the production app |
| `npm run start` | Start the custom production server after building |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run lint` | Alias for `npm run typecheck` |
| `npm run check` | Run typecheck and production build |
| `npm run lsp:up` | Legacy helper for checkouts where the LSP runtime is copied into `vibe-ide/lsp/` |
| `npm run lsp:up:detached` | Legacy detached LSP helper for `vibe-ide/lsp/` checkouts |
| `npm run lsp:logs` | Legacy LSP log helper for `vibe-ide/lsp/` checkouts |
| `npm run lsp:down` | Legacy LSP stop helper for `vibe-ide/lsp/` checkouts |
| `npm run lsp:cache` | Legacy cache helper for `vibe-ide/lsp/`; use `../vibe-lsp-server/storage/` in this repo layout |

## Add a language

1. Add the language id and shared types in `types/ide.ts`.
2. Add display metadata, Monaco language id, file extension, and starter code in `lib/language-options.ts`.
3. Add or update the frontend LSP config for the new `NEXT_PUBLIC_LSP_*_WS` variable.
4. Add a `/api/lsp/<language>` proxy route in `server.mjs`.
5. Ensure the external LSP runtime exposes `/lsp/<language>`.
6. Document the new environment variable in both README files and `.env.example`.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `LSP: <server>` shows disabled | Missing `NEXT_PUBLIC_LSP_*_WS` variable | Copy `.env.example` to `.env.local` and restart `npm run dev` |
| LSP disconnects immediately | Missing `LSP_AUTH_TOKEN`, wrong token, wrong upstream URL, or external LSP runtime is down | Check `.env.local`, `LSP_SERVER_WS_BASE`, and the external runtime logs |
| Browser shows token concerns | Token was exposed with a `NEXT_PUBLIC_*` variable | Keep the secret as `LSP_AUTH_TOKEN` only; Monaco should only call `/api/lsp/*` |
| Run/submit fails | Judge API does not implement the expected contract | Verify `NEXT_PUBLIC_JUDGE_API_URL` and backend routes |
| WebSocket verdicts do not arrive | Judge WebSocket URL is wrong or blocked | Set `NEXT_PUBLIC_JUDGE_WS_URL` explicitly and inspect the browser Network tab |
| LSP scripts fail with missing `lsp/docker-compose.yml` | This repo layout keeps the runtime as sibling `../vibe-lsp-server` | Use the top-level compose service `vibe-lsp-server` or run `docker compose up --build` inside `../vibe-lsp-server` |

## License

Add a license before publishing this repository as open source.
