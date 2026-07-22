# Patito IDE

English · [Español](README.es.md)

Patito IDE is the code editor opened from a Patito problem. It lets students read the statement, test a solution with different inputs, and submit it to the judge.

It uses Next.js, React, TypeScript, Monaco Editor, and Zustand. `server.mjs` runs Next.js and proxies the LSP WebSocket connections.

## Development

Node.js 20 or newer is required. The Docker image uses Node.js 22.

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Open <http://localhost:3000>. When `NEXT_PUBLIC_BASE_PATH=/ide` is set, use <http://localhost:3000/ide/>.

The API and `patito-lsp-server` must also be running to use execution, submission, and language features.

## Dependencies

The interface can run on its own, but each feature depends on another service:

| Feature | Service |
| --- | --- |
| load a problem | `onlineJudgeAdmin-back` |
| run and submit code | `onlineJudgeAdmin-back` and `core` |
| completion and diagnostics | `patito-lsp-server` |
| open the IDE from the website | `patito-client-web` |

To test the complete flow, run this command from the workspace root:

```bash
docker compose up -d --build
```

Compose waits for the API and LSP service before starting the IDE.

## Environment variables

Start with the provided example:

```env
NEXT_PUBLIC_JUDGE_API_URL=http://localhost:8080
NEXT_PUBLIC_JUDGE_WS_URL=ws://localhost:8080
NEXT_PUBLIC_VIBE_IDE_CONTEXT_URL=http://localhost:8080/api/vibe/context

LSP_AUTH_TOKEN=change-me
LSP_SERVER_WS_BASE=ws://127.0.0.1:3001
```

| Variable | Purpose | Used by |
| --- | --- | --- |
| `NEXT_PUBLIC_JUDGE_API_URL` | HTTP URL of the judge API | browser |
| `NEXT_PUBLIC_JUDGE_WS_URL` | WebSocket URL of the judge | browser |
| `NEXT_PUBLIC_VIBE_IDE_CONTEXT_URL` | endpoint used to load a problem | browser |
| `NEXT_PUBLIC_LSP_*_WS` | proxy route for each language | browser |
| `LSP_AUTH_TOKEN` | private token shared by the IDE and LSP server | server |
| `LSP_SERVER_WS_BASE` | internal URL of `patito-lsp-server` | server |
| `NEXT_PUBLIC_JUDGE_ADAPTER` | active judge API adapter | browser |
| `NEXT_PUBLIC_JUDGE_RUN_ENABLED` | enables custom-input runs | browser |
| `NEXT_PUBLIC_JUDGE_SUBMIT_ENABLED` | enables submissions | browser |
| `NEXT_PUBLIC_JUDGE_POLLING_ENABLED` | enables result polling | browser |
| `NEXT_PUBLIC_JUDGE_WS_ENABLED` | enables WebSocket events | browser |
| `NEXT_PUBLIC_JUDGE_POLLING_INTERVAL_MS` | delay between polling requests | browser |
| `NEXT_PUBLIC_MATHJAX_ENABLED` | enables formulas in statements | browser |
| `NEXT_PUBLIC_MATHJAX_SRC` | URL of the MathJax script | browser |

The `NEXT_PUBLIC_LSP_*_WS` variables should point to `/api/lsp/<language>`. Keep the LSP token in `LSP_AUTH_TOKEN`; do not add the `NEXT_PUBLIC_` prefix.

Every `NEXT_PUBLIC_` value is included in the JavaScript sent to the browser. Never store secrets in those variables.

The `NEXT_PUBLIC_JUDGE_*_ENABLED` flags can turn run, submit, polling, and WebSocket support on or off.

## Commands

```bash
npm run dev         # development server
npm run typecheck   # check TypeScript
npm run build       # production build
npm start           # start the production build
npm run check       # typecheck + build
```

The `lsp:*` commands expect an LSP runtime inside `lsp/`. In this workspace, the server is kept in the neighboring `patito-lsp-server` directory.

## Project structure

```text
.
├── app/                    page, layout, and styles
├── components/
│   ├── ide/                internal editor components
│   ├── CodeEditor.tsx      Monaco editor
│   ├── ProblemStatement.tsx
│   └── TestcasePanel.tsx
├── hooks/                  execution, submission, LSP, and shortcuts
├── lib/                    languages, themes, and helpers
├── lsp/                    Monaco LSP client
├── services/               API clients, downloads, and adapters
├── store/                  Zustand state
├── types/                  shared types
├── public/                 runtime configuration
├── docs/                   judge contract and screenshots
├── .env.example           development variables
├── server.mjs             server and WebSocket proxy
├── next.config.ts
└── package.json
```

The website creates a signed launch link, the IDE requests the problem context from the API, and then it runs or submits the code. Results are received through polling or WebSocket events.

The judge contract is documented in [`docs/judge-api-contract.md`](docs/judge-api-contract.md).

## Docker

```bash
docker build -t patito-ide .
docker run --rm -p 3000:3000 --env-file .env.local patito-ide
```
