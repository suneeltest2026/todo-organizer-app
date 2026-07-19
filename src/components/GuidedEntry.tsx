import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Activity, ViewMode } from '../types'
import UniversalInput from './UniversalInput'
import { currentWeekStart, todayISO } from '../dateUtils'
import './GuidedEntry.css'

interface GuidedEntryProps {
  statuses: string[]
  viewMode: ViewMode
  onAdd: (activity: Activity) => void
  onCancel: () => void
}

type StepId = 'name' | 'status' | 'date' | 'notes'

const STEPS: { id: StepId; label: string; optional?: boolean }[] = [
  { id: 'name', label: 'Task name' },
  { id: 'status', label: 'Status' },
  { id: 'date', label: 'Date' },
  { id: 'notes', label: 'Notes', optional: true },
]

export default function GuidedEntry({ statuses, viewMode, onAdd, onCancel }: GuidedEntryProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [name, setName] = useState('')
  const [status, setStatus] = useState(statuses[0] ?? 'Not Started')
  const [date, setDate] = useState(todayISO())
  const [weekStart, setWeekStart] = useState(currentWeekStart())
  const [notes, setNotes] = useState('')

  const step = STEPS[stepIndex]
  const isLastStep = stepIndex === STEPS.length - 1
  const canAdvance = step.id !== 'name' || name.trim().length > 0
  const progressPercent = Math.round(((stepIndex + 1) / STEPS.length) * 100)

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
      date: viewMode === 'daily' ? date : weekStart,
      weekStart: viewMode === 'weekly' ? weekStart : undefined,
      createdAt: now,
      updatedAt: now,
    }
    onAdd(activity)
    setStepIndex(0)
    setName('')
    setNotes('')
    setStatus(statuses[0] ?? 'Not Started')
  }

  return (
    <div className="guided-entry">
      <div className="guided-entry__header">
        <span className="guided-entry__step-label">
          Step {stepIndex + 1} of {STEPS.length}: {step.label}
        </span>
        <button type="button" className="guided-entry__cancel" onClick={onCancel}>
          Exit guided mode
        </button>
      </div>

      <div className="guided-entry__progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
        <div className="guided-entry__progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="guided-entry__body">
        {step.id === 'name' && (
          <UniversalInput label="What's the task or activity?" value={name} onChange={setName} placeholder="e.g. Finish quarterly report" />
        )}

        {step.id === 'status' && (
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
        )}

        {step.id === 'date' &&
          (viewMode === 'daily' ? (
            <label className="guided-entry__field">
              <span>Date</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
          ) : (
            <label className="guided-entry__field">
              <span>Week starting (Mon)</span>
              <input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
            </label>
          ))}

        {step.id === 'notes' && (
          <UniversalInput label="Any notes? (optional)" value={notes} onChange={setNotes} placeholder="Any extra detail…" multiline />
        )}
      </div>

      <div className="guided-entry__nav">
        <button type="button" className="guided-entry__back" onClick={handleBack} disabled={stepIndex === 0}>
          Back
        </button>
        <button type="button" className="guided-entry__next" onClick={handleNext} disabled={!canAdvance}>
          {isLastStep ? 'Add activity' : 'Next'}
        </button>
      </div>
    </div>
  )
}
