import { useEffect, useState } from 'react'
import type { Activity, AppSettings, ViewMode } from './types'
import { loadActivities, loadSettings, saveActivities, saveSettings } from './storage'
import ActivityForm from './components/ActivityForm'
import ActivityList from './components/ActivityList'
import StatusManager from './components/StatusManager'
import ReminderSettings from './components/ReminderSettings'
import GuidedEntry from './components/GuidedEntry'
import { exportActivitiesToExcel } from './excelExport'
import { useReminders } from './useReminders'
import type { ReminderSettings as ReminderSettingsType } from './types'
import './App.css'

type Tab = 'activities' | 'settings'

function App() {
  const [activities, setActivities] = useState<Activity[]>(() => loadActivities())
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings())
  const [viewMode, setViewMode] = useState<ViewMode>(settings.defaultViewMode)
  const [tab, setTab] = useState<Tab>('activities')
  const [guidedMode, setGuidedMode] = useState(false)

  useEffect(() => {
    saveActivities(activities)
  }, [activities])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useReminders(activities, settings.reminder)

  function handleAdd(activity: Activity) {
    setActivities((prev) => [...prev, activity])
  }

  function handleUpdateStatus(id: string, status: string) {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a)),
    )
  }

  function handleDelete(id: string) {
    setActivities((prev) => prev.filter((a) => a.id !== id))
  }

  function handleStatusesChange(statuses: string[]) {
    setSettings((prev) => ({ ...prev, statuses }))
  }

  function handleDefaultViewModeChange(mode: ViewMode) {
    setSettings((prev) => ({ ...prev, defaultViewMode: mode }))
  }

  function handleExport() {
    exportActivitiesToExcel(activities)
  }

  function handleReminderChange(reminder: ReminderSettingsType) {
    setSettings((prev) => ({ ...prev, reminder }))
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>To-Do Organizer</h1>
        <nav className="app__tabs">
          <button className={tab === 'activities' ? 'is-active' : ''} onClick={() => setTab('activities')}>
            Activities
          </button>
          <button className={tab === 'settings' ? 'is-active' : ''} onClick={() => setTab('settings')}>
            Settings
          </button>
        </nav>
      </header>

      {tab === 'activities' && (
        <main className="app__main">
          <div className="app__view-toggle" role="tablist" aria-label="Daily or weekly view">
            <button
              role="tab"
              aria-selected={viewMode === 'daily'}
              className={viewMode === 'daily' ? 'is-active' : ''}
              onClick={() => setViewMode('daily')}
            >
              Daily
            </button>
            <button
              role="tab"
              aria-selected={viewMode === 'weekly'}
              className={viewMode === 'weekly' ? 'is-active' : ''}
              onClick={() => setViewMode('weekly')}
            >
              Weekly
            </button>
          </div>

          <div className="app__entry-mode-toggle">
            <label>
              <input
                type="checkbox"
                checked={guidedMode}
                onChange={(e) => setGuidedMode(e.target.checked)}
              />
              Use guided step-by-step entry
            </label>
          </div>

          {guidedMode ? (
            <GuidedEntry
              statuses={settings.statuses}
              viewMode={viewMode}
              onAdd={handleAdd}
              onCancel={() => setGuidedMode(false)}
            />
          ) : (
            <ActivityForm statuses={settings.statuses} viewMode={viewMode} onAdd={handleAdd} />
          )}

          <div className="app__export-row">
            <button
              type="button"
              className="app__export-btn"
              onClick={handleExport}
              disabled={activities.length === 0}
            >
              ⬇ Download as Excel
            </button>
          </div>

          <ActivityList
            activities={activities}
            statuses={settings.statuses}
            viewMode={viewMode}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDelete}
          />
        </main>
      )}

      {tab === 'settings' && (
        <main className="app__main">
          <section className="app__settings-section">
            <h2>Statuses</h2>
            <p className="app__settings-hint">Customize the statuses available for your activities.</p>
            <StatusManager statuses={settings.statuses} onChange={handleStatusesChange} />
          </section>

          <section className="app__settings-section">
            <h2>Default view</h2>
            <p className="app__settings-hint">Choose whether you prefer to log activities daily or weekly by default.</p>
            <select
              value={settings.defaultViewMode}
              onChange={(e) => handleDefaultViewModeChange(e.target.value as ViewMode)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </section>

          <section className="app__settings-section">
            <h2>Reminders</h2>
            <p className="app__settings-hint">
              Get a browser notification daily at a set time, or before a task's due date. Requires this
              app to be open in a tab.
            </p>
            <ReminderSettings reminder={settings.reminder} onChange={handleReminderChange} />
          </section>
        </main>
      )}
    </div>
  )
}

export default App
