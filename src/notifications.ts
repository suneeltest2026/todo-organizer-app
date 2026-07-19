export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported'
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission
  }
  return Notification.requestPermission()
}

export function showNotification(title: string, body?: string): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return
  new Notification(title, { body, icon: '/favicon.svg' })
}
