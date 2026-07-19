import type { Activity, ViewMode } from '../types'
import { periodLabel } from '../dateUtils'
import ActivityCard from './ActivityCard'
import './ActivityList.css'

interface ActivityListProps {
  activities: Activity[]
  statuses: string[]
  viewMode: ViewMode
  onUpdateStatus: (id: string, status: string) => void
  onDelete: (id: string) => void
  onToggleSubtask: (activityId: string, subtaskId: string) => void
}

export default function ActivityList({
  activities,
  statuses,
  viewMode,
  onUpdateStatus,
  onDelete,
  onToggleSubtask,
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
              <ActivityCard
                key={activity.id}
                activity={activity}
                statuses={statuses}
                onUpdateStatus={onUpdateStatus}
                onDelete={onDelete}
                onToggleSubtask={onToggleSubtask}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
