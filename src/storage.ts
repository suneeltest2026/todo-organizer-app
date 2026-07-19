import type { Activity, AppSettings } from './types'
import { DEFAULT_SETTINGS } from './types'
import { periodKeyFor } from './dateUtils'

const ACTIVITIES_KEY = 'todo-organizer.activities'
const SETTINGS_KEY = 'todo-organizer.settings'

// Legacy shape from before period buckets (daily/weekly only, with a `weekStart` field).
interface LegacyActivity extends Omit<Activity, 'periodKey'> {
  periodKey?: string
  weekStart?: string
}

function migrateActivity(a: LegacyActivity): Activity {
  if (a.periodKey) return a as Activity
  const periodKey = a.period === 'weekly' ? (a.weekStart ?? a.date) : periodKeyFor(a.period, a.date)
  return { ...a, periodKey }
}

export function loadActivities(): Activity[] {
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LegacyActivity[]
    return parsed.map(migrateActivity)
  } catch {
    return []
  }
}

export function saveActivities(activities: Activity[]): void {
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities))
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as AppSettings
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      enabledPeriods: parsed.enabledPeriods?.length ? parsed.enabledPeriods : DEFAULT_SETTINGS.enabledPeriods,
      reminder: { ...DEFAULT_SETTINGS.reminder, ...parsed.reminder },
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
