import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import type { Activity, AppSettings, ViewMode, Workspace } from './types'
import { DEFAULT_SETTINGS, PERIOD_LABELS, PERIOD_ORDER, WORKSPACE_LABELS, WORKSPACE_ORDER } from './types'
import { advanceDate, periodKeyFor } from './dateUtils'
import { supabase } from './supabaseClient'
import {
  deleteActivity,
  loadActivities,
  loadSettings,
  loadWorkspace,
  saveActivity,
  saveSettings,
  saveWorkspace,
} from './storage'
import ActivityList from './components/ActivityList'
import CalendarView from './components/CalendarView'
import StatusManager from './components/StatusManager'
import ReminderSettings from './components/ReminderSettings'
import PeriodSettings from './components/PeriodSettings'
import ProfileGate from './components/ProfileGate'
import AddTaskSheet from './components/AddTaskSheet'
import { exportActivitiesToExcel } from './excelExport'
import { useReminders } from './useReminders'
import type { ReminderSettings as ReminderSettingsType } from './types'
import {
  IconBell,
  IconBriefcase,
  IconCalendarRange,
  IconChevronLeft,
  IconClipboardCheck,
  IconDownload,
  IconEye,
  IconListChecks,
  IconLogOut,
  IconPlus,
  IconSliders,
  IconTag,
  IconUser,
} from './components/icons'
import './App.css'

type Tab = 'activities' | 'settings'
type ListMode = 'list' | 'calendar'

const WORKSPACE_ICONS: Record<Workspace, typeof IconUser> = {
  personal: IconUser,
  professional: IconBriefcase,
}

