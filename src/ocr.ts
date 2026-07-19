import { createWorker } from 'tesseract.js'

/**
 * Runs OCR on an image file and returns the extracted text.
 * onProgress receives an integer 0-100.
 */
export async function recognizeImageText(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const worker = await createWorker('eng', undefined, {
    logger: (m) => {
      if (m.status === 'recognizing text' && typeof m.progress === 'number') {
        onProgress?.(Math.round(m.progress * 100))
      }
    },
  })

  try {
    const {
      data: { text },
    } = await worker.recognize(file)
    return text
  } finally {
    await worker.terminate()
  }
}
