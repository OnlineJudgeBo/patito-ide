export class HttpRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'HttpRequestError';
  }
}

async function readErrorMessage(response: Response) {
  const raw = await response.text();
  if (!raw) return `HTTP request failed with ${response.status}`;
  try {
    const parsed = JSON.parse(raw) as { message?: unknown; error?: unknown; title?: unknown; code?: unknown };
    const message = typeof parsed.message === 'string' ? parsed.message : typeof parsed.error === 'string' ? parsed.error : typeof parsed.title === 'string' ? parsed.title : raw;
    const code = typeof parsed.code === 'string' ? parsed.code : undefined;
    return { message, code };
  } catch {
    return raw;
  }
}

export async function requestJson<TResponse>(url: string, init?: RequestInit): Promise<TResponse> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const error = await readErrorMessage(response);
    const message = typeof error === 'string' ? error : error.message;
    const code = typeof error === 'string' ? undefined : error.code;
    throw new HttpRequestError(message || `HTTP request failed with ${response.status}`, response.status, code);
  }

  return (await response.json()) as TResponse;
}
