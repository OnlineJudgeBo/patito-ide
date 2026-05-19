# Vibe IDE LSP runtime

This folder has two parts:

- frontend LSP client code used by Monaco: `browser-client.ts`, `monaco-adapter.ts`, `integrations/*`.
- a Dockerized WebSocket-to-stdio bridge: `server/` plus `Dockerfile` and `docker-compose.yml`.

The browser connects to WebSocket routes and the bridge starts the real language server process behind each route.

## Routes

| Route | Language server |
| --- | --- |
| `ws://localhost:3001/lsp/java` | Eclipse JDT Language Server (`jdtls`) |
| `ws://localhost:3001/lsp/cpp` | `clangd` |
| `ws://localhost:3001/lsp/python` | `pyright-langserver --stdio` |
| `ws://localhost:3001/lsp/js` | `typescript-language-server --stdio` |
| `ws://localhost:3001/lsp/rust` | `rust-analyzer` |
| `ws://localhost:3001/lsp/go` | `gopls serve` |

## Run with Docker Compose

From the repository root:

```bash
docker compose -f lsp/docker-compose.yml up --build
```

The Docker image installs official Go and Eclipse Temurin Java runtimes instead of Debian's older packages. Current `gopls` needs a modern Go toolchain, and current `jdtls` requires Java 21+. You can override build versions if needed:

```bash
docker compose -f lsp/docker-compose.yml build \
  --build-arg GO_VERSION=1.24.10 \
  --build-arg GOPLS_VERSION=v0.21.1 \
  --build-arg JAVA_VERSION=21
```

Then run the Next.js app in another terminal:

```bash
npm run dev
```

## Faster Docker builds with local storage

The Docker image can install Go, Java and JDTLS from local archives in `lsp/storage/` instead of downloading them on every uncached rebuild.

First populate the cache:

```bash
npm run lsp:cache
```

Then build normally:

```bash
npm run lsp:up
```

Expected cache filenames are documented in `storage/README.md`. Docker named volumes are useful at runtime, but they are not available during `docker build`, so the build cache must live in this folder or in Docker/BuildKit's own layer cache.

Your `.env.local` should contain:

```env
NEXT_PUBLIC_LSP_JAVA_WS="ws://localhost:3001/lsp/java"
NEXT_PUBLIC_LSP_CPP_WS="ws://localhost:3001/lsp/cpp"
NEXT_PUBLIC_LSP_PYTHON_WS="ws://localhost:3001/lsp/python"
NEXT_PUBLIC_LSP_JAVASCRIPT_WS="ws://localhost:3001/lsp/js"
NEXT_PUBLIC_LSP_RUST_WS="ws://localhost:3001/lsp/rust"
NEXT_PUBLIC_LSP_GO_WS="ws://localhost:3001/lsp/go"
```

## Health check

```bash
curl http://localhost:3001/healthz
```

Expected response:

```json
{"ok":true,"languages":["java","cpp","python","js","rust","go"]}
```

## Override commands

The bridge uses sane defaults, but every language server command can be overridden with environment variables:

- `LSP_JAVA_COMMAND`, `LSP_JAVA_ARGS`
- `LSP_CPP_COMMAND`, `LSP_CPP_ARGS`
- `LSP_PYTHON_COMMAND`, `LSP_PYTHON_ARGS`
- `LSP_JAVASCRIPT_COMMAND`, `LSP_JAVASCRIPT_ARGS`
- `LSP_RUST_COMMAND`, `LSP_RUST_ARGS`
- `LSP_GO_COMMAND`, `LSP_GO_ARGS`

Example:

```bash
LSP_CPP_ARGS="--background-index --clang-tidy" npm start
```

## Workspace

The compose file mounts `lsp/server/workspace` to `/workspace` in the container. Monaco opens files like `file:///workspace/main.cpp` and `file:///workspace/Main.java`.

JDTLS uses a separate internal Eclipse workspace at `/tmp/jdtls-workspace`. Keep it outside `/workspace`; otherwise JDTLS cannot create its invisible project for single-file Java documents and Java completions such as `Integer.` can return empty results.
