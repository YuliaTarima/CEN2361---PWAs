const SERVER_URL = `${window.env.SERVER_URL}` || 'http://localhost:6069';
const VAPID_KEY_PUBLIC = window.env.VAPID_KEY_PUBLIC;

export async function notifyServerToSendPush(trigger) {
    const subscription = await getPushSubscriptionClient();
    if (!subscription || !subscription.endpoint) {
        console.log('NotificationManager/notifyServerToSendPush subscription', subscription);
        throw new Error('notifyServerToSendPush: Invalid subscription: Missing endpoint.');
    }
    // Send the subscription and message to the server to trigger a push notification
    const response = await fetch(`${SERVER_URL}/sendNotification`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({trigger, subscription}),
    });

    if (!response.ok) {
        throw new Error('NotificationManager: Server error sending push notification');
    }
    console.log('NotificationManager/notifyServerToSendPush server response', response.json());
}

export async function notificationPermissionGranted() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);

        return permission === 'granted';
    }
    return false;
}

export async function handlePushSubscription(registration) {

            const subscription = await getPushSubscriptionClient();
            if (!subscription) { // Check if the subscription does NOT exist
                const newClientSubscription = await createPushSubscriptionBrowser(registration);
                const newServerSubscription = await createPushSubscriptionServer(newClientSubscription);
                console.log('handlePushSubscription: New push subscription successfully created and sent to server.', newServerSubscription);
            } else {
                console.log('handlePushSubscription: Existing subscription found. No action needed.');
            }
}

async function createPushSubscriptionBrowser(registration) {
    try {
        // Check if pushManager is available in the service worker registration
        if (!registration.pushManager) {
            throw new Error('PushManager is not available');
        }

        // Subscribe to push notifications, if the user has not already subscribed
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true, // Notifications must be visible to the user
            //urlBase64ToUint8Array(VAPID_KEY_PUBLIC)
            applicationServerKey: VAPID_KEY_PUBLIC,
        });

        console.log('createPushSubscriptionBrowser obtained:', subscription);
        return subscription;

    } catch (error) {
        console.error('createPushSubscriptionBrowser: Failed to get push subscription:', error);
        throw error; // Throw error to be handled elsewhere
    }
}

async function createPushSubscriptionServer(subscription) {
    try {

        const response = await fetch(`${SERVER_URL}/subscribe`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({subscription}),
        });

        if (!response.ok) {
            throw new Error('createPushSubscriptionServer: Failed to send subscription to server');
        }
        console.log('createPushSubscriptionServer: Subscription sent to server successfully.', response.body);

    } catch (error) {
        console.error('Error sending subscription to server:', error);
    }
}

async function getPushSubscriptionClient() {
    const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    console.log('getPushSubscriptionClient: Existing subscription found:', subscription);
    return subscription ? subscription : null;
}

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


