import type * as Monaco from 'monaco-editor';

type MonacoApi = typeof Monaco;

type SnippetDefinition = {
  label: string;
  detail: string;
  insertText: string;
};

const registeredLanguages = new Set<string>();

const baseSnippets: Record<string, SnippetDefinition[]> = {
  cpp: [
    { label: 'fast-io', detail: 'Competitive C++ fast IO', insertText: 'ios::sync_with_stdio(false);\ncin.tie(nullptr);' },
    { label: 'vector<int>', detail: 'Vector declaration', insertText: 'vector<int> ${1:a}(${2:n});' },
    { label: 'sort-all', detail: 'Sort whole vector/container', insertText: 'sort(${1:v}.begin(), ${1:v}.end());' },
    { label: 'bfs', detail: 'Queue BFS skeleton', insertText: 'queue<int> q;\nvector<int> dist(${1:n}, -1);\ndist[${2:start}] = 0;\nq.push(${2:start});\nwhile (!q.empty()) {\n\tint u = q.front(); q.pop();\n\tfor (int v : ${3:adj}[u]) {\n\t\tif (dist[v] != -1) continue;\n\t\tdist[v] = dist[u] + 1;\n\t\tq.push(v);\n\t}\n}' },
  ],
  python: [
    { label: 'read-tokens', detail: 'Read stdin tokens', insertText: 'import sys\n\ndata = sys.stdin.read().strip().split()\nit = iter(data)\n${0}' },
    { label: 'next-int', detail: 'Parse next int', insertText: '${1:n} = int(next(it))' },
    { label: 'for-range', detail: 'Python range loop', insertText: 'for ${1:i} in range(${2:n}):\n\t${0}' },
  ],
  java: [
    { label: 'main-class', detail: 'Online judge Main class', insertText: 'import java.io.*;\nimport java.util.*;\n\npublic class Main {\n\tpublic static void main(String[] args) throws Exception {\n\t\t${0}\n\t}\n}' },
    { label: 'import-scanner', detail: 'Import java.util.Scanner', insertText: 'import java.util.Scanner;' },
    { label: 'scanner-setup', detail: 'Create Scanner for stdin', insertText: 'Scanner ${1:sc} = new Scanner(System.in);' },
    { label: 'scanner-next-int', detail: 'Read int with Scanner', insertText: 'int ${1:n} = ${2:sc}.nextInt();' },
    { label: 'scanner-next-line', detail: 'Read line with Scanner', insertText: 'String ${1:s} = ${2:sc}.nextLine();' },
    { label: 'arraylist', detail: 'ArrayList<Integer>', insertText: 'ArrayList<Integer> ${1:list} = new ArrayList<>();' },
    { label: 'fast-scanner', detail: 'FastScanner skeleton for faster online judge input', insertText: 'static class FastScanner {\n\tprivate final InputStream in = System.in;\n\tprivate final byte[] buffer = new byte[1 << 16];\n\tprivate int ptr = 0, len = 0;\n\tprivate int read() throws IOException {\n\t\tif (ptr >= len) {\n\t\t\tlen = in.read(buffer);\n\t\t\tptr = 0;\n\t\t\tif (len <= 0) return -1;\n\t\t}\n\t\treturn buffer[ptr++];\n\t}\n\tint nextInt() throws IOException {\n\t\tint c, sign = 1, val = 0;\n\t\tdo { c = read(); } while (c <= \' \' && c != -1);\n\t\tif (c == \'-\') { sign = -1; c = read(); }\n\t\twhile (c > \' \') { val = val * 10 + c - \'0\'; c = read(); }\n\t\treturn val * sign;\n\t}\n}' },
  ],
  javascript: [
    { label: 'node-input', detail: 'Read stdin in Node.js', insertText: "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);\nlet idx = 0;\n${0}" },
    { label: 'next-number', detail: 'Parse next number', insertText: 'const ${1:n} = Number(input[idx++]);' },
  ],
  rust: [
    { label: 'read-stdin', detail: 'Read all stdin', insertText: 'let mut input = String::new();\nstd::io::stdin().read_to_string(&mut input).unwrap();\nlet mut it = input.split_whitespace();' },
    { label: 'parse-i64', detail: 'Parse next i64 token', insertText: 'let ${1:n}: i64 = it.next().unwrap().parse().unwrap();' },
  ],
  go: [
    { label: 'bufio', detail: 'Buffered IO', insertText: 'in := bufio.NewReader(os.Stdin)\nout := bufio.NewWriter(os.Stdout)\ndefer out.Flush()' },
    { label: 'scan-int', detail: 'Scan integer', insertText: 'var ${1:n} int\nfmt.Fscan(in, &${1:n})' },
  ],
};

