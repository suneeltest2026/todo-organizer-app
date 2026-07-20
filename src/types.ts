export type Workspace = 'personal' | 'professional'

export const WORKSPACE_ORDER: Workspace[] = ['personal', 'professional']

export const WORKSPACE_LABELS: Record<Workspace, string> = {
  personal: 'Personal',
  professional: 'Professional',
}

export const WORKSPACE_TAGLINES: Record<Workspace, string> = {
  personal: 'Your personal tasks & goals',
  professional: 'Your work tasks & projects',
}

export const DEFAULT_WORKSPACE: Workspace = 'personal'

export type ViewMode = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'halfyearly'

export const PERIOD_ORDER: ViewMode[] = ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'halfyearly']

export const PERIOD_LABELS: Record<ViewMode, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Bi-Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  halfyearly: 'Half-Yearly',
}

export type Priority = 'p1' | 'p2' | 'p3' | 'p4' | 'p5'

/** p1 = highest priority, p5 = lowest. */
export const PRIORITY_ORDER: Priority[] = ['p1', 'p2', 'p3', 'p4', 'p5']

export const PRIORITY_LABELS: Record<Priority, string> = {
  p1: '1st (Highest)',
  p2: '2nd',
  p3: '3rd',
  p4: '4th',
  p5: '5th (Lowest)',
}

/** Maps the old Low/Medium/High/Urgent scale to the nearest priority on the new 1st-5th scale. */
const LEGACY_PRIORITY_MAP: Record<string, Priority> = {
  urgent: 'p1',
  high: 'p2',
  medium: 'p3',
  low: 'p4',
}

export function normalizePriority(value: string | null | undefined): Priority | undefined {
  if (!value) return undefined
  if ((PRIORITY_ORDER as string[]).includes(value)) return value as Priority
  return LEGACY_PRIORITY_MAP[value]
}

export interface SubTask {
  id: string
  name: string
  done: boolean
}

export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly'

export const RECURRENCE_ORDER: Recurrence[] = ['none', 'daily', 'weekly', 'monthly']

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  none: 'Does not repeat',
  daily: 'Repeats daily',
  weekly: 'Repeats weekly',
  monthly: 'Repeats monthly',
}

export interface Activity {
  id: string
  name: string
  status: string
  notes?: string
  period: ViewMode
  /** ISO date (yyyy-mm-dd) the user picked for this activity */
  date: string
  /** Optional HH:mm due time, used to sharpen "before due" reminders for daily-period activities */
  time?: string
  priority?: Priority
  subtasks?: SubTask[]
  /** When set to something other than 'none', completing the activity creates its next occurrence */
  recurrence?: Recurrence
  /** Bucket key derived from `date` + `period` — used for grouping (e.g. a week-start date, "2026-03", "2026-Q1") */
  periodKey: string
  createdAt: string
  updatedAt: string
}

export interface ReminderSettings {
  enabled: boolean
  frequency: 'daily' | 'before-due'
  /** HH:mm, used for 'daily' frequency */
  time: string
  /** minutes before an activity's due date/time, used for 'before-due' frequency */
  minutesBeforeDue: number
}

export interface AppSettings {
  statuses: string[]
  defaultViewMode: ViewMode
  /** Which periods show up as tabs in the Activities view. Extras stay hidden until the user opts in. */
  enabledPeriods: ViewMode[]
  reminder: ReminderSettings
}

export const DEFAULT_STATUSES = ['Not Started', 'In Progress', 'Done']

export const DEFAULT_SETTINGS: AppSettings = {
  statuses: DEFAULT_STATUSES,
  defaultViewMode: 'daily',
  enabledPeriods: ['daily', 'weekly'],
  reminder: {
    enabled: false,
    frequency: 'daily',
    time: '09:00',
    minutesBeforeDue: 30,
  },
}
