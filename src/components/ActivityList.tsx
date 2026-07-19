import { useState } from 'react'
import type { Activity, Priority, ViewMode } from '../types'
import { PRIORITY_LABELS, RECURRENCE_LABELS } from '../types'
import { formatTimeLabel, periodLabel } from '../dateUtils'
import { IconChevronRight, IconClock, IconFlag, IconRepeat, IconTrash } from './icons'
import './ActivityList.css'

interface ActivityListProps {
  activities: Activity[]
  statuses: string[]
  viewMode: ViewMode
  onUpdateStatus: (id: string, status: string) => void
  onDelete: (id: string) => void
  onToggleSubtask: (activityId: string, subtaskId: string) => void
}

const PRIORITY_CLASS: Record<Priority, string> = {
  low: 'activity-list__priority-flag--low',
  medium: 'activity-list__priority-flag--medium',
  high: 'activity-list__priority-flag--high',
  urgent: 'activity-list__priority-flag--urgent',
}

export default function ActivityList({
  activities,
  statuses,
  viewMode,
  onUpdateStatus,
  onDelete,
  onToggleSubtask,
}: ActivityListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const relevant = activities.filter((a) => a.period === viewMode)

  const groups = new Map<string, Activity[]>()
  for (const activity of relevant) {
    const key = activity.periodKey
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(activity)
  }
  const sortedKeys = Array.from(groups.keys()).sort((a, b) => b.localeCompare(a))

  if (sortedKeys.length === 0) {
    return (
      <div className="activity-list__empty">
        <p className="activity-list__empty-title">No activities yet</p>
        <p className="activity-list__empty-hint">Add one above to get started.</p>
      </div>
    )
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="activity-list">
      {sortedKeys.map((key) => (
        <section key={key} className="activity-list__group">
          <h3 className="activity-list__group-title">{periodLabel(viewMode, key)}</h3>
          <ul className="activity-list__items">
            {groups.get(key)!.map((activity) => {
              const subtasks = activity.subtasks ?? []
              const doneCount = subtasks.filter((s) => s.done).length
              const isExpanded = expanded.has(activity.id)

              return (
                <li key={activity.id} className="activity-list__item">
                  <div className="activity-list__item-row">
                    <div className="activity-list__item-main">
                      <div className="activity-list__item-title-row">
                        {activity.priority && (
                          <span
                            className={`activity-list__priority-flag ${PRIORITY_CLASS[activity.priority]}`}
                            title={`${PRIORITY_LABELS[activity.priority]} priority`}
                          >
                            <IconFlag size={13} />
                          </span>
                        )}
                        <span className="activity-list__item-name">{activity.name}</span>
                      </div>

                      {(activity.time || activity.recurrence) && (
                        <div className="activity-list__item-meta">
                          {activity.time && (
                            <span className="activity-list__meta-chip">
                              <IconClock size={12} />
                              {formatTimeLabel(activity.time)}
                            </span>
                          )}
                          {activity.recurrence && (
                            <span className="activity-list__meta-chip">
                              <IconRepeat size={12} />
                              {RECURRENCE_LABELS[activity.recurrence]}
                            </span>
                          )}
                        </div>
                      )}

                      {activity.notes && <p className="activity-list__item-notes">{activity.notes}</p>}
                    </div>

                    <div className="activity-list__item-controls">
                      <span
                        className={`activity-list__status activity-list__status--${statusSlug(activity.status)}`}
                      >
                        <span className="activity-list__status-dot" />
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
                    <div className="activity-list__subtasks">
                      <button
                        type="button"
                        className="activity-list__subtasks-toggle"
                        onClick={() => toggleExpanded(activity.id)}
                        aria-expanded={isExpanded}
                      >
                        <IconChevronRight
                          size={14}
                          className={`activity-list__subtasks-chevron ${isExpanded ? 'is-open' : ''}`}
                        />
                        {doneCount}/{subtasks.length} subtasks
                      </button>
                      {isExpanded && (
                        <ul className="activity-list__subtask-checklist">
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
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

function statusSlug(status: string): string {
  return status.toLowerCase().replace(/\s+/g, '-')
}
