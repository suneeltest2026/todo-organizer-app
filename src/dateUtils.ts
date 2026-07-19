export function todayISO(): string {
  return toISODate(new Date())
}

export function toISODate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
