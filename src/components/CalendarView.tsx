import { useState } from 'react'
import type { Activity } from '../types'
import { formatMonthLabel, getMonthGrid, todayISO, WEEKDAY_LABELS } from '../dateUtils'
import ActivityCard from './ActivityCard'
import { IconChevronLeft, IconChevronRight } from './icons'
import './CalendarView.css'

interface CalendarViewProps {
  activities: Activity[]
  statuses: string[]
  onUpdateStatus: (id: string, status: string) => void
  onDelete: (id: string) => void
  onToggleSubtask: (activityId: string, subtaskId: string) => void
}

export default function CalendarView({
  activities,
  statuses,
  onUpdateStatus,
  onDelete,
  onToggleSubtask,
}: CalendarViewProps) {
  const today = todayISO()
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selectedDate, setSelectedDate] = useState(today)

  const grid = getMonthGrid(cursor.year, cursor.month)
  const activitiesByDate = new Map<string, Activity[]>()
  for (const activity of activities) {
    if (!activitiesByDate.has(activity.date)) activitiesByDate.set(activity.date, [])
    activitiesByDate.get(activity.date)!.push(activity)
  }

  const selectedActivities = (activitiesByDate.get(selectedDate) ?? []).slice().sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time)
    if (a.time) return -1
    if (b.time) return 1
    return 0
  })

  function goToMonth(delta: number) {
    setCursor((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  function goToToday() {
    const now = new Date()
    setCursor({ year: now.getFullYear(), month: now.getMonth() })
    setSelectedDate(today)
  }

  return (
    <div className="calendar-view">
      <div className="calendar-view__header">
        <h2 className="calendar-view__month-label">{formatMonthLabel(cursor.year, cursor.month)}</h2>
        <div className="calendar-view__nav">
          <button type="button" className="icon-btn" onClick={() => goToMonth(-1)} aria-label="Previous month">
            <IconChevronLeft size={16} />
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={goToToday}>
            Today
          </button>
          <button type="button" className="icon-btn" onClick={() => goToMonth(1)} aria-label="Next month">
            <IconChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="calendar-view__weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="calendar-view__grid">
        {grid.map((date) => {
          const inMonth = new Date(date + 'T00:00:00').getMonth() === cursor.month
          const dayActivities = activitiesByDate.get(date) ?? []
          const dayNumber = Number(date.slice(-2))
          return (
            <button
              type="button"
              key={date}
              className={[
                'calendar-view__day',
                !inMonth && 'is-outside',
                date === today && 'is-today',
                date === selectedDate && 'is-selected',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setSelectedDate(date)}
            >
              <span className="calendar-view__day-number">{dayNumber}</span>
              {dayActivities.length > 0 && (
                <span className="calendar-view__day-badge">
                  {dayActivities.length > 9 ? '9+' : dayActivities.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="calendar-view__selected">
        <h3 className="calendar-view__selected-title">
          {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </h3>
        {selectedActivities.length === 0 ? (
          <p className="calendar-view__selected-empty">Nothing due this day.</p>
        ) : (
          <ul className="activity-list__items">
            {selectedActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                statuses={statuses}
                onUpdateStatus={onUpdateStatus}
                onDelete={onDelete}
                onToggleSubtask={onToggleSubtask}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
