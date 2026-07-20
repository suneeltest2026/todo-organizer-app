import * as XLSX from 'xlsx'
import type { Activity } from './types'
import { PERIOD_LABELS } from './types'
import { periodLabel } from './dateUtils'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

function buildWorkbookBlob(activities: Activity[]): Blob {
  const rows = activities
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .map((a) => ({
      Name: a.name,
      Status: a.status,
      Period: PERIOD_LABELS[a.period],
      'Date / Period': periodLabel(a.period, a.periodKey),
      Notes: a.notes ?? '',
      'Created At': new Date(a.createdAt).toLocaleString(),
      'Updated At': new Date(a.updatedAt).toLocaleString(),
    }))

  const worksheet = XLSX.utils.json_to_sheet(rows)
  worksheet['!cols'] = [
    { wch: 32 }, // Name
    { wch: 14 }, // Status
    { wch: 12 }, // Period
    { wch: 26 }, // Date / Period
    { wch: 40 }, // Notes
    { wch: 20 }, // Created At
    { wch: 20 }, // Updated At
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Activities')
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
  return new Blob([buffer], { type: XLSX_MIME })
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Revoke on a delay: some mobile browsers only start the download after
  // the click handler returns, and revoking immediately can cancel it.
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

/**
 * Exports activities to an Excel file. On phones (especially inside in-app
 * browsers like Gmail's or a standalone installed PWA), a hidden download
 * link can silently fail with no error and no file — that's the "sometimes
 * works, sometimes doesn't" behavior. Where the native share sheet is
 * available we use that instead, since it reliably lets the user save or
 * send the file regardless of which browser/webview they're in.
 */
export async function exportActivitiesToExcel(activities: Activity[], filename = 'activities.xlsx'): Promise<void> {
  const blob = buildWorkbookBlob(activities)

  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean
    share?: (data: { files: File[]; title?: string }) => Promise<void>
  }

  if (nav.canShare && nav.share) {
    const file = new File([blob], filename, { type: XLSX_MIME })
    if (nav.canShare({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: filename })
        return
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return // user cancelled the share sheet
        // otherwise fall through to the direct-download fallback below
      }
    }
  }

  downloadBlob(blob, filename)
}
