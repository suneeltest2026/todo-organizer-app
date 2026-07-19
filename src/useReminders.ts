import { useEffect, useRef } from 'react'
import type { Activity, ReminderSettings } from './types'
import { showNotification } from './notifications'
import { periodEndDate, todayISO } from './dateUtils'

const FIRED_KEY = 'todo-organizer.remindersFired'
const CHECK_INTERVAL_MS = 20_000

function loadFired(): Set<string> {
  try {
    const raw = localStorage.getItem(FIRED_KEY)
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

function saveFired(fired: Set<string>): void {
  localStorage.setItem(FIRED_KEY, JSON.stringify(Array.from(fired)))
}

function endOfDay(dateISO: string): Date {
  return new Date(`${dateISO}T23:59:59`)
}

function dueDateFor(activity: Activity): string {
  return periodEndDate(activity.period, activity.periodKey)
}

/** Runs a periodic check while the app is open and fires browser notifications per the reminder settings. */
export function useReminders(activities: Activity[], reminder: ReminderSettings) {
  const firedRef = useRef<Set<string>>(loadFired())

  useEffect(() => {
    if (!reminder.enabled) return

    function check() {
      const now = new Date()
      const today = todayISO()
      const fired = firedRef.current

      if (reminder.frequency === 'daily') {
        const key = `daily:${today}`
        const [h, m] = reminder.time.split(':').map(Number)
        const target = new Date(now)
        target.setHours(h, m, 0, 0)
        if (now >= target && !fired.has(key)) {
          const dueToday = activities.filter((a) => dueDateFor(a) === today)
          const body =
            dueToday.length > 0
              ? `You have ${dueToday.length} ${dueToday.length === 1 ? 'activity' : 'activities'} due today.`
              : 'Time to check your to-do list.'
          showNotification('To-Do reminder', body)
          fired.add(key)
          saveFired(fired)
        }
      } else {
        for (const activity of activities) {
          const due = dueDateFor(activity)
          const key = `due:${activity.id}:${due}`
          if (fired.has(key)) continue
          const target = new Date(endOfDay(due).getTime() - reminder.minutesBeforeDue * 60_000)
          const deadline = endOfDay(due)
          if (now >= target && now <= deadline) {
            showNotification('Activity due soon', `"${activity.name}" is due today.`)
            fired.add(key)
            saveFired(fired)
          }
        }
      }
    }

    check()
    const id = setInterval(check, CHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [activities, reminder])
}
