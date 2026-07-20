/**
 * Splits OCR'd text into separate list items. Handles two shapes:
 *  - flowing text with inline markers like "1) ... 2) ... a) ... b) ..."
 *    (common when OCR reads visually-separate cards/lines as one paragraph)
 *  - text that already has real line breaks, one item per line
 */

// A leading row/list number OCR sometimes leaves attached, e.g. "1 |Cost Allocation..."
const LEADING_MARKER = /^\s*\d{1,2}\s*[|.):]\s*/

// A trailing "1st Priority" / "2nd Priority" style tag from a source table's priority column.
const TRAILING_PRIORITY = /\s*[|,-]?\s*\d{1,2}(st|nd|rd|th)\s+priority\s*$/i

function cleanListItem(item: string): string {
  return item.replace(TRAILING_PRIORITY, '').replace(LEADING_MARKER, '').trim()
}

// When OCR fails to read a table cell's text, all that's left is a stray row
// number ("2", "3", ...) — not a real task, so don't offer it as one.
function isJunkItem(item: string): boolean {
  const cleaned = item.trim()
  if (cleaned.length < 3) return true
  if (!/[a-zA-Z]/.test(cleaned)) return true
  return false
}

export function splitIntoListItems(text: string): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  const byMarkers = trimmed
    .split(/(?=(?:^|\s)(?:\d{1,2}[.):]|[a-zA-Z][.):])\s)/)
    .map((s) => s.trim())
    .filter(Boolean)

  let raw: string[]
  if (byMarkers.length > 1) {
    raw = byMarkers
  } else {
    const byLines = trimmed
      .split(/\r?\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
    raw = byLines.length > 1 ? byLines : [trimmed]
  }

  const cleaned = raw.map(cleanListItem).filter((item) => !isJunkItem(item))
  // If cleaning discarded everything, fall back to the original text rather
  // than silently handing back nothing.
  return cleaned.length > 0 ? cleaned : [trimmed]
}
