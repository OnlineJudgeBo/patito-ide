import type * as Monaco from 'monaco-editor';
import type { LanguageDefinition } from '@/types/ide';

const WORKSPACE_ROOT_URI = 'file:///workspace';

export function lspDocumentFileName(language: LanguageDefinition) {
  // JDTLS expects the public class name to match the Java file name exactly.
  // The default Java template declares `public class Main`, so the document
  // must be exposed to the language server as Main.java, not main.java.
  if (language.id === 'java') return 'Main.java';
  return `main.${language.extension}`;
}

export function fallbackDocumentUri(language: LanguageDefinition) {
  return `${WORKSPACE_ROOT_URI}/${lspDocumentFileName(language)}`;
}

export function modelDocumentUri(model: Monaco.editor.ITextModel, language: LanguageDefinition) {
  // Monaco model URIs can be relative/in-memory (for example `main.java`).
  // Language servers in the Docker bridge run with `/workspace` as root, so
  // keep the JSON-RPC document URI stable and inside that workspace.
  return fallbackDocumentUri(language);
}
