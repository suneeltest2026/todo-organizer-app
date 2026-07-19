/**
 * Splits OCR'd text into separate list items. Handles two shapes:
 *  - flowing text with inline markers like "1) ... 2) ... a) ... b) ..."
 *    (common when OCR reads visually-separate cards/lines as one paragraph)
 *  - text that already has real line breaks, one item per line
 */
export function splitIntoListItems(text: string): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  const byMarkers = trimmed
    .split(/(?=(?:^|\s)(?:\d{1,2}[.):]|[a-zA-Z][.):])\s)/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (byMarkers.length > 1) return byMarkers

  const byLines = trimmed
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
  return byLines.length > 1 ? byLines : [trimmed]
}
