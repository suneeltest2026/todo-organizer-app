import { useState } from 'react'
import type { Activity, ViewMode } from '../types'
import ActivityForm from './ActivityForm'
import GuidedEntry from './GuidedEntry'
import { IconX } from './icons'
import './AddTaskSheet.css'

interface AddTaskSheetProps {
  statuses: string[]
  viewMode: ViewMode
  onAdd: (activity: Activity) => void
  onClose: () => void
}

export default function AddTaskSheet({ statuses, viewMode, onAdd, onClose }: AddTaskSheetProps) {
  const [guidedMode, setGuidedMode] = useState(false)

  function handleAdd(activity: Activity) {
    onAdd(activity)
    onClose()
  }

  return (
    <div className="add-task-sheet__backdrop" onClick={onClose}>
      <div
        className="add-task-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Add task"
      >
        <div className="add-task-sheet__grabber" />
        <div className="add-task-sheet__header">
          <h2>New task</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <IconX size={16} />
          </button>
        </div>

        <div className="add-task-sheet__body">
          {guidedMode ? (
            <GuidedEntry
              statuses={statuses}
              viewMode={viewMode}
              onAdd={handleAdd}
              onCancel={() => setGuidedMode(false)}
            />
          ) : (
            <>
              <ActivityForm statuses={statuses} viewMode={viewMode} onAdd={handleAdd} />
              <button
                type="button"
                className="add-task-sheet__guided-link"
                onClick={() => setGuidedMode(true)}
              >
                Use guided step-by-step entry instead
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
