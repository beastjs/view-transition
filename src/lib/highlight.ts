const KEYWORDS = new Set([
  'import', 'from', 'module', 'setup', 'component', 'props', 'if', 'elseif', 'else', 'each', 'in', 'key', 'empty',
  'try', 'pending', 'catch', 'switch', 'case', 'default', 'scope', 'fragment', 'style', 'const', 'let', 'return',
  'async', 'await', 'function', 'interface', 'type', 'for', 'of', 'new', 'true', 'false', 'null', 'undefined'
])

const VT_API = new Set(['ViewTransition', 'startTransition', 'addTransitionType', 'useTransition', 'ViewTransitionInstance'])

const TOKEN = /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b([A-Za-z_$][\w$]*)\b/g

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Tiny BTSX-aware highlighter: comments, strings, keywords, components, and the VT API. */
export function highlight(source: string): string {
  let out = ''
  let last = 0
  for (const match of source.matchAll(TOKEN)) {
    const index = match.index ?? 0
    out += escapeHtml(source.slice(last, index))
    const [text, comment, string, word] = match
    if (comment !== undefined) out += `<span class="tok-cmt">${escapeHtml(text)}</span>`
    else if (string !== undefined) out += `<span class="tok-str">${escapeHtml(text)}</span>`
    else if (word !== undefined && VT_API.has(word)) out += `<span class="tok-vt">${text}</span>`
    else if (word !== undefined && KEYWORDS.has(word)) out += `<span class="tok-kw">${text}</span>`
    else if (word !== undefined && /^[A-Z]/.test(word)) out += `<span class="tok-tag">${text}</span>`
    else out += escapeHtml(text)
    last = index + text.length
  }
  return out + escapeHtml(source.slice(last))
}
