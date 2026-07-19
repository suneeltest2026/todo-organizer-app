import type { Activity, ViewMode } from '../types'
import { periodLabel } from '../dateUtils'
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
    return <p className="activity-list__empty">No activities yet. Add one above to get started.</p>
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
                  <select
                    className={`activity-list__status activity-list__status--${statusSlug(activity.status)}`}
                    value={activity.status}
                    onChange={(e) => onUpdateStatus(activity.id, e.target.value)}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="activity-list__delete"
                    onClick={() => onDelete(activity.id)}
                    aria-label={`Delete ${activity.name}`}
                  >
                    🗑
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
