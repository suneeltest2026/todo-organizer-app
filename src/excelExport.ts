import * as XLSX from 'xlsx'
import type { Activity } from './types'
import { PERIOD_LABELS } from './types'
import { periodLabel } from './dateUtils'

export function exportActivitiesToExcel(activities: Activity[], filename = 'activities.xlsx'): void {
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
  XLSX.writeFile(workbook, filename)
}
