const ALLOWED_TAGS = new Set([
  'a', 'abbr', 'b', 'blockquote', 'br', 'code', 'dd', 'del', 'div', 'dl', 'dt', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'hr', 'i', 'img', 'kbd', 'li', 'mark', 'ol', 'p', 'pre', 's', 'small', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td',
  'tfoot', 'th', 'thead', 'tr', 'u', 'ul', 'var',
]);

const URI_ATTRS = new Set(['href', 'src']);
const ALLOWED_ATTRS = new Set(['alt', 'class', 'colspan', 'height', 'href', 'rowspan', 'src', 'style', 'target', 'title', 'width']);
const ALLOWED_STYLE_PROPS = new Set(['font-weight', 'font-style', 'text-align', 'text-decoration', 'margin', 'margin-bottom', 'margin-top', 'padding-left']);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


type ProtectedLatex = {
  readonly token: string;
  readonly source: string;
};

const LATEX_PATTERNS = [
  /\$\$[\s\S]+?\$\$/g,
  /\\\[[\s\S]+?\\\]/g,
  /\\\([\s\S]+?\\\)/g,
  /(?<!\\)\$(?!\s)(?:\\.|[^$\\\n]){1,300}?(?<!\\)\$/g,
] as const;

function nextLatexToken(segments: readonly ProtectedLatex[]) {
  return `VIBE_LATEX_${segments.length}_TOKEN`;
}

function protectLatex(value: string): { readonly text: string; readonly segments: readonly ProtectedLatex[] } {
  const segments: ProtectedLatex[] = [];
  let text = value;

  for (const pattern of LATEX_PATTERNS) {
    text = text.replace(pattern, (source: string) => {
      const token = nextLatexToken(segments);
      segments.push({ token, source });
      return token;
    });
  }

  text = protectUndelimitedLatex(text, segments);
  return { text, segments };
}

const INLINE_LATEX_COMPARATORS = String.raw`\\(?:leq|le|geq|ge|neq|ne|lt|gt|times|cdot|equiv|approx)`;
const INLINE_LATEX_ATOM = String.raw`(?:[A-Za-z0-9]+(?:_[A-Za-z0-9{}]+)?(?:\^[A-Za-z0-9{}]+)?|\{[^{}]+\}|[+\-]?\d+(?:\.\d+)?)`;
const INLINE_LATEX_CHAIN = new RegExp(`${INLINE_LATEX_ATOM}(?:\\s*${INLINE_LATEX_COMPARATORS}\\s*${INLINE_LATEX_ATOM})+`, 'g');
const LATEX_COMMAND_EXPRESSION = /\\(?:sum|prod|frac|sqrt|lim|log|ln|sin|cos|tan|min|max|gcd|lcm|binom|left|right|infty|dots|ldots|cdots|rightarrow|leftarrow|forall|exists|in|notin|subseteq|subset|cup|cap)(?:\s*(?:\{[^{}]*\}|_[A-Za-z0-9{}=+\-]+|\^[A-Za-z0-9{}=+\-]+|[A-Za-z0-9=+\-*/.,()]+)){0,8}/g;

function protectUndelimitedLatex(value: string, segments: ProtectedLatex[]) {
  return value
    .split(/(<[^>]+>)/g)
    .map((part) => (part.startsWith('<') && part.endsWith('>') ? part : protectLatexInText(part, segments)))
    .join('');
}

function protectLatexInText(value: string, segments: ProtectedLatex[]) {
  return value
    .replace(INLINE_LATEX_CHAIN, (source: string) => wrapUndelimitedLatex(source, segments))
    .replace(LATEX_COMMAND_EXPRESSION, (source: string) => wrapUndelimitedLatex(source, segments));
}

function wrapUndelimitedLatex(source: string, segments: ProtectedLatex[]) {
  const trimmed = source.trim();
  if (!trimmed || /^VIBE_LATEX_\d+_TOKEN$/.test(trimmed)) return source;
  const leading = source.match(/^\s*/)?.[0] ?? '';
  const trailing = source.match(/\s*$/)?.[0] ?? '';
  const token = nextLatexToken(segments);
  segments.push({ token, source: `$${trimmed}$` });
  return `${leading}${token}${trailing}`;
}

function restoreLatex(value: string, segments: readonly ProtectedLatex[]) {
  return segments.reduce((html, segment) => html.replaceAll(segment.token, escapeHtml(segment.source)), value);
}

function hasHtmlOrEntity(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value) || /&(?:[a-z]+|#\d+|#x[\da-f]+);/i.test(value);
}

function normalizeInlineMarkdown(html: string) {
  return html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function sanitizeStyle(style: string) {
  return style
    .split(';')
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const [rawProperty, ...rawValue] = declaration.split(':');
      const property = rawProperty?.trim().toLowerCase();
      const value = rawValue.join(':').trim();
      if (!property || !value || !ALLOWED_STYLE_PROPS.has(property)) return undefined;
      if (/url\s*\(|expression\s*\(|javascript:/i.test(value)) return undefined;
      return `${property}: ${value}`;
    })
    .filter(Boolean)
    .join('; ');
}

function sanitizeElement(element: Element, document: Document): Node {
  const tagName = element.tagName.toLowerCase();
  if (!ALLOWED_TAGS.has(tagName)) {
    const fragment = document.createDocumentFragment();
    for (const child of Array.from(element.childNodes)) fragment.appendChild(sanitizeNode(child, document));
    return fragment;
  }

  const clean = document.createElement(tagName);
  for (const attr of Array.from(element.attributes)) {
    const name = attr.name.toLowerCase();
    const value = attr.value.trim();
    if (name.startsWith('on') || !ALLOWED_ATTRS.has(name)) continue;
    if (URI_ATTRS.has(name) && /^(?:javascript|data):/i.test(value)) continue;
    if (name === 'style') {
      const safeStyle = sanitizeStyle(value);
      if (safeStyle) clean.setAttribute('style', safeStyle);
      continue;
    }
    clean.setAttribute(name, value);
  }

  if (tagName === 'a') {
    clean.setAttribute('rel', 'noopener noreferrer');
    if (!clean.getAttribute('target')) clean.setAttribute('target', '_blank');
  }

  for (const child of Array.from(element.childNodes)) clean.appendChild(sanitizeNode(child, document));
  return clean;
}

function sanitizeNode(node: Node, document: Document): Node {
  if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent ?? '');
  if (node.nodeType === Node.ELEMENT_NODE) return sanitizeElement(node as Element, document);
  return document.createTextNode('');
}

function sanitizeHtml(html: string) {
  const template = document.createElement('template');
  template.innerHTML = html;
  const fragment = document.createDocumentFragment();
  for (const child of Array.from(template.content.childNodes)) fragment.appendChild(sanitizeNode(child, document));
  const container = document.createElement('div');
  container.appendChild(fragment);
  return container.innerHTML;
}

export function toSafeRichHtml(value: string) {
  const { text, segments } = protectLatex(value);
  if (typeof document === 'undefined') return restoreLatex(escapeHtml(text), segments);

  const html = hasHtmlOrEntity(text) ? text : escapeHtml(text);
  return restoreLatex(normalizeInlineMarkdown(sanitizeHtml(html)), segments);
}
