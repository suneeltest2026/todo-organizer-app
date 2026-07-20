import type { Activity, AppSettings, Recurrence, SubTask, ViewMode, Workspace } from './types'
import { DEFAULT_SETTINGS, DEFAULT_WORKSPACE, normalizePriority } from './types'
import { supabase } from './supabaseClient'

const WORKSPACE_KEY = 'todo-organizer.workspace'

export function loadWorkspace(): Workspace {
  const raw = localStorage.getItem(WORKSPACE_KEY)
  return raw === 'personal' || raw === 'professional' ? raw : DEFAULT_WORKSPACE
}

export function saveWorkspace(workspace: Workspace): void {
  localStorage.setItem(WORKSPACE_KEY, workspace)
}

interface ActivityRow {
  id: string
  workspace: string
  name: string
  status: string
  notes: string | null
  period: string
  date: string
  time: string | null
  priority: string | null
  subtasks: SubTask[] | null
  recurrence: string | null
  period_key: string
  created_at: string
  updated_at: string
}

function rowToActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    notes: row.notes ?? undefined,
    period: row.period as ViewMode,
    date: row.date,
    time: row.time ?? undefined,
    priority: normalizePriority(row.priority),
    subtasks: row.subtasks ?? undefined,
    recurrence: (row.recurrence as Recurrence | null) ?? undefined,
    periodKey: row.period_key,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function activityToRow(userId: string, workspace: Workspace, a: Activity) {
  return {
    id: a.id,
    user_id: userId,
    workspace,
    name: a.name,
    status: a.status,
    notes: a.notes ?? null,
    period: a.period,
    date: a.date,
    time: a.time ?? null,
    priority: a.priority ?? null,
    subtasks: a.subtasks ?? null,
    recurrence: a.recurrence ?? null,
    period_key: a.periodKey,
    created_at: a.createdAt,
    updated_at: a.updatedAt,
  }
}

export async function loadActivities(workspace: Workspace): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('workspace', workspace)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as ActivityRow[]).map(rowToActivity)
}

export async function saveActivity(userId: string, workspace: Workspace, activity: Activity): Promise<void> {
  const { error } = await supabase.from('activities').upsert(activityToRow(userId, workspace, activity))
  if (error) throw error
}

export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase.from('activities').delete().eq('id', id)
  if (error) throw error
}

interface SettingsRow {
  statuses: string[]
  default_view_mode: string
  enabled_periods: string[]
  reminder: AppSettings['reminder']
}

export async function loadSettings(workspace: Workspace): Promise<AppSettings> {
  const { data, error } = await supabase
    .from('workspace_settings')
    .select('*')
    .eq('workspace', workspace)
    .maybeSingle()
  if (error) throw error
  if (!data) return DEFAULT_SETTINGS
  const row = data as SettingsRow
  return {
    statuses: row.statuses?.length ? row.statuses : DEFAULT_SETTINGS.statuses,
    defaultViewMode: (row.default_view_mode as ViewMode) ?? DEFAULT_SETTINGS.defaultViewMode,
    enabledPeriods: row.enabled_periods?.length ? (row.enabled_periods as ViewMode[]) : DEFAULT_SETTINGS.enabledPeriods,
    reminder: { ...DEFAULT_SETTINGS.reminder, ...row.reminder },
  }
}

export async function saveSettings(userId: string, workspace: Workspace, settings: AppSettings): Promise<void> {
  const { error } = await supabase.from('workspace_settings').upsert({
    user_id: userId,
    workspace,
    statuses: settings.statuses,
    default_view_mode: settings.defaultViewMode,
    enabled_periods: settings.enabledPeriods,
    reminder: settings.reminder,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}
