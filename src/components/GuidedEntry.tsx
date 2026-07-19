import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Activity, Priority, Recurrence, ViewMode } from '../types'
import { PERIOD_LABELS, PRIORITY_LABELS, PRIORITY_ORDER, RECURRENCE_LABELS, RECURRENCE_ORDER } from '../types'
import UniversalInput from './UniversalInput'
import { periodKeyFor, periodLabel, todayISO } from '../dateUtils'
import { IconChevronLeft, IconChevronRight, IconPlus, IconX } from './icons'
import './GuidedEntry.css'

interface GuidedEntryProps {
  statuses: string[]
  viewMode: ViewMode
  onAdd: (activity: Activity) => void
  onCancel: () => void
}

type StepId = 'name' | 'status' | 'date' | 'repeat' | 'notes'

const STEPS: { id: StepId; label: string; optional?: boolean }[] = [
  { id: 'name', label: 'Task name' },
  { id: 'status', label: 'Status & priority' },
  { id: 'date', label: 'Date & time' },
  { id: 'repeat', label: 'Repeat', optional: true },
  { id: 'notes', label: 'Notes', optional: true },
]

export default function GuidedEntry({ statuses, viewMode, onAdd, onCancel }: GuidedEntryProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [name, setName] = useState('')
  const [status, setStatus] = useState(statuses[0] ?? 'Not Started')
  const [priority, setPriority] = useState<Priority | ''>('')
  const [date, setDate] = useState(todayISO())
  const [time, setTime] = useState('')
  const [recurrence, setRecurrence] = useState<Recurrence>('none')
  const [notes, setNotes] = useState('')

  const step = STEPS[stepIndex]
  const isLastStep = stepIndex === STEPS.length - 1
  const canAdvance = step.id !== 'name' || name.trim().length > 0
  const progressPercent = Math.round(((stepIndex + 1) / STEPS.length) * 100)
  const periodKey = periodKeyFor(viewMode, date)

  function handleNext() {
    if (!canAdvance) return
    if (isLastStep) {
      submit()
    } else {
      setStepIndex((i) => i + 1)
    }
  }

  function handleBack() {
    setStepIndex((i) => Math.max(0, i - 1))
  }

  function resetForm() {
    setStepIndex(0)
    setName('')
    setNotes('')
    setStatus(statuses[0] ?? 'Not Started')
    setPriority('')
    setTime('')
    setRecurrence('none')
  }

  function submit() {
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
    <div className="guided-entry">
      <div className="guided-entry__header">
        <span className="guided-entry__step-label">
          Step {stepIndex + 1} of {STEPS.length}: {step.label}
        </span>
        <button type="button" className="guided-entry__cancel" onClick={onCancel}>
          <IconX size={13} />
          Exit guided mode
        </button>
      </div>

      <div className="guided-entry__progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
        <div className="guided-entry__progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="guided-entry__body">
        {step.id === 'name' && (
          <UniversalInput
            label="What's the task or activity?"
            value={name}
            onChange={setName}
            placeholder="e.g. Finish quarterly report"
            onMultipleDetected={handleAddMultiple}
          />
        )}

        {step.id === 'status' && (
          <div className="guided-entry__field-group">
            <label className="guided-entry__field">
              <span>Current status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="guided-entry__field">
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
        )}

        {step.id === 'date' && (
          <div className="guided-entry__field-group">
            <label className="guided-entry__field">
              <span>Date</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              {viewMode !== 'daily' && (
                <span className="guided-entry__period-hint">
                  {PERIOD_LABELS[viewMode]} bucket: {periodLabel(viewMode, periodKey)}
                </span>
              )}
            </label>
            <label className="guided-entry__field">
              <span>Due time (optional)</span>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </label>
          </div>
        )}

        {step.id === 'repeat' && (
          <label className="guided-entry__field">
            <span>Repeat</span>
            <select value={recurrence} onChange={(e) => setRecurrence(e.target.value as Recurrence)}>
              {RECURRENCE_ORDER.map((r) => (
                <option key={r} value={r}>
                  {RECURRENCE_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
        )}

        {step.id === 'notes' && (
          <UniversalInput label="Any notes? (optional)" value={notes} onChange={setNotes} placeholder="Any extra detail…" multiline />
        )}
      </div>

      <div className="guided-entry__nav">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleBack}
          disabled={stepIndex === 0}
        >
          <IconChevronLeft size={16} />
          Back
        </button>
        <button
          type="button"
          className="btn btn-primary guided-entry__next"
          onClick={handleNext}
          disabled={!canAdvance}
        >
          {isLastStep ? (
            <>
              <IconPlus size={16} />
              Add activity
            </>
          ) : (
            <>
              Next
              <IconChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
