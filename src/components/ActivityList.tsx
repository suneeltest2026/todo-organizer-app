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
  onEdit: (activity: Activity) => void
}

export default function ActivityList({
  activities,
  statuses,
  viewMode,
  onUpdateStatus,
  onDelete,
  onToggleSubtask,
  onEdit,
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
      {sortedKeys.map((key) => {
        const items = groups.get(key)!
        const recurring = items.filter((a) => a.recurrence && a.recurrence !== 'none')
        const oneTime = items.filter((a) => !a.recurrence || a.recurrence === 'none')
        const showSubheadings = recurring.length > 0 && oneTime.length > 0

        return (
          <section key={key} className="activity-list__group">
            <h3 className="activity-list__group-title">{periodLabel(viewMode, key)}</h3>

            {oneTime.length > 0 && (
              <div className="activity-list__subgroup">
                {showSubheadings && <h4 className="activity-list__subgroup-title">One-time</h4>}
                <ActivityCardList
                  activities={oneTime}
                  statuses={statuses}
                  onUpdateStatus={onUpdateStatus}
                  onDelete={onDelete}
                  onToggleSubtask={onToggleSubtask}
                  onEdit={onEdit}
                />
              </div>
            )}

            {recurring.length > 0 && (
              <div className="activity-list__subgroup">
                {showSubheadings && <h4 className="activity-list__subgroup-title">Recurring</h4>}
                <ActivityCardList
                  activities={recurring}
                  statuses={statuses}
                  onUpdateStatus={onUpdateStatus}
                  onDelete={onDelete}
                  onToggleSubtask={onToggleSubtask}
                  onEdit={onEdit}
                />
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

interface ActivityCardListProps {
  activities: Activity[]
  statuses: string[]
  onUpdateStatus: (id: string, status: string) => void
  onDelete: (id: string) => void
  onToggleSubtask: (activityId: string, subtaskId: string) => void
  onEdit: (activity: Activity) => void
}

function ActivityCardList({
  activities,
  statuses,
  onUpdateStatus,
  onDelete,
  onToggleSubtask,
  onEdit,
}: ActivityCardListProps) {
  return (
    <ul className="activity-list__items">
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          statuses={statuses}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
          onToggleSubtask={onToggleSubtask}
          onEdit={onEdit}
        />
      ))}
    </ul>
  )
}
