import { useEffect, useState } from 'react'
import type { ReminderSettings as ReminderSettingsType } from '../types'
import { getPermission, requestNotificationPermission, showNotification } from '../notifications'
import './ReminderSettings.css'

interface ReminderSettingsProps {
  reminder: ReminderSettingsType
  onChange: (reminder: ReminderSettingsType) => void
}

export default function ReminderSettings({ reminder, onChange }: ReminderSettingsProps) {
  const [permission, setPermission] = useState(getPermission())

  useEffect(() => {
    setPermission(getPermission())
  }, [])

  async function handleEnable() {
    const result = await requestNotificationPermission()
    setPermission(result)
    if (result === 'granted') {
      onChange({ ...reminder, enabled: true })
    }
  }

  function handleToggle(enabled: boolean) {
    if (enabled && permission !== 'granted') {
      handleEnable()
      return
    }
    onChange({ ...reminder, enabled })
  }

  function handleTestReminder() {
    showNotification('To-Do reminder (test)', 'This is what your reminders will look like.')
  }

  return (
    <div className="reminder-settings">
      {permission === 'unsupported' && (
        <p className="reminder-settings__note">Notifications aren't supported in this browser.</p>
      )}
      {permission === 'denied' && (
        <p className="reminder-settings__note reminder-settings__note--warn">
          Notifications are blocked for this site. Enable them in your browser settings to receive reminders.
        </p>
      )}

      <label className="reminder-settings__toggle">
        <input
          type="checkbox"
          className="switch"
          checked={reminder.enabled}
          onChange={(e) => handleToggle(e.target.checked)}
          disabled={permission === 'unsupported'}
        />
        Enable reminders
      </label>

      {reminder.enabled && (
        <div className="reminder-settings__options">
          <label className="reminder-settings__field">
            <span>Frequency</span>
            <select
              value={reminder.frequency}
              onChange={(e) =>
                onChange({ ...reminder, frequency: e.target.value as ReminderSettingsType['frequency'] })
              }
            >
              <option value="daily">Daily, at a set time</option>
              <option value="before-due">Before a task's due date</option>
            </select>
          </label>

          {reminder.frequency === 'daily' ? (
            <label className="reminder-settings__field">
              <span>Time</span>
              <input
                type="time"
                value={reminder.time}
                onChange={(e) => onChange({ ...reminder, time: e.target.value })}
              />
            </label>
          ) : (
            <label className="reminder-settings__field">
              <span>Minutes before due date ends</span>
              <input
                type="number"
                min={1}
                max={1440}
                value={reminder.minutesBeforeDue}
                onChange={(e) => onChange({ ...reminder, minutesBeforeDue: Number(e.target.value) })}
              />
            </label>
          )}

          <button type="button" className="btn btn-secondary btn-sm reminder-settings__test-btn" onClick={handleTestReminder}>
            Send test reminder
          </button>
        </div>
      )}
    </div>
  )
}
