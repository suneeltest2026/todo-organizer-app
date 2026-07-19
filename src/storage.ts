import type { Activity, AppSettings, Workspace } from './types'
import { DEFAULT_SETTINGS, DEFAULT_WORKSPACE } from './types'
import { periodKeyFor } from './dateUtils'

const WORKSPACE_KEY = 'todo-organizer.workspace'

// Legacy keys from before multi-workspace support (single shared list).
const LEGACY_ACTIVITIES_KEY = 'todo-organizer.activities'
const LEGACY_SETTINGS_KEY = 'todo-organizer.settings'

function activitiesKey(workspace: Workspace): string {
  return `todo-organizer.${workspace}.activities`
}

function settingsKey(workspace: Workspace): string {
  return `todo-organizer.${workspace}.settings`
}

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

export function loadWorkspace(): Workspace {
  const raw = localStorage.getItem(WORKSPACE_KEY)
  return raw === 'personal' || raw === 'professional' ? raw : DEFAULT_WORKSPACE
}

export function saveWorkspace(workspace: Workspace): void {
  localStorage.setItem(WORKSPACE_KEY, workspace)
}

export function loadActivities(workspace: Workspace): Activity[] {
  try {
    let raw = localStorage.getItem(activitiesKey(workspace))
    if (!raw && workspace === DEFAULT_WORKSPACE) {
      raw = localStorage.getItem(LEGACY_ACTIVITIES_KEY)
    }
    if (!raw) return []
    const parsed = JSON.parse(raw) as LegacyActivity[]
    return parsed.map(migrateActivity)
  } catch {
    return []
  }
}

export function saveActivities(workspace: Workspace, activities: Activity[]): void {
  localStorage.setItem(activitiesKey(workspace), JSON.stringify(activities))
}

export function loadSettings(workspace: Workspace): AppSettings {
  try {
    let raw = localStorage.getItem(settingsKey(workspace))
    if (!raw && workspace === DEFAULT_WORKSPACE) {
      raw = localStorage.getItem(LEGACY_SETTINGS_KEY)
    }
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

export function saveSettings(workspace: Workspace, settings: AppSettings): void {
  localStorage.setItem(settingsKey(workspace), JSON.stringify(settings))
}
