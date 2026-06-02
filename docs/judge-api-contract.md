# Contrato API del juez para Vibe IDE

Vibe IDE es agnóstico al juez. Un juez se integra exponiendo este contrato HTTP, o sirviendo `/vibe-config.json` para mapear estas operaciones a rutas equivalentes.

## Configuración en runtime

El navegador primero intenta cargar `/vibe-config.json` desde el mismo origen. Si no existe, se usan las variables de build `NEXT_PUBLIC_*`.

```json
{
  "adapter": "vibe",
  "apiBaseUrl": "http://judge.example/api",
  "wsBaseUrl": "ws://judge.example/api",
  "paths": {
    "context": "/vibe/context",
    "run": "/vibe/runs",
    "runStatus": "/vibe/runs/{id}",
    "submit": "/vibe/submissions",
    "submissionStatus": "/vibe/submissions/{id}",
    "submissionStream": "/vibe/submissions/{id}/events"
  },
  "features": { "run": true, "submit": true, "websocket": false, "polling": true, "lsp": true },
  "mathJax": {
    "enabled": true,
    "src": "http://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
  },
  "pollingIntervalMs": 1500
}
```

## Lanzamiento desde Patito / handoff

En el stack Patito local, el usuario no llama `/vibe/context` directamente. Primero se abre el launch del OJ:

```txt
http://patito.localhost/oj/vibe-ide-launch.php?id=1010
http://patito.localhost/oj/vibe-ide-launch.php?cid=3&pid=0
```

Ese endpoint valida sesión/permisos, crea un token temporal y redirige a:

```txt
http://patito.localhost/ide/?token=<handoff-token>
```

Como atajo local, Vibe IDE acepta:

```txt
http://patito.localhost/ide?id=1010
http://patito.localhost/ide?cid=3&pid=0
```

y redirige al launch del OJ. Tras recibir `token`, el IDE lo guarda en `sessionStorage` y limpia la URL; recargar `/ide/` en la misma sesión vuelve a cargar el último contexto.

## Contexto

```http
GET /vibe/context?token=<handoff-token>
Authorization: Bearer <handoff-token>
```

Respuesta:

```json
{
  "problem": {
    "problemId": "1000",
    "title": "A + B",
    "description": "Calcular $a+b$.",
    "input": "Dos enteros $a$ y $b$.",
    "output": "La suma.",
    "example": { "input": "1 2\n", "output": "3\n" },
    "sections": [
      { "title": "Descripción", "content": "Calcular $a+b$.", "format": "html+latex" }
    ],
    "samples": [{ "input": "1 2\n", "output": "3\n" }],
    "timeLimit": "1s",
    "memoryLimit": "128 MB"
  },
  "languageDefinitions": [
    {
      "id": "cpp17",
      "label": "C++17",
      "judgeLanguageId": 1,
      "judgeLanguage": "cpp17",
      "monacoLanguage": "cpp",
      "extension": "cpp",
      "template": "#include <bits/stdc++.h>\nusing namespace std;\nint main(){}\n"
    }
  ],
  "allowedLanguages": [1],
  "features": { "run": true, "submit": true, "polling": true, "websocket": false }
}
```

`description/input/output/example` se mantienen para jueces simples. Para integraciones nuevas se prefiere usar `sections` y `samples`.

`allowedLanguages` es intencionalmente genérico. Un juez puede enviar IDs numéricos (`[1, 17]`), claves de lenguaje (`["cpp17", "python3"]`) o IDs internos del IDE (`["cpp", "python"]`). Si se usan IDs numéricos, también se debería enviar `languageDefinitions[].judgeLanguageId` para que el IDE pueda deshabilitar localmente las opciones no disponibles. Si ese mapeo no existe, el IDE mantiene los lenguajes seleccionables y deja que la API del juez haga la autorización final, evitando mostrar un falso mensaje de "no permitido".

`features.run` y `features.submit` controlan si el IDE muestra los botones de ejecutar o enviar. `mathJax.src` puede apuntar a un archivo servido por el mismo dominio si el despliegue no debe depender de CDN externo. El contenido enriquecido se sanitiza como HTML y luego se procesa con MathJax, por lo que `sections[].content` puede ser `html+latex`.

## Ejecutar con entrada personalizada

```http
POST /vibe/runs
Authorization: Bearer <handoff-token>
Content-Type: application/json
```

Solicitud:

```json
{
  "sourceCode": "...",
  "language": "cpp17",
  "languageId": 1,
  "stdin": "1 2\n",
  "testcases": []
}
```

La respuesta puede ser inmediata:

```json
{
  "runId": "run-123",
  "result": {
    "id": "run-123",
    "phase": "completed",
    "verdict": "Accepted",
    "stdout": "3\n",
    "stderr": "",
    "compileErrors": "",
    "logs": ["Finished"],
    "runtimeMs": 12,
    "memoryKb": 4096
  }
}
```

O asíncrona:

```json
{ "runId": "run-123", "statusUrl": "/vibe/runs/run-123" }
```

Estado de ejecución:

```http
GET /vibe/runs/{id}
Authorization: Bearer <handoff-token>
```

La respuesta usa la misma forma de `result`/estado que el envío; puede incluir `runId` en vez de `submissionId`.

## Enviar solución

```http
POST /vibe/submissions
Authorization: Bearer <handoff-token>
Content-Type: application/json
```

Respuesta:

```json
{ "submissionId": "sub-123", "statusUrl": "/vibe/submissions/sub-123" }
```

## Estado de envío

```http
GET /vibe/submissions/{id}
Authorization: Bearer <handoff-token>
```

Respuesta:

```json
{
  "submissionId": "sub-123",
  "phase": "running",
  "verdict": "Pending",
  "stdout": "",
  "stderr": "",
  "compileErrors": "",
  "logs": ["Compiling..."]
}
```

Valores válidos para `phase`: `idle`, `queued`, `running`, `completed`, `error`.

## Stream por WebSocket, opcional

Si `features.websocket` es `true`, Vibe se conecta a `submissionStream`; los mensajes usan la misma estructura que Estado.

Si WebSocket no existe o falla, Vibe usa polling como fallback cuando `features.polling` es `true`.
