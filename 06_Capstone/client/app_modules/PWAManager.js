// PWA and Service Worker initialization
class PWAManager {
    // Register the service worker if supported
    static async initialize() {
        // Check if the browser supports Service Workers
        if ('serviceWorker' in navigator) {
            try {
                // Register the service worker and await its registration
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('PWAManager: loaded!\nServiceWorker registration successful:', registration);

                // Check if the Notification API is available in the browser
                if ('Notification' in window) {
                    // Request notification permissions from the user
                    const permission = await Notification.requestPermission();
                    console.log('PWA Manager: Notification permission:', permission);
                }

                // Return the service worker registration object if successful
                return registration;
            } catch (error) {
                // Log any errors during service worker registration
                console.error('ServiceWorker registration failed:', error);
                return null;
            }
        }
    }
}
export default PWAManager;
