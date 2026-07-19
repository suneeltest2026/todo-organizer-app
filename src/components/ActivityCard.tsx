import { useState } from 'react'
import type { Activity, Priority } from '../types'
import { PRIORITY_LABELS, RECURRENCE_LABELS } from '../types'
import { formatTimeLabel } from '../dateUtils'
import { IconChevronRight, IconClock, IconFlag, IconRepeat, IconTrash } from './icons'
import './ActivityCard.css'

interface ActivityCardProps {
  activity: Activity
  statuses: string[]
  onUpdateStatus: (id: string, status: string) => void
  onDelete: (id: string) => void
  onToggleSubtask: (activityId: string, subtaskId: string) => void
}

const PRIORITY_CLASS: Record<Priority, string> = {
  low: 'activity-card__priority-flag--low',
  medium: 'activity-card__priority-flag--medium',
  high: 'activity-card__priority-flag--high',
  urgent: 'activity-card__priority-flag--urgent',
}

export default function ActivityCard({
  activity,
  statuses,
  onUpdateStatus,
  onDelete,
  onToggleSubtask,
}: ActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const subtasks = activity.subtasks ?? []
  const doneCount = subtasks.filter((s) => s.done).length

  return (
    <li className="activity-card">
      <div className="activity-card__row">
        <div className="activity-card__main">
          <div className="activity-card__title-row">
            {activity.priority && (
              <span
                className={`activity-card__priority-flag ${PRIORITY_CLASS[activity.priority]}`}
                title={`${PRIORITY_LABELS[activity.priority]} priority`}
              >
                <IconFlag size={13} />
              </span>
            )}
            <span className="activity-card__name">{activity.name}</span>
          </div>

          {(activity.time || activity.recurrence) && (
            <div className="activity-card__meta">
              {activity.time && (
                <span className="activity-card__meta-chip">
                  <IconClock size={12} />
                  {formatTimeLabel(activity.time)}
                </span>
              )}
              {activity.recurrence && (
                <span className="activity-card__meta-chip">
                  <IconRepeat size={12} />
                  {RECURRENCE_LABELS[activity.recurrence]}
                </span>
              )}
            </div>
          )}

          {activity.notes && <p className="activity-card__notes">{activity.notes}</p>}
        </div>

        <div className="activity-card__controls">
          <span className={`activity-card__status activity-card__status--${statusSlug(activity.status)}`}>
            <span className="activity-card__status-dot" />
            <select
              value={activity.status}
              onChange={(e) => onUpdateStatus(activity.id, e.target.value)}
              aria-label={`Status for ${activity.name}`}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => onDelete(activity.id)}
            aria-label={`Delete ${activity.name}`}
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>

      {subtasks.length > 0 && (
        <div className="activity-card__subtasks">
          <button
            type="button"
            className="activity-card__subtasks-toggle"
            onClick={() => setIsExpanded((v) => !v)}
            aria-expanded={isExpanded}
          >
            <IconChevronRight
              size={14}
              className={`activity-card__subtasks-chevron ${isExpanded ? 'is-open' : ''}`}
            />
            {doneCount}/{subtasks.length} subtasks
          </button>
          {isExpanded && (
            <ul className="activity-card__subtask-checklist">
              {subtasks.map((s) => (
                <li key={s.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={s.done}
                      onChange={() => onToggleSubtask(activity.id, s.id)}
                    />
                    <span className={s.done ? 'is-done' : ''}>{s.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  )
}

function statusSlug(status: string): string {
  return status.toLowerCase().replace(/\s+/g, '-')
}
