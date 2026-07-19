import type { Activity, AppSettings } from './types'
import { DEFAULT_SETTINGS } from './types'

const ACTIVITIES_KEY = 'todo-organizer.activities'
const SETTINGS_KEY = 'todo-organizer.settings'

export function loadActivities(): Activity[] {
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY)
    return raw ? (JSON.parse(raw) as Activity[]) : []
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
    return { ...DEFAULT_SETTINGS, ...parsed, reminder: { ...DEFAULT_SETTINGS.reminder, ...parsed.reminder } }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