const scannerMethodSnippets: SnippetDefinition[] = [
  { label: 'nextInt()', detail: 'Scanner: read int', insertText: 'nextInt()' },
  { label: 'nextLong()', detail: 'Scanner: read long', insertText: 'nextLong()' },
  { label: 'nextDouble()', detail: 'Scanner: read double', insertText: 'nextDouble()' },
  { label: 'next()', detail: 'Scanner: read next token', insertText: 'next()' },
  { label: 'nextLine()', detail: 'Scanner: read full line', insertText: 'nextLine()' },
  { label: 'hasNext()', detail: 'Scanner: check token exists', insertText: 'hasNext()' },
  { label: 'hasNextInt()', detail: 'Scanner: check int exists', insertText: 'hasNextInt()' },
  { label: 'close()', detail: 'Scanner: close input stream', insertText: 'close()' },
];

function hasScannerImport(source: string) {
  return /import\s+java\.util\.(Scanner|\*)\s*;/.test(source);
}

function scannerVariables(source: string) {
  return [...source.matchAll(/\bScanner\s+([A-Za-z_$][\w$]*)\s*=\s*new\s+Scanner\s*\(/g)].map((match) => match[1]);
}

function wordRange(monaco: MonacoApi, model: Monaco.editor.ITextModel, position: Monaco.Position) {
  const word = model.getWordUntilPosition(position);
  return new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
}

function toCompletionItem(monaco: MonacoApi, snippet: SnippetDefinition, range: Monaco.IRange) {
  return {
    label: snippet.label,
    kind: monaco.languages.CompletionItemKind.Snippet,
    detail: snippet.detail,
    insertText: snippet.insertText,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
  };
}

function javaContextualSuggestions(monaco: MonacoApi, model: Monaco.editor.ITextModel, position: Monaco.Position) {
  const source = model.getValue();
  const range = wordRange(monaco, model, position);
  const linePrefix = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
  const variables = scannerVariables(source);
  const receiver = linePrefix.match(/([A-Za-z_$][\w$]*)\.\w*$/)?.[1];

  if (receiver && variables.includes(receiver)) {
    return scannerMethodSnippets.map((snippet) => toCompletionItem(monaco, snippet, range));
  }

  if (!hasScannerImport(source)) {
    return [
      toCompletionItem(monaco, { label: 'import java.util.Scanner', detail: 'Add Scanner import', insertText: 'import java.util.Scanner;' }, range),
      toCompletionItem(monaco, { label: 'scanner-with-import', detail: 'Import Scanner and create stdin scanner', insertText: 'import java.util.Scanner;\n\nScanner ${1:sc} = new Scanner(System.in);' }, range),
    ];
  }

  return variables.flatMap((name) =>
    ['nextInt', 'nextLong', 'nextDouble', 'next', 'nextLine'].map((method) =>
      toCompletionItem(
        monaco,
        {
          label: `${name}.${method}()`,
          detail: `Scanner variable ${name}: ${method}`,
          insertText: `${name}.${method}()`,
        },
        range,
      ),
    ),
  );
}

export function registerCompetitiveCompletions(monaco: MonacoApi) {
  Object.entries(baseSnippets).forEach(([monacoLanguage, snippets]) => {
    if (registeredLanguages.has(monacoLanguage)) return;
    registeredLanguages.add(monacoLanguage);

    monaco.languages.registerCompletionItemProvider(monacoLanguage, {
      triggerCharacters: ['.', '#', '<', '(', ' ', 'S'],
      provideCompletionItems: (model, position) => {
        const range = wordRange(monaco, model, position);
        const suggestions = snippets.map((snippet) => toCompletionItem(monaco, snippet, range));

        if (monacoLanguage === 'java') {
          suggestions.push(...javaContextualSuggestions(monaco, model, position));
        }

        return { suggestions };
      },
    });
  });
}
