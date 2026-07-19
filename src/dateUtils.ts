import type { Recurrence, ViewMode } from './types'

export function todayISO(): string {
  return toISODate(new Date())
}

export function toISODate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Formats a "HH:mm" 24-hour time string as a locale-friendly 12-hour label, e.g. "9:00 AM" */
export function formatTimeLabel(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

/** Returns the ISO date (yyyy-mm-dd) of the Monday of the week containing d */
export function weekStartOf(d: Date): string {
  const date = new Date(d)
  const day = date.getDay() // 0 = Sunday, 1 = Monday, ...
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  return toISODate(date)
}

export function currentWeekStart(): string {
  return weekStartOf(new Date())
}

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Returns a Monday-start 42-day grid (6 weeks) of ISO dates covering the given month, including lead/trail days from adjacent months. */
export function getMonthGrid(year: number, month: number): string[] {
  const firstOfMonth = new Date(year, month, 1)
  const mondayIndex = (firstOfMonth.getDay() + 6) % 7 // 0 = Monday
  const gridStart = new Date(year, month, 1 - mondayIndex)

  const days: string[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    days.push(toISODate(d))
  }
  return days
}

export function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export function formatWeekLabel(weekStartISO: string): string {
  const start = new Date(weekStartISO + 'T00:00:00')
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}, ${end.getFullYear()}`
}

export function formatDateLabel(dateISO: string): string {
  const d = new Date(dateISO + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

// A fixed Monday used as the anchor so bi-weekly buckets are consistent across sessions.
const BIWEEK_ANCHOR = new Date('2024-01-01T00:00:00')

function biweekStartOf(d: Date): string {
  const monday = new Date(weekStartOf(d) + 'T00:00:00')
  const diffDays = Math.round((monday.getTime() - BIWEEK_ANCHOR.getTime()) / 86_400_000)
  const biweekIndex = Math.floor(diffDays / 14)
  const bucketStart = new Date(BIWEEK_ANCHOR)
  bucketStart.setDate(bucketStart.getDate() + biweekIndex * 14)
  return toISODate(bucketStart)
}

function quarterOf(d: Date): number {
  return Math.floor(d.getMonth() / 3) + 1
}

function halfOf(d: Date): number {
  return d.getMonth() < 6 ? 1 : 2
}

/** Computes the bucket key an activity belongs to, given the period and the date the user picked. */
export function periodKeyFor(period: ViewMode, dateISO: string): string {
  const d = new Date(dateISO + 'T00:00:00')
  switch (period) {
    case 'daily':
      return dateISO
    case 'weekly':
      return weekStartOf(d)
    case 'biweekly':
      return biweekStartOf(d)
    case 'monthly':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    case 'quarterly':
      return `${d.getFullYear()}-Q${quarterOf(d)}`
    case 'halfyearly':
      return `${d.getFullYear()}-H${halfOf(d)}`
  }
}

/** Human-readable label for a bucket key, given its period. */
export function periodLabel(period: ViewMode, key: string): string {
  switch (period) {
    case 'daily':
      return formatDateLabel(key)
    case 'weekly':
      return formatWeekLabel(key)
    case 'biweekly': {
      const start = new Date(key + 'T00:00:00')
      const end = new Date(start)
      end.setDate(end.getDate() + 13)
      const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
      return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}, ${end.getFullYear()}`
    }
    case 'monthly': {
      const [y, m] = key.split('-').map(Number)
      return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    }
    case 'quarterly': {
      const [y, q] = key.split('-Q')
      return `Q${q} ${y}`
    }
    case 'halfyearly': {
      const [y, h] = key.split('-H')
      return `${h === '1' ? 'H1 (Jan–Jun)' : 'H2 (Jul–Dec)'} ${y}`
    }
  }
}

/** Returns the next occurrence's ISO date for a recurring activity. */
export function advanceDate(dateISO: string, recurrence: Recurrence): string {
  const d = new Date(dateISO + 'T00:00:00')
  switch (recurrence) {
    case 'daily':
      d.setDate(d.getDate() + 1)
      break
    case 'weekly':
      d.setDate(d.getDate() + 7)
      break
    case 'monthly':
      d.setMonth(d.getMonth() + 1)
      break
    case 'none':
      break
  }
  return toISODate(d)
}

/** Returns the ISO date (yyyy-mm-dd) of the last day of the bucket — used for reminder due-date math. */
export function periodEndDate(period: ViewMode, key: string): string {
  switch (period) {
    case 'daily':
      return key
    case 'weekly':
    case 'biweekly': {
      const start = new Date(key + 'T00:00:00')
      const end = new Date(start)
      end.setDate(end.getDate() + (period === 'weekly' ? 6 : 13))
      return toISODate(end)
    }
    case 'monthly': {
      const [y, m] = key.split('-').map(Number)
      return toISODate(new Date(y, m, 0)) // day 0 of next month = last day of this month
    }
    case 'quarterly': {
      const [y, q] = key.split('-Q').map(Number)
      return toISODate(new Date(y, q * 3, 0))
    }
    case 'halfyearly': {
      const [y, h] = key.split('-H').map(Number)
      return toISODate(new Date(y, h * 6, 0))
    }
  }
}
