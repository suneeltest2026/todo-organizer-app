import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Activity, ViewMode } from '../types'
import UniversalInput from './UniversalInput'
import { currentWeekStart, todayISO } from '../dateUtils'
import './ActivityForm.css'

interface ActivityFormProps {
  statuses: string[]
  viewMode: ViewMode
  onAdd: (activity: Activity) => void
}

export default function ActivityForm({ statuses, viewMode, onAdd }: ActivityFormProps) {
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState(statuses[0] ?? 'Not Started')
  const [date, setDate] = useState(todayISO())
  const [weekStart, setWeekStart] = useState(currentWeekStart())

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    const now = new Date().toISOString()
    const activity: Activity = {
      id: uuidv4(),
      name: trimmed,
      notes: notes.trim() || undefined,
      status: statuses.includes(status) ? status : statuses[0],
      period: viewMode,
      date: viewMode === 'daily' ? date : weekStart,
      weekStart: viewMode === 'weekly' ? weekStart : undefined,
      createdAt: now,
      updatedAt: now,
    }
    onAdd(activity)
    setName('')
    setNotes('')
    setStatus(statuses[0] ?? 'Not Started')
  }

  return (
    <form className="activity-form" onSubmit={handleSubmit}>
      <UniversalInput label="Task / activity name" value={name} onChange={setName} placeholder="e.g. Finish quarterly report" />

      <UniversalInput label="Notes (optional)" value={notes} onChange={setNotes} placeholder="Any extra detail…" multiline />

      <div className="activity-form__row">
        <label className="activity-form__field">
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        {viewMode === 'daily' ? (
          <label className="activity-form__field">
            <span>Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        ) : (
          <label className="activity-form__field">
            <span>Week starting (Mon)</span>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
            />
          </label>
        )}
      </div>

      <button type="submit" className="activity-form__submit">
        Add activity
      </button>
    </form>
  )
}
