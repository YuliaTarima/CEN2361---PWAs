import {handlePushSubscription, notifyServerToSendPush, notificationPermissionGranted} from './NotificationManager.js';

class PWAManager {
    /**
     * Initialize the PWA manager by registering the service worker.
     * @returns {Promise<void>}
     */
    static async initialize() {
        try {
            if ('serviceWorker' in navigator) {
                try {
                    // Check if service workers are already registered
                    const registrations = await navigator.serviceWorker.getRegistrations();

                    if (registrations.length > 0) {
                        window.isServiceWorkerRegistered = true;
                        // console.log('PWAManager: window.isServiceWorkerRegistered: ', window.isServiceWorkerRegistered);
                        // Return the first registration found
                        window.serviceWorkerRegistration = registrations[0];
                        // console.log('PWAManager: window.serviceWorkerRegistration: ', window.serviceWorkerRegistration);
                        // Ensure push subscription is handled
                        // Notify the server to send a welcome push notification
                        // Check if notifications are supported and permission is granted
                        const isNotificationPermissionGranted = notificationPermissionGranted();
                        if (isNotificationPermissionGranted) {
                            await handlePushSubscription(registrations[0]);
                            await notifyServerToSendPush("onPageLoad");
                        }
                    } else {
                        console.log('PWAManager: No service worker registration found');
                        return null; // No registration found, early return
                    }
                } catch (error) {
                    console.error('PWAManager: Error checking service worker registration:', error);
                    return null; // Error occurred, return null
                }
            } else {
                console.error('PWAManager: Service Workers are not supported in this browser.');
                return null; // Service workers are not supported, return null
            }
        } catch (error) {
            console.error('PWAManager: Unexpected error:', error);
            return null; // Unexpected error, return null
        }
    }
}

export default PWAManager;
