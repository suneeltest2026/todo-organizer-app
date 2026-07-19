export type ViewMode = 'daily' | 'weekly'

export interface Activity {
  id: string
  name: string
  status: string
  notes?: string
  period: ViewMode
  /** ISO date (yyyy-mm-dd) the activity belongs to when period is 'daily' */
  date: string
  /** ISO date (yyyy-mm-dd) of the Monday that starts the week when period is 'weekly' */
  weekStart?: string
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
  reminder: ReminderSettings
}

export const DEFAULT_STATUSES = ['Not Started', 'In Progress', 'Done']

export const DEFAULT_SETTINGS: AppSettings = {
  statuses: DEFAULT_STATUSES,
  defaultViewMode: 'daily',
  reminder: {
    enabled: false,
    frequency: 'daily',
    time: '09:00',
    minutesBeforeDue: 30,
  },
}
