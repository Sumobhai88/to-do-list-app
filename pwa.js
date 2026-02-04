// PWA functionality and installation
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }
    
    init() {
        this.checkInstallation();
        this.setupInstallPrompt();
        this.setupUpdateCheck();
        this.handleOfflineMode();
        this.setupNotifications();
    }
    
    checkInstallation() {
        // Check if app is installed
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            this.isInstalled = true;
            document.body.classList.add('pwa-installed');
        }
    }
    
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
        
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.hideInstallButton();
            this.showNotification('App installed successfully!', 'success');
        });
    }
    
    showInstallButton() {
        if (this.isInstalled) return;
        
        const installBtn = document.createElement('button');
        installBtn.id = 'install-app';
        installBtn.className = 'install-btn';
        installBtn.innerHTML = '📱 INSTALL APP';
        installBtn.title = 'Install Neon Tasks as an app';
        
        installBtn.addEventListener('click', () => this.installApp());
        
        const headerControls = document.querySelector('.header-controls');
        if (headerControls) {
            headerControls.appendChild(installBtn);
        }
    }
    
    hideInstallButton() {
        const installBtn = document.getElementById('install-app');
        if (installBtn) {
            installBtn.remove();
        }
    }
    
    async installApp() {
        if (!this.deferredPrompt) return;
        
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        
        this.deferredPrompt = null;
    }
    
    setupUpdateCheck() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                this.showUpdateNotification();
            });
        }
    }
    
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <span>🔄 New version available!</span>
                <button onclick="window.location.reload()" class="update-btn">UPDATE</button>
                <button onclick="this.parentElement.parentElement.remove()" class="dismiss-btn">✕</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }
    
    handleOfflineMode() {
        window.addEventListener('online', () => {
            this.updateConnectionStatus(true);
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.updateConnectionStatus(false);
        });
        
        // Initial check
        this.updateConnectionStatus(navigator.onLine);
    }
    
    updateConnectionStatus(isOnline) {
        const syncStatus = document.getElementById('sync-status');
        if (syncStatus) {
            syncStatus.textContent = isOnline ? 'ONLINE' : 'OFFLINE';
            syncStatus.style.color = isOnline ? 'var(--neon-green)' : 'var(--accent-orange)';
        }
        
        if (!isOnline) {
            this.showNotification('You are offline. Changes will sync when connection is restored.', 'warning');
        }
    }
    
    async syncOfflineData() {
        // Sync any offline changes when back online
        try {
            const pendingChanges = localStorage.getItem('pendingSync');
            if (pendingChanges) {
                // Process pending changes
                console.log('Syncing offline changes...');
                localStorage.removeItem('pendingSync');
                this.showNotification('Offline changes synced successfully!', 'success');
            }
        } catch (error) {
            console.error('Error syncing offline data:', error);
        }
    }
    
    setupNotifications() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            this.requestNotificationPermission();
        }
    }
    
    async requestNotificationPermission() {
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.showNotification('Notifications enabled!', 'success');
                this.scheduleTaskReminders();
            }
        } else if (Notification.permission === 'granted') {
            this.scheduleTaskReminders();
        }
    }
    
    scheduleTaskReminders() {
        // Schedule notifications for tasks with due dates
        const tasks = JSON.parse(localStorage.getItem('neonTasks') || '[]');
        const now = new Date();
        
        tasks.forEach(task => {
            if (task.dueDate && !task.completed) {
                const dueDate = new Date(task.dueDate);
                const timeDiff = dueDate.getTime() - now.getTime();
                
                // Schedule notification 1 hour before due date
                if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000) {
                    const reminderTime = Math.max(0, timeDiff - 60 * 60 * 1000);
                    
                    setTimeout(() => {
                        this.showTaskReminder(task);
                    }, reminderTime);
                }
            }
        });
    }
    
    showTaskReminder(task) {
        if (Notification.permission === 'granted') {
            const notification = new Notification('Task Reminder', {
                body: `"${task.text}" is due soon!`,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/badge-72x72.png',
                tag: `task-${task.id}`,
                requireInteraction: true,
                actions: [
                    {
                        action: 'complete',
                        title: 'Mark Complete'
                    },
                    {
                        action: 'snooze',
                        title: 'Snooze 1h'
                    }
                ]
            });
            
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
    }
    
    showNotification(message, type = 'info') {
        // Fallback to in-app notification if system notifications aren't available
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notifications-container') || document.body;
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Share API integration
    async shareTask(task) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Neon Tasks',
                    text: `Task: ${task.text}`,
                    url: window.location.href
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback to clipboard
            this.copyToClipboard(`Task: ${task.text}\n\nShared from Neon Tasks`);
        }
    }
    
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    }
    
    // Background sync for offline task creation
    registerBackgroundSync(data) {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then(registration => {
                return registration.sync.register('background-sync');
            });
            
            // Store data for sync
            const pendingSync = JSON.parse(localStorage.getItem('pendingSync') || '[]');
            pendingSync.push(data);
            localStorage.setItem('pendingSync', JSON.stringify(pendingSync));
        }
    }
}

// Initialize PWA manager
document.addEventListener('DOMContentLoaded', () => {
    new PWAManager();
});

// Add CSS for PWA components
const pwaStyles = `
.install-btn {
    background: linear-gradient(45deg, var(--neon-green), var(--neon-cyan));
    border: none;
    color: var(--dark-bg);
    padding: 0.5rem 1rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.install-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px var(--shadow-cyan);
}

.update-notification {
    position: fixed;
    top: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: var(--dark-bg);
    border: 2px solid var(--neon-cyan);
    padding: 1rem;
    z-index: 3000;
    animation: slideDown 0.3s ease-out;
}

.update-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-family: 'JetBrains Mono', monospace;
    color: var(--text-primary);
}

.update-btn {
    background: var(--neon-cyan);
    color: var(--dark-bg);
    border: none;
    padding: 0.3rem 0.8rem;
    cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    font-weight: 600;
}

.dismiss-btn {
    background: none;
    border: 1px solid var(--text-secondary);
    color: var(--text-secondary);
    padding: 0.3rem 0.5rem;
    cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
}

.pwa-installed .install-btn {
    display: none;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateX(-50%) translateY(-100%);
    }
    to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
}
`;

// Inject PWA styles
const styleSheet = document.createElement('style');
styleSheet.textContent = pwaStyles;
document.head.appendChild(styleSheet);