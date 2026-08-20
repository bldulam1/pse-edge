/**
 * Decodes HTML entities in a string.
 * Handles named entities (&amp;, &lt;, &gt;, &quot;, &apos;, &nbsp;)
 * and numeric entities (&#39;, &#x27;).
 */
export const unEntity = (str: string): string => {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
}

/**
 * Converts a space-separated or TitleCase string to camelCase.
 * Example: "Corporate Name" → "corporateName"
 */
export const camelCase = (str: string): string => {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (/\s+/.test(match)) return ''
    return index === 0 ? match.toLowerCase() : match.toUpperCase()
  })
}

/**
 * Validates that a stock symbol is a non-empty alphanumeric string.
 */
export const validateSymbol = (symbol: string): string => {
  const trimmed = symbol.trim()
  if (!trimmed || !/^[a-zA-Z0-9]+$/.test(trimmed)) {
    throw new Error(`Invalid stock symbol: "${symbol}"`)
  }
  return trimmed.toUpperCase()
}
