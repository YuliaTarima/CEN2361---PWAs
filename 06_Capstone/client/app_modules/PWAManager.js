// PWA and Service Worker initialization
class PWAManager {
    // Register the service worker if supported
    static async initialize() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('PWAManager: loaded!\nServiceWorker registration successful:', registration);

                // Request notification permissions if available
                if ('Notification' in window) {
                    const permission = await Notification.requestPermission();
                    console.log('PWA Manager: Notification permission:', permission);
                }

                return registration;
            } catch (error) {
                console.error('ServiceWorker registration failed:', error);
                return null;
            }
        }
    }
}
export default PWAManager;