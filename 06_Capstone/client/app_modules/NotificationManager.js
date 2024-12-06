const SERVER_URL = `${window.env.SERVER_URL}` || 'http://localhost:6069';

/**
 * Handle push subscription for notifications.
 * @returns {Promise<void>}
 */
export async function handlePushSubscription() {
    // Check if notifications are supported and permission is granted
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);

        if (permission === 'granted') {
            const subscription = await getPushSubscription();

            if (!subscription) { // Check if the subscription does NOT exist
                const newSubscription = await createPushSubscription();
                console.log('handlePushSubscription: New push subscription successfully created and sent to server.');

            } else {
                console.log('handlePushSubscription: Existing subscription found. No action needed.');
            }
        }
    }
}


/**
 * Send the push subscription to the server.
 * @param {PushSubscription} subscription - The push subscription object.
 * @returns {Promise<void>}
 */
async function createPushSubscription(subscription) {
    try {
        const response = await fetch(`${SERVER_URL}/subscribe`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({subscription}),
        });

        if (!response.ok) {
            throw new Error('createPushSubscription: Failed to send subscription to server');
        }
        console.log('createPushSubscription: Subscription sent to server successfully.', response.body);

    } catch (error) {
        console.error('Error sending subscription to server:', error);
    }
}


/**
 * Get or create a push subscription.
 * @returns {Promise<PushSubscription>}
 */
async function getPushSubscription() {
    const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    console.log('getPushSubscription: Existing subscription found:', subscription);
    return subscription ? subscription : null;
}


export async function notifyServerToSendPush(trigger) {
    const subscription = await getPushSubscription();
    if (!subscription || !subscription.endpoint) {
        throw new Error('notifyServerToSendPush: Invalid subscription: Missing endpoint.');
    }
    const payload = {trigger, subscription};

    // Send the subscription and message to the server to trigger a push notification
    const response = await fetch(`${SERVER_URL}/sendNotification`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({trigger, subscription}),
    });

    if (!response.ok) {
        throw new Error('NotificationManager: Server error sending push notification');
    }
    console.log('NotificationManager: server response', response.json());

}

/**
 * Utility function to convert VAPID public key to a Uint8Array.
 * @param {string} base64Url - Base64 URL encoded string of the VAPID public key.
 * @returns {Uint8Array}
 */
function urlBase64ToUint8Array(base64Url) {
    const padding = '='.repeat((4 - base64Url.length % 4) % 4); // Add padding to make it valid base64 string
    const base64 = (base64Url + padding).replace(/\-/g, '+').replace(/_/g, '/'); // Convert from base64url to base64
    const rawData = atob(base64); // Decode base64 string
    const outputArray = new Uint8Array(rawData.length); // Create an array to store the decoded data

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i); // Fill the array with the decoded data
    }
    return outputArray;
}


