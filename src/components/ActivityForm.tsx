import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Activity, Priority, Recurrence, SubTask, ViewMode } from '../types'
import { PERIOD_LABELS, PRIORITY_LABELS, PRIORITY_ORDER, RECURRENCE_LABELS, RECURRENCE_ORDER } from '../types'
import UniversalInput from './UniversalInput'
import { periodKeyFor, periodLabel, todayISO } from '../dateUtils'
import { IconListChecks, IconPlus, IconX } from './icons'
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
  const [time, setTime] = useState('')
  const [priority, setPriority] = useState<Priority | ''>('')
  const [recurrence, setRecurrence] = useState<Recurrence>('none')
  const [subtasks, setSubtasks] = useState<SubTask[]>([])
  const [newSubtask, setNewSubtask] = useState('')

  const periodKey = periodKeyFor(viewMode, date)

  function addSubtask() {
    const trimmed = newSubtask.trim()
    if (!trimmed) return
    setSubtasks((prev) => [...prev, { id: uuidv4(), name: trimmed, done: false }])
    setNewSubtask('')
  }

  function removeSubtask(id: string) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id))
  }

  function resetForm() {
    setName('')
    setNotes('')
    setStatus(statuses[0] ?? 'Not Started')
    setTime('')
    setPriority('')
    setRecurrence('none')
    setSubtasks([])
    setNewSubtask('')
  }

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
      date,
      time: time || undefined,
      priority: priority || undefined,
      recurrence: recurrence !== 'none' ? recurrence : undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
      periodKey,
      createdAt: now,
      updatedAt: now,
    }
    onAdd(activity)
    resetForm()
  }

  function handleAddMultiple(items: string[]) {
    const now = new Date().toISOString()
    for (const raw of items) {
      const trimmed = raw.trim()
      if (!trimmed) continue
      onAdd({
        id: uuidv4(),
        name: trimmed,
        notes: undefined,
        status: statuses.includes(status) ? status : statuses[0],
        period: viewMode,
        date,
        time: time || undefined,
        priority: priority || undefined,
        recurrence: recurrence !== 'none' ? recurrence : undefined,
        periodKey,
        createdAt: now,
        updatedAt: now,
      })
    }
    resetForm()
  }

  return (
    <form className="activity-form" onSubmit={handleSubmit}>
      <UniversalInput
        label="Task / activity name"
        value={name}
        onChange={setName}
        placeholder="e.g. Finish quarterly report"
        onMultipleDetected={handleAddMultiple}
      />

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

        <label className="activity-form__field">
          <span>Priority</span>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority | '')}>
            <option value="">No priority</option>
            {PRIORITY_ORDER.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="activity-form__row">
        <label className="activity-form__field">
          <span>Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          {viewMode !== 'daily' && (
            <span className="activity-form__period-hint">
              {PERIOD_LABELS[viewMode]} bucket: {periodLabel(viewMode, periodKey)}
            </span>
          )}
        </label>

        <label className="activity-form__field">
          <span>Due time (optional)</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>

      <label className="activity-form__field">
        <span>Repeat</span>
        <select value={recurrence} onChange={(e) => setRecurrence(e.target.value as Recurrence)}>
          {RECURRENCE_ORDER.map((r) => (
            <option key={r} value={r}>
              {RECURRENCE_LABELS[r]}
            </option>
          ))}
        </select>
      </label>

      <div className="activity-form__subtasks">
        <span className="activity-form__subtasks-label">
          <IconListChecks size={15} />
          Subtasks (optional)
        </span>
        {subtasks.length > 0 && (
          <ul className="activity-form__subtask-list">
            {subtasks.map((s) => (
              <li key={s.id} className="activity-form__subtask-item">
                <span>{s.name}</span>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => removeSubtask(s.id)}
                  aria-label={`Remove subtask ${s.name}`}
                >
                  <IconX size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="activity-form__subtask-add">
          <input
            className="activity-form__subtask-input"
            placeholder="Add a checklist step…"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addSubtask()
              }
            }}
          />
          <button type="button" className="btn btn-secondary btn-sm" onClick={addSubtask}>
            <IconPlus size={14} />
            Add
          </button>
        </div>
      </div>

      <button type="submit" className="btn btn-primary activity-form__submit">
        <IconPlus size={16} />
        Add activity
      </button>
    </form>
  )
}
