/**
 * Handle push subscription for notifications.
 * @returns {Promise<void>}
 */
export async function handlePushSubscription() {
    if ('serviceWorker' in navigator) {
        try {
            // Register the service worker
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('ServiceWorker registered:', registration);

            // Check if notifications are supported and permission is granted
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                console.log('Notification permission:', permission);

                if (permission === 'granted') {
                    const subscription = await getPushSubscription(registration);
                    if (subscription) {
                        await sendSubscriptionToServer(subscription);
                        console.log('Push subscription successfully handled.');
                    }
                }
            }
        } catch (error) {
            console.error('Error handling push subscription:', error);
        }
    } else {
        console.error('Service Workers are not supported in this browser.');
    }
}

/**
 * Get or create a push subscription.
 * @param {ServiceWorkerRegistration} registration
 * @returns {Promise<PushSubscription>}
 */
async function getPushSubscription(registration) {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
        console.log('Existing subscription found:', subscription);
        return subscription;
    }

    // Create a new subscription
    const publicKey = window.env.VAPID_KEY_PUBLIC; // Replace with your actual public VAPID key
    const applicationServerKey = urlBase64ToUint8Array(publicKey);
    return await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
    });
}

/**
 * Send push subscription to the server.
 * @param {PushSubscription} subscription
 */
async function sendSubscriptionToServer(subscription) {
    try {
        const response = await fetch('http://localhost:6069/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
        });

        if (!response.ok) {
            throw new Error('Failed to send subscription to server');
        }

        console.log('Push subscription sent to server successfully.');
    } catch (error) {
        console.error('Error sending subscription to server:', error);
    }
}

/**
 * Convert VAPID public key from base64 to Uint8Array.
 * @param {string} base64String
 * @returns {Uint8Array}
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
