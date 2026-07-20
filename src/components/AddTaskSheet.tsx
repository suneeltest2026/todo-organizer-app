import { useState } from 'react'
import type { Activity, ViewMode } from '../types'
import ActivityForm from './ActivityForm'
import GuidedEntry from './GuidedEntry'
import { IconX } from './icons'
import './AddTaskSheet.css'

interface AddTaskSheetProps {
  statuses: string[]
  viewMode: ViewMode
  /** When provided, the sheet edits this activity in place instead of creating a new one. */
  activity?: Activity
  /** Current activities, used to warn before adding a task with a name that's already in use. */
  existingActivities: Activity[]
  onSave: (activity: Activity) => void
  onClose: () => void
}

export default function AddTaskSheet({
  statuses,
  viewMode,
  activity,
  existingActivities,
  onSave,
  onClose,
}: AddTaskSheetProps) {
  const [guidedMode, setGuidedMode] = useState(false)
  const isEditing = !!activity

  function handleSave(saved: Activity) {
    onSave(saved)
    onClose()
  }

  return (
    <div className="add-task-sheet__backdrop" onClick={onClose}>
      <div
        className="add-task-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? 'Edit task' : 'Add task'}
      >
        <div className="add-task-sheet__grabber" />
        <div className="add-task-sheet__header">
          <h2>{isEditing ? 'Edit task' : 'New task'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <IconX size={16} />
          </button>
        </div>

        <div className="add-task-sheet__body">
          {!isEditing && guidedMode ? (
            <GuidedEntry
              statuses={statuses}
              viewMode={viewMode}
              existingActivities={existingActivities}
              onAdd={handleSave}
              onCancel={() => setGuidedMode(false)}
            />
          ) : (
            <>
              <ActivityForm
                statuses={statuses}
                viewMode={viewMode}
                activity={activity}
                existingActivities={existingActivities}
                onSave={handleSave}
              />
              {!isEditing && (
                <button
                  type="button"
                  className="add-task-sheet__guided-link"
                  onClick={() => setGuidedMode(true)}
                >
                  Use guided step-by-step entry instead
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
