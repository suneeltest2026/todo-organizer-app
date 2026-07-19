import { useState } from 'react'
import './StatusManager.css'

interface StatusManagerProps {
  statuses: string[]
  onChange: (statuses: string[]) => void
}

export default function StatusManager({ statuses, onChange }: StatusManagerProps) {
  const [newStatus, setNewStatus] = useState('')

  function addStatus() {
    const trimmed = newStatus.trim()
    if (!trimmed || statuses.includes(trimmed)) return
    onChange([...statuses, trimmed])
    setNewStatus('')
  }

  function removeStatus(status: string) {
    if (statuses.length <= 1) return
    onChange(statuses.filter((s) => s !== status))
  }

  function renameStatus(oldName: string, newName: string) {
    const trimmed = newName.trim()
    if (!trimmed) return
    onChange(statuses.map((s) => (s === oldName ? trimmed : s)))
  }

  return (
    <div className="status-manager">
      <ul className="status-manager__list">
        {statuses.map((status) => (
          <li key={status} className="status-manager__item">
            <input
              className="status-manager__input"
              value={status}
              onChange={(e) => renameStatus(status, e.target.value)}
            />
            <button
              type="button"
              className="status-manager__remove"
              onClick={() => removeStatus(status)}
              disabled={statuses.length <= 1}
              aria-label={`Remove status ${status}`}
              title={statuses.length <= 1 ? 'At least one status is required' : 'Remove status'}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <div className="status-manager__add">
        <input
          className="status-manager__input"
          placeholder="Add new status…"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addStatus()}
        />
        <button type="button" className="status-manager__add-btn" onClick={addStatus}>
          Add
        </button>
      </div>
    </div>
  )
}
