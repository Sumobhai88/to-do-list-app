// Service Worker for PWA functionality
const CACHE_NAME = 'sumo-task-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/enhanced-script.js',
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Orbitron:wght@400;700;900&display=swap'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});

// Background sync for offline task creation
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(syncTasks());
    }
});

async function syncTasks() {
    // Sync pending tasks when back online
    const pendingTasks = await getStoredPendingTasks();
    for (const task of pendingTasks) {
        try {
            await syncTaskToServer(task);
            await removePendingTask(task.id);
        } catch (error) {
            console.error('Failed to sync task:', error);
        }
    }
}

// Push notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Task reminder!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'complete',
                title: 'Mark Complete',
                icon: '/check-icon.png'
            },
            {
                action: 'snooze',
                title: 'Snooze 10min',
                icon: '/snooze-icon.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Sumo Task', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'complete') {
        // Handle task completion
        event.waitUntil(
            clients.openWindow('/').then(client => {
                client.postMessage({
                    action: 'completeTask',
                    taskId: event.notification.data.taskId
                });
            })
        );
    } else if (event.action === 'snooze') {
        // Handle snooze
        event.waitUntil(
            scheduleNotification(event.notification.data.taskId, 10 * 60 * 1000)
        );
    } else {
        // Default action - open app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});