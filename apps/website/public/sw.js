// HomeHelp worker service worker.
// Receives push events for booking lifecycle changes (assigned /
// started / completed / cancelled). The payload comes from the backend
// via web-push keys on the same user.

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'HomeHelp', body: event.data.text() };
  }
  const title = payload.title || 'HomeHelp';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/icon-192.png',
    data: payload.data || {},
    tag: payload.tag || 'homehelp-update',
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/my-bookings';
  event.waitUntil(self.clients.openWindow(url));
});
