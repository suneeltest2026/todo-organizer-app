import type { Activity, AppSettings, Workspace } from './types'
import { DEFAULT_SETTINGS, DEFAULT_WORKSPACE } from './types'
import { periodKeyFor } from './dateUtils'

const WORKSPACE_KEY = 'todo-organizer.workspace'
const CURRENT_PROFILE_KEY = 'todo-organizer.currentProfile'
const KNOWN_PROFILES_KEY = 'todo-organizer.knownProfiles'
const LEGACY_CLAIMED_KEY = 'todo-organizer.legacyClaimed'

// Legacy keys from before multi-profile / multi-workspace support (single shared list).
const LEGACY_ACTIVITIES_KEY = 'todo-organizer.activities'
const LEGACY_SETTINGS_KEY = 'todo-organizer.settings'

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function activitiesKey(email: string, workspace: Workspace): string {
  return `todo-organizer.${email}.${workspace}.activities`
}

function settingsKey(email: string, workspace: Workspace): string {
  return `todo-organizer.${email}.${workspace}.settings`
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

function legacyClaimed(): boolean {
  return localStorage.getItem(LEGACY_CLAIMED_KEY) === '1'
}

function claimLegacy(): void {
  localStorage.setItem(LEGACY_CLAIMED_KEY, '1')
}

export function loadWorkspace(): Workspace {
  const raw = localStorage.getItem(WORKSPACE_KEY)
  return raw === 'personal' || raw === 'professional' ? raw : DEFAULT_WORKSPACE
}

export function saveWorkspace(workspace: Workspace): void {
  localStorage.setItem(WORKSPACE_KEY, workspace)
}

export function loadCurrentProfile(): string | null {
  return localStorage.getItem(CURRENT_PROFILE_KEY)
}

export function saveCurrentProfile(email: string): void {
  localStorage.setItem(CURRENT_PROFILE_KEY, email)
}

export function clearCurrentProfile(): void {
  localStorage.removeItem(CURRENT_PROFILE_KEY)
}

export function loadKnownProfiles(): string[] {
  try {
    const raw = localStorage.getItem(KNOWN_PROFILES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function rememberProfile(email: string): void {
  const known = loadKnownProfiles()
  if (!known.includes(email)) {
    localStorage.setItem(KNOWN_PROFILES_KEY, JSON.stringify([...known, email]))
  }
}

export function loadActivities(email: string, workspace: Workspace): Activity[] {
  try {
    let raw = localStorage.getItem(activitiesKey(email, workspace))
    if (!raw && workspace === DEFAULT_WORKSPACE && !legacyClaimed()) {
      raw = localStorage.getItem(LEGACY_ACTIVITIES_KEY)
      if (raw) claimLegacy()
    }
    if (!raw) return []
    const parsed = JSON.parse(raw) as LegacyActivity[]
    return parsed.map(migrateActivity)
  } catch {
    return []
  }
}

export function saveActivities(email: string, workspace: Workspace, activities: Activity[]): void {
  localStorage.setItem(activitiesKey(email, workspace), JSON.stringify(activities))
}

export function loadSettings(email: string, workspace: Workspace): AppSettings {
  try {
    let raw = localStorage.getItem(settingsKey(email, workspace))
    if (!raw && workspace === DEFAULT_WORKSPACE && !legacyClaimed()) {
      raw = localStorage.getItem(LEGACY_SETTINGS_KEY)
      if (raw) claimLegacy()
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

export function saveSettings(email: string, workspace: Workspace, settings: AppSettings): void {
  localStorage.setItem(settingsKey(email, workspace), JSON.stringify(settings))
}
