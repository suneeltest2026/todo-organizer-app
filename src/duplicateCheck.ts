import type { Activity } from './types'

/** True if another activity already has this same name (case-insensitive, trimmed). */
export function hasDuplicateName(name: string, activities: Activity[], excludeId?: string): boolean {
  const target = name.trim().toLowerCase()
  if (!target) return false
  return activities.some((a) => a.id !== excludeId && a.name.trim().toLowerCase() === target)
}