function initialViewMode(settings: AppSettings): ViewMode {
  return settings.enabledPeriods.includes(settings.defaultViewMode)
    ? settings.defaultViewMode
    : settings.enabledPeriods[0]
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [workspace, setWorkspace] = useState<Workspace>(() => loadWorkspace())
  const [activities, setActivities] = useState<Activity[]>([])
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>(() => initialViewMode(DEFAULT_SETTINGS))
  const [tab, setTab] = useState<Tab>('activities')
  const [listMode, setListMode] = useState<ListMode>('list')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const visiblePeriods = PERIOD_ORDER.filter((p) => settings.enabledPeriods.includes(p))

  const userId = session?.user?.id ?? null
  const email = session?.user?.email ?? null

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!userId) {
      setActivities([])
      setSettings(DEFAULT_SETTINGS)
      setSettingsLoaded(false)
      return
    }
    let cancelled = false
    setSettingsLoaded(false)
    Promise.all([loadActivities(workspace), loadSettings(workspace)]).then(([acts, sett]) => {
      if (cancelled) return
      setActivities(acts)
      setSettings(sett)
      setViewMode(initialViewMode(sett))
      setSettingsLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [userId, workspace])

  useEffect(() => {
    if (!userId || !settingsLoaded) return
    saveSettings(userId, workspace, settings).catch((err) => console.error('Failed to save settings', err))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings])

  useEffect(() => {
    if (!settings.enabledPeriods.includes(viewMode)) {
      setViewMode(settings.enabledPeriods[0])
    }
  }, [settings.enabledPeriods, viewMode])

  useReminders(activities, settings.reminder)

  function handleSignOut() {
    supabase.auth.signOut()
    setTab('activities')
    setAccountMenuOpen(false)
  }

  function handleWorkspaceChange(next: Workspace) {
    if (next === workspace) return
    setWorkspace(next)
    saveWorkspace(next)
    setTab('activities')
  }

  function handleSaveActivity(activity: Activity) {
    setActivities((prev) => {
      const exists = prev.some((a) => a.id === activity.id)
      return exists ? prev.map((a) => (a.id === activity.id ? activity : a)) : [...prev, activity]
    })
    if (userId) {
      saveActivity(userId, workspace, activity).catch((err) => console.error('Failed to save activity', err))
    }
  }

  function closeSheet() {
    setSheetOpen(false)
    setEditingActivity(null)
  }

  function handleUpdateStatus(id: string, status: string) {
    if (!userId) return
    const now = new Date().toISOString()
    const target = activities.find((a) => a.id === id)
    if (!target) return
    const updatedActivity: Activity = { ...target, status, updatedAt: now }

    const terminalStatus = settings.statuses[settings.statuses.length - 1]
    const isRecurring = target.recurrence && target.recurrence !== 'none'
    let nextActivity: Activity | null = null
    if (isRecurring && status === terminalStatus) {
      const nextDate = advanceDate(target.date, target.recurrence!)
      nextActivity = {
        ...target,
        id: uuidv4(),
        status: settings.statuses[0] ?? target.status,
        date: nextDate,
        periodKey: periodKeyFor(target.period, nextDate),
        subtasks: target.subtasks?.map((s) => ({ ...s, done: false })),
        createdAt: now,
        updatedAt: now,
      }
    }

    setActivities((prev) => {
      const updated = prev.map((a) => (a.id === id ? updatedActivity : a))
      return nextActivity ? [...updated, nextActivity] : updated
    })

    saveActivity(userId, workspace, updatedActivity).catch((err) => console.error('Failed to save activity', err))
    if (nextActivity) {
      saveActivity(userId, workspace, nextActivity).catch((err) => console.error('Failed to save activity', err))
    }
  }

  function handleToggleSubtask(activityId: string, subtaskId: string) {
    if (!userId) return
    const target = activities.find((a) => a.id === activityId)
    if (!target) return
    const updatedActivity: Activity = {
      ...target,
      subtasks: target.subtasks?.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s)),
      updatedAt: new Date().toISOString(),
    }
    setActivities((prev) => prev.map((a) => (a.id === activityId ? updatedActivity : a)))
    saveActivity(userId, workspace, updatedActivity).catch((err) => console.error('Failed to save activity', err))
  }

  function handleDelete(id: string) {
    setActivities((prev) => prev.filter((a) => a.id !== id))
    deleteActivity(id).catch((err) => console.error('Failed to delete activity', err))
  }

  function handleStatusesChange(statuses: string[]) {
    setSettings((prev) => ({ ...prev, statuses }))
  }

  function handleDefaultViewModeChange(mode: ViewMode) {
    setSettings((prev) => ({ ...prev, defaultViewMode: mode }))
  }

  function handleExport() {
    exportActivitiesToExcel(activities, `${workspace}-activities.xlsx`).catch(() => {
      alert("Couldn't create the Excel file. Please try again, or try opening the app in Safari/Chrome directly instead of through another app's link.")
    })
  }

  function handleReminderChange(reminder: ReminderSettingsType) {
    setSettings((prev) => ({ ...prev, reminder }))
  }

  function handleEnabledPeriodsChange(enabledPeriods: ViewMode[]) {
    setSettings((prev) => ({ ...prev, enabledPeriods }))
  }

  if (authLoading) {
    return null
  }

  if (!session || !email) {
    return <ProfileGate />
  }

  return (
    <div className={`app app--${workspace}`}>
      <header className="app__appbar">
        <div className="app__appbar-row">
          <span className="app__brand-mark app__brand-mark--sm">
            <IconClipboardCheck size={17} />
          </span>

          <nav className="app__workspace-switcher" role="tablist" aria-label="Workspace">
            {WORKSPACE_ORDER.map((w) => {
              const WorkspaceIcon = WORKSPACE_ICONS[w]
              return (
                <button
                  key={w}
                  role="tab"
                  aria-selected={workspace === w}
                  className={workspace === w ? 'is-active' : ''}
                  onClick={() => handleWorkspaceChange(w)}
                >
                  <WorkspaceIcon size={14} />
                  <span className="app__ws-label">{WORKSPACE_LABELS[w]}</span>
                </button>
              )
            })}
          </nav>

          <div className="app__appbar-actions">
            <button
              type="button"
              className="icon-btn"
              aria-label={tab === 'settings' ? 'Back to activities' : 'Settings'}
              aria-pressed={tab === 'settings'}
              onClick={() => setTab(tab === 'settings' ? 'activities' : 'settings')}
            >
              <IconSliders size={16} />
            </button>
            <div className="app__account-wrap">
              <button
                type="button"
                className="app__avatar-btn"
                onClick={() => setAccountMenuOpen((v) => !v)}
                aria-label="Account menu"
              >
                {email.charAt(0).toUpperCase()}
              </button>
              {accountMenuOpen && (
                <>
                  <button
                    type="button"
                    className="app__popover-backdrop"
                    aria-label="Close menu"
                    onClick={() => setAccountMenuOpen(false)}
                  />
                  <div className="app__account-popover">
                    <span className="app__account-popover-email">{email}</span>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleSignOut}>
                      <IconLogOut size={14} />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="app__content">
      {tab === 'activities' && (
        <main className="app__main">
          <div className="app__view-mode-toggle" role="tablist" aria-label="List or calendar view">
            <button
              type="button"
              role="tab"
              aria-selected={listMode === 'list'}
              className={listMode === 'list' ? 'is-active' : ''}
              onClick={() => setListMode('list')}
            >
              <IconListChecks size={14} />
              List
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={listMode === 'calendar'}
              className={listMode === 'calendar' ? 'is-active' : ''}
              onClick={() => setListMode('calendar')}
            >
              <IconCalendarRange size={14} />
              Calendar
            </button>
          </div>

          {listMode === 'list' ? (
            <>
              <div className="app__period-chips" role="tablist" aria-label="Activity period view">
                {visiblePeriods.map((period) => (
                  <button
                    key={period}
                    role="tab"
                    aria-selected={viewMode === period}
                    className={`app__period-chip ${viewMode === period ? 'is-active' : ''}`}
                    onClick={() => setViewMode(period)}
                  >
                    {PERIOD_LABELS[period]}
                  </button>
                ))}
              </div>

              <ActivityList
                activities={activities}
                statuses={settings.statuses}
                viewMode={viewMode}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDelete}
                onToggleSubtask={handleToggleSubtask}
                onEdit={setEditingActivity}
              />
            </>
          ) : (
            <CalendarView
              activities={activities}
              statuses={settings.statuses}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDelete}
              onToggleSubtask={handleToggleSubtask}
              onEdit={setEditingActivity}
            />
          )}

          <button
            type="button"
            className="app__fab"
            onClick={() => setSheetOpen(true)}
            aria-label="Add task"
          >
            <IconPlus size={22} />
          </button>

          {(sheetOpen || editingActivity) && (
            <AddTaskSheet
              statuses={settings.statuses}
              viewMode={viewMode}
              activity={editingActivity ?? undefined}
              existingActivities={activities}
              onSave={handleSaveActivity}
              onClose={closeSheet}
            />
          )}
        </main>
      )}

      {tab === 'settings' && (
        <main className="app__main">
          <button type="button" className="app__back-btn" onClick={() => setTab('activities')}>
            <IconChevronLeft size={16} />
            Back
          </button>
          <h1 className="app__settings-title">Settings</h1>

          <section className="app__settings-section">
            <div className="section-heading">
              <span className="section-heading__icon">
                <IconTag size={16} />
              </span>
              <h2>Statuses</h2>
            </div>
            <p className="app__settings-hint">Customize the statuses available for your activities.</p>
            <StatusManager statuses={settings.statuses} onChange={handleStatusesChange} />
          </section>

          <section className="app__settings-section">
            <div className="section-heading">
              <span className="section-heading__icon">
                <IconCalendarRange size={16} />
              </span>
              <h2>Periods</h2>
            </div>
            <p className="app__settings-hint">
              Choose which time periods you want to track activities by. Daily and Weekly are on by
              default — turn on Bi-Weekly, Monthly, Quarterly, or Half-Yearly only if you need them.
            </p>
            <PeriodSettings enabledPeriods={settings.enabledPeriods} onChange={handleEnabledPeriodsChange} />
          </section>

          <section className="app__settings-section">
            <div className="section-heading">
              <span className="section-heading__icon">
                <IconEye size={16} />
              </span>
              <h2>Default view</h2>
            </div>
            <p className="app__settings-hint">Choose which period view opens by default.</p>
            <select
              value={settings.defaultViewMode}
              onChange={(e) => handleDefaultViewModeChange(e.target.value as ViewMode)}
            >
              {visiblePeriods.map((period) => (
                <option key={period} value={period}>
                  {PERIOD_LABELS[period]}
                </option>
              ))}
            </select>
          </section>

          <section className="app__settings-section">
            <div className="section-heading">
              <span className="section-heading__icon">
                <IconBell size={16} />
              </span>
              <h2>Reminders</h2>
            </div>
            <p className="app__settings-hint">
              Get a browser notification daily at a set time, or before a task's due date. Requires this
              app to be open in a tab.
            </p>
            <ReminderSettings reminder={settings.reminder} onChange={handleReminderChange} />
          </section>

          <section className="app__settings-section">
            <div className="section-heading">
              <span className="section-heading__icon">
                <IconDownload size={16} />
              </span>
              <h2>Export data</h2>
            </div>
            <p className="app__settings-hint">Download all of this workspace's activities as an Excel file.</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleExport}
              disabled={activities.length === 0}
            >
              <IconDownload size={16} />
              Download as Excel
            </button>
          </section>
        </main>
      )}
      </div>
    </div>
  )
}

export default App
