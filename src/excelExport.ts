import * as XLSX from 'xlsx'
import type { Activity } from './types'
import { formatDateLabel, formatWeekLabel } from './dateUtils'

export function exportActivitiesToExcel(activities: Activity[], filename = 'activities.xlsx'): void {
  const rows = activities
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .map((a) => ({
      Name: a.name,
      Status: a.status,
      Period: a.period === 'daily' ? 'Daily' : 'Weekly',
      'Date / Week': a.period === 'daily' ? formatDateLabel(a.date) : formatWeekLabel(a.weekStart ?? a.date),
      Notes: a.notes ?? '',
      'Created At': new Date(a.createdAt).toLocaleString(),
      'Updated At': new Date(a.updatedAt).toLocaleString(),
    }))

  const worksheet = XLSX.utils.json_to_sheet(rows)
  worksheet['!cols'] = [
    { wch: 32 }, // Name
    { wch: 14 }, // Status
    { wch: 10 }, // Period
    { wch: 24 }, // Date / Week
    { wch: 40 }, // Notes
    { wch: 20 }, // Created At
    { wch: 20 }, // Updated At
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Activities')
  XLSX.writeFile(workbook, filename)
}
