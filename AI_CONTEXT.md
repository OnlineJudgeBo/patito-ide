# AI_CONTEXT.md — patito-ide

Contexto para asistentes de IA. Complementa `README.md`/`README.es.md` (documentación humana) y `docs/judge-api-contract.md` (contrato HTTP del juez, ya en español y muy completo — no se duplica aquí, se referencia).

## Qué es

IDE web (Next.js 15 + React 19 + Monaco) que se abre embebido/enlazado desde el portal para resolver un problema puntual: carga el enunciado, permite ejecutar con entrada personalizada o enviar la solución, y da soporte de lenguaje (autocompletado, diagnósticos) vía LSP. Es **agnóstico al juez que lo integra**: habla un contrato HTTP genérico (`/vibe/*`, ver `docs/judge-api-contract.md`) y no conoce las rutas reales de `onlinejudgebo-admin-api` — solo conoce las rutas del contrato `vibe`, que la API implementa detrás de un prefijo propio (`/api/patito-ide/context`, etc., ver `AI_CONTEXT.md` de `onlinejudgebo-admin-api`).

Encaja en el workspace así: `Portal/Admin → genera o recibe un link firmado → patito-ide (este repo) → API del juez (contrato vibe) → LSP bridge (patito-lsp-server) para autocompletado`.

## Arquitectura interna

- `app/` — página y layout de Next.js (App Router), un solo punto de montaje del IDE.
- `components/` — Monaco, enunciado, panel de ejecución/resultados, header/sidebar/diálogos/toasts (`components/ide/`).
- `hooks/` — contexto del problema, ejecución (`judge/use-run-action.ts`), envío (`judge/use-submit-action.ts`), polling/WebSocket de estado (`use-execution-socket.ts`), conexión LSP.
- `lib/` — lenguajes, temas Monaco, normalización de datos, storage local.
- `lib/lsp/` y `lsp/` — dos árboles de integración LSP (cliente/adaptador Monaco) parcialmente duplicados; ver "Riesgos" abajo.
- `services/` — cliente HTTP (`http-client.ts`), config runtime (`runtime-config.ts`), contexto del problema (`vibe-context-api.ts`), adaptadores del juez (`judge-adapters/`, patrón factory: hoy solo existe `vibe-adapter.ts` + `mock-adapter.ts`).
- `store/` — Zustand, dividido por slice (problema, lenguaje/código, casos de prueba, ejecución/envío, UI). `launchToken` vive acá.
- `server.mjs` — servidor real del proceso: envuelve el handler de Next.js y además acepta upgrades WebSocket para el proxy LSP.

## Lo que EXPONE este proyecto

`server.mjs` es un servidor HTTP+WS único:

| Ruta | Protocolo | Descripción |
| --- | --- | --- |
| `/*` (todo lo no-LSP) | HTTP | Delegado íntegro al handler de Next.js (`app.getRequestHandler()`), incluida la página del IDE. |
| `/api/lsp/{java\|cpp\|python\|js\|rust\|go}` | WebSocket (upgrade) | Proxy transparente: reenvía la conexión del navegador hacia `patito-lsp-server` (`LSP_SERVER_WS_BASE`, default `ws://127.0.0.1:3001/lsp/{language}`), agregando `Authorization: Bearer ${LSP_AUTH_TOKEN}` **del lado servidor**. El navegador nunca ve ese token — solo abre WS a `/api/lsp/:lang` sin credenciales propias. Si `LSP_AUTH_TOKEN` no está configurado, la conexión se cierra con código 1011. |

No hay más rutas HTTP propias: todo lo demás (`/vibe-config.json`, assets, etc.) lo sirve Next.js como estático/API route dentro de `app/`.

## Lo que CONSUME (contrato `vibe`, ver docs/judge-api-contract.md para el detalle completo)

Config runtime: primero intenta `GET {basePath}/vibe-config.json` (mismo origen); si no existe, cae a variables `NEXT_PUBLIC_*` (`services/runtime-config.ts`). Ahí se resuelven `apiBaseUrl`, `contextUrl`, y el mapa `paths`.

