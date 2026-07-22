# Patito IDE

Editor de código que se abre desde los problemas de Patito. Permite leer el enunciado, probar una solución con distintas entradas y enviarla al juez.

Usa Next.js, React, TypeScript, Monaco Editor y Zustand. `server.mjs` levanta Next.js y también hace de proxy para los WebSocket del LSP.

## Desarrollo

Se necesita Node.js 20 o superior. La imagen Docker usa Node.js 22.

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Abre <http://localhost:3000>. Con `NEXT_PUBLIC_BASE_PATH=/ide`, abre <http://localhost:3000/ide/>.

Para ejecución real también deben estar levantados la API y `patito-lsp-server`.

## Dependencias

El IDE puede abrir la interfaz por sí solo, pero cada parte depende de otro servicio:

| Función | Servicio |
| --- | --- |
| cargar el problema | `onlineJudgeAdmin-back` |
| ejecutar y enviar | `onlineJudgeAdmin-back` y `core` |
| autocompletado y diagnósticos | `patito-lsp-server` |
| abrir el IDE desde la web | `patito-client-web` |

Para probar el flujo entero, desde la raíz del workspace:

```bash
docker compose up -d --build
```

El Compose espera que la API y el LSP estén disponibles antes de iniciar el IDE.

## Variables básicas

```env
NEXT_PUBLIC_JUDGE_API_URL=http://localhost:8080
NEXT_PUBLIC_JUDGE_WS_URL=ws://localhost:8080
NEXT_PUBLIC_VIBE_IDE_CONTEXT_URL=http://localhost:8080/api/vibe/context

LSP_AUTH_TOKEN=change-me
LSP_SERVER_WS_BASE=ws://127.0.0.1:3001
```

| Variable | Uso | Dónde se usa |
| --- | --- | --- |
| `NEXT_PUBLIC_JUDGE_API_URL` | URL HTTP de la API | navegador |
| `NEXT_PUBLIC_JUDGE_WS_URL` | URL WebSocket del juez | navegador |
| `NEXT_PUBLIC_VIBE_IDE_CONTEXT_URL` | endpoint que carga el problema | navegador |
| `NEXT_PUBLIC_LSP_*_WS` | rutas proxy de cada lenguaje | navegador |
| `LSP_AUTH_TOKEN` | token privado entre el IDE y el LSP | servidor |
| `LSP_SERVER_WS_BASE` | URL interna de `patito-lsp-server` | servidor |
| `NEXT_PUBLIC_JUDGE_ADAPTER` | adaptador de API activo | navegador |
| `NEXT_PUBLIC_JUDGE_RUN_ENABLED` | habilita ejecución con entrada | navegador |
| `NEXT_PUBLIC_JUDGE_SUBMIT_ENABLED` | habilita envíos | navegador |
| `NEXT_PUBLIC_JUDGE_POLLING_ENABLED` | habilita consulta periódica | navegador |
| `NEXT_PUBLIC_JUDGE_WS_ENABLED` | habilita eventos por WebSocket | navegador |
| `NEXT_PUBLIC_JUDGE_POLLING_INTERVAL_MS` | intervalo del polling | navegador |
| `NEXT_PUBLIC_MATHJAX_ENABLED` | habilita fórmulas del enunciado | navegador |
| `NEXT_PUBLIC_MATHJAX_SRC` | URL del script de MathJax | navegador |

Las variables `NEXT_PUBLIC_LSP_*_WS` apuntan a `/api/lsp/<lenguaje>`. El token del LSP es privado: déjalo en `LSP_AUTH_TOKEN`, sin el prefijo `NEXT_PUBLIC_`.

Todo lo que empieza con `NEXT_PUBLIC_` termina dentro del JavaScript que recibe el navegador. No pongas secretos en esas variables.

Las opciones `NEXT_PUBLIC_JUDGE_*_ENABLED` activan o desactivan ejecución, envío, polling y WebSocket.

## Comandos

```bash
npm run dev         # desarrollo
npm run typecheck   # revisa TypeScript
npm run build       # build de producción
npm start           # inicia el build
npm run check       # typecheck + build
```

Los comandos `lsp:*` esperan un runtime dentro de `lsp/`. En este workspace el servidor está en la carpeta vecina `patito-lsp-server`.

## Estructura del proyecto

```text
.
├── app/                    página, layout y estilos
├── components/
│   ├── ide/                componentes internos del editor
│   ├── CodeEditor.tsx      Monaco
│   ├── ProblemStatement.tsx
│   └── TestcasePanel.tsx
├── hooks/                  ejecución, envío, LSP y atajos
├── lib/                    lenguajes, temas y helpers
├── lsp/                    cliente LSP de Monaco
├── services/               API, descargas y adaptadores
├── store/                  estado Zustand
├── types/                  tipos compartidos
├── public/                 configuración runtime
├── docs/                   contrato del juez y capturas
├── .env.example           variables para desarrollo
├── server.mjs             servidor y proxy WebSocket
├── next.config.ts
└── package.json
```

El flujo es: la web genera un enlace firmado, el IDE pide el contexto a la API y luego ejecuta o envía el código. El resultado llega por polling o WebSocket.

El contrato del juez está en [`docs/judge-api-contract.md`](docs/judge-api-contract.md).

## Docker

```bash
docker build -t patito-ide .
docker run --rm -p 3000:3000 --env-file .env.local patito-ide
```
