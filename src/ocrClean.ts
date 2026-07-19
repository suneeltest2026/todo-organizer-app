/**
 * Best-effort cleanup of OCR'd text from photos of emails/messages/screenshots.
 * Strips common noise that isn't part of the actual message: legal disclaimers,
 * email signature blocks (name/title/phone/address), and mail-app UI chrome
 * (button labels, timestamps, "To You" headers) that OCR often picks up
 * alongside the real content.
 */

const DISCLAIMER_TRIGGERS =
  /\b(disclaimer\s*:|this e-?mail (and|is)\b|confidential and (is )?belongs? to the intended|intended (recipient|receiver)|please (advise|notify) the sender|do not (copy|distribute|store)\b)/i

const SIGN_OFF_TRIGGERS =
  /\b(thanks|thks|regards|best regards|kind regards|warm regards|sincerely|yours truly|cheers)\b[,.]?/i

const CHROME_PHRASES = [
  /\bnew message\b/gi,
  /\bto you\b/gi,
  /\b\d{1,2}:\d{2}\s?[AP]M\b/gi,
]

const SIGNATURE_LINE_PATTERNS = [
  /^p\.?\s?o\.?\s*box\b/i,
  /^\+?\d[\d\s().-]{6,}\d$/,
  /^[\w.+-]+@[\w-]+\.[\w.-]{2,}$/i,
]

function truncateAt(text: string, trigger: RegExp, minPositionRatio = 0): string {
  const match = trigger.exec(text)
  if (!match) return text
  // Only trust the match if it falls late enough in the text, so we don't chop
  // real content when a trigger word happens to appear mid-message ("Thanks for...").
  if (match.index < text.length * minPositionRatio) return text
  return text.slice(0, match.index)
}

export function cleanOcrNoise(rawText: string): string {
  let text = rawText.trim()
  if (!text) return text

  const original = text

  // "Disclaimer:" and similar legal-notice openers are specific enough that we
  // trust them anywhere in the text.
  text = truncateAt(text, DISCLAIMER_TRIGGERS)
  // Sign-offs ("Thanks", "Regards", ...) are common words, so only treat them as
  // the start of a signature block once we're well past the start of the message.
  text = truncateAt(text, SIGN_OFF_TRIGGERS, 0.3)

  for (const pattern of CHROME_PHRASES) {
    text = text.replace(pattern, ' ')
  }

  text = text
    .split(/\r?\n/)
    .filter((line) => !SIGNATURE_LINE_PATTERNS.some((pattern) => pattern.test(line.trim())))
    .join('\n')

  text = text
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^[^\w"'(]+/, '')
    .trim()

  // Never hand back an empty/near-empty result — fall back to the original
  // so the user always has something to review and edit.
  return text.length >= 8 ? text : original.trim()
}