| Función / archivo | Método + ruta (default) | Uso |
| --- | --- | --- |
| `fetchVibeLaunchContext` (`services/vibe-context-api.ts`) | `GET {contextUrl                                                                    ?? /vibe/context}?token=` | Trae enunciado, lenguajes permitidos, features. Se llama una vez al montar con el `token` recibido por handoff. |
| `judge-adapters/vibe-adapter.ts` → `run` | `POST /vibe/custom-input` | Ejecutar con input personalizado. |
| → `runStatus` | `GET /vibe/runs/{id}` | Poll de una ejecución. |
| → `submit` | `POST /vibe/submissions` | Enviar solución real. |
| → `submissionStatus` | `GET /vibe/submissions/{id}` | Poll de un envío. |
| → `streamUrl` | `WS /vibe/submissions/{id}/events` | Solo si `features.websocket` es `true`; si no, se usa polling. |

Todas las llamadas (excepto el proxy LSP) van con `Authorization: Bearer <launchToken>` — el mismo token recibido por query string, guardado en `sessionStorage`/store Zustand (`launchToken`), nunca decodificado ni verificado localmente: el IDE es agnóstico de cómo se firmó, solo lo reenvía.

### Flujo del token de lanzamiento

`patito-ide` **no llama a ningún endpoint para obtener el token** — lo recibe ya emitido. En el stack local histórico, un launcher PHP (`vibe-ide-launch.php`, fuera de este workspace) validaba sesión y redirigía a `/ide/?token=<jwt>`. En el stack actual, `juezvirtualbo-client-front` obtiene ese token llamando a `POST /api/patito-ide/launch-token` en la API (endpoint agregado recién en esta sesión, ver `onlinejudgebo-admin-api` PR `fix/ide-launch-token-server-side`) y arma la URL de handoff (`buildIdeUrl` en `ideIntegration.ts` de ese repo). Para `patito-ide` esto es transparente: solo le importa que llegue `?token=` en la URL; la validación real del JWT ocurre server-side en `onlinejudgebo-admin-api` (`IdeLaunchTokenValidator`) cuando el IDE hace sus llamadas `/vibe/*`.

## Variables de entorno relevantes

- `PORT`, `HOST`, `VIBE_IDE_BASE_PATH` / `NEXT_PUBLIC_BASE_PATH` — normalmente `/ide`.
- `LSP_SERVER_WS_BASE` — base WS del bridge LSP (`patito-lsp-server`), default `ws://127.0.0.1:3001`.
- `LSP_AUTH_TOKEN` — secreto compartido con `patito-lsp-server`; **solo se usa en `server.mjs` (lado servidor)**, correcto: nunca se expone como `NEXT_PUBLIC_*`.
- `NEXT_PUBLIC_JUDGE_ADAPTER`, `NEXT_PUBLIC_JUDGE_API_URL`, `NEXT_PUBLIC_JUDGE_WS_URL`, `NEXT_PUBLIC_VIBE_IDE_CONTEXT_URL`, `NEXT_PUBLIC_JUDGE_*_ENABLED`, `NEXT_PUBLIC_MATHJAX_*` — configuración pública del adaptador `vibe`, o se sobreescriben en runtime vía `/vibe-config.json`.

## Riesgos/brechas observadas

- **Duplicación LSP**: existen `lib/lsp/` y `lsp/` como dos árboles de integración LSP en paralelo (ya señalado en `ARCHITECTURE.md` de la raíz del workspace, punto 4 de brechas). No se investigó a fondo el solape exacto en esta pasada — si se toca el cliente LSP, revisar ambos árboles.
- **Sin verificación local del token**: el IDE confía ciegamente en el `token` de la URL y lo reenvía tal cual; toda la seguridad recae en que la API rechace tokens inválidos/expirados. Es el diseño esperado (agnosticismo de juez), pero vale la pena que quien toque el flujo de auth lo tenga presente.
- **Sin suite de tests** detectada (coincide con `INVENTORY.md`): cualquier cambio en `server.mjs` (proxy WS) o en `judge-adapters/` no tiene red de seguridad automatizada.
