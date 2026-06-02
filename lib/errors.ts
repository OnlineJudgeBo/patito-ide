import { HttpRequestError } from '@/services/http-client';

export function errorMessage(error: unknown, defaultMessage: string) {
  if (error instanceof HttpRequestError) {
    if (error.status === 401) return 'Tu sesión/token del IDE expiró o no es válido. Vuelve a abrir Vibe desde el juez.';
    if (error.status === 403) return 'No tienes permiso para ejecutar o enviar este problema/lenguaje.';
    if (error.status === 404) return 'El recurso solicitado no existe en el API del juez.';
    if (error.status >= 500) return `El API del juez falló (${error.status}). ${error.message}`;
  }
  return error instanceof Error ? error.message : defaultMessage;
}
