import type { Activity, ViewMode } from '../types'
import { periodLabel } from '../dateUtils'
import { IconTrash } from './icons'
import './ActivityList.css'

interface ActivityListProps {
  activities: Activity[]
  statuses: string[]
  viewMode: ViewMode
  onUpdateStatus: (id: string, status: string) => void
  onDelete: (id: string) => void
}

export default function ActivityList({
  activities,
  statuses,
  viewMode,
  onUpdateStatus,
  onDelete,
}: ActivityListProps) {
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

  return (
    <div className="activity-list">
      {sortedKeys.map((key) => (
        <section key={key} className="activity-list__group">
          <h3 className="activity-list__group-title">{periodLabel(viewMode, key)}</h3>
          <ul className="activity-list__items">
            {groups.get(key)!.map((activity) => (
              <li key={activity.id} className="activity-list__item">
                <div className="activity-list__item-main">
                  <span className="activity-list__item-name">{activity.name}</span>
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
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function statusSlug(status: string): string {
  return status.toLowerCase().replace(/\s+/g, '-')
}
