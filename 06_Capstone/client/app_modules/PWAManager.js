import { handlePushSubscription } from './NotificationManager.js';

class PWAManager {
    /**
     * Initialize the PWA manager by registering the service worker.
     * @returns {Promise<void>}
     */
    static async initialize() {
        if ('serviceWorker' in navigator) {
            try {
                // Delegate push subscription logic to notifications.js
                await handlePushSubscription();
                console.log('PWAManager: ServiceWorker and notifications initialized.');
            } catch (error) {
                console.error('PWAManager initialization failed:', error);
            }
        } else {
            console.error('Service Workers are not supported in this browser.');
        }
    }
}

export default PWAManager;

