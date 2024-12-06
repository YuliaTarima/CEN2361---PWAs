require('dotenv').config();
const OPENAI_KEY = process.env.OPENAI_KEY;
const GPT_URL = process.env.GPT_URL;
const VAPID_KEY_PUBLIC = process.env.VAPID_KEY_PUBLIC;
const VAPID_KEY_PRIVATE = process.env.VAPID_KEY_PRIVATE;
const fetch = require('node-fetch');
const express = require('express');
const bodyParser = require('body-parser');
const webPush = require('web-push');

const app = express();

// Middleware to parse JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Allow all requests from all domains & localhost
app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET");
    next();
});

// Basic route for testing
app.get('/', function (req, res) {
    res.send("Hello World!");
});

// GPT endpoint
app.post('/gpt', async function (req, res) {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({error: 'Message is required'});
    }

    try {
        const response = await fetch(GPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{role: "user", content: userMessage}]
            })
        });
        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({error: data.error.message});
        }

        res.json({reply: data.choices[0].message.content});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// --------------------------------------------------------
// Push Notifications Logic

// VAPID keys for push notifications (identifying sender)
webPush.setVapidDetails(
    "mailto:test@test.com",
    VAPID_KEY_PUBLIC,
    VAPID_KEY_PRIVATE
);

// Store subscriptions
let subscriptions = [];

// Function to check if a subscription already exists
function subscriptionExists(subscriptionFromClient) {
    return subscriptions.some(
        (sub) => sub.endpoint === subscriptionFromClient.endpoint
    );
}

// Function to create a push payload
function createPushPayloadByTriggerType(trigger, title = 'New Message!') {

    const triggerType = {
        onPageLoad: `Welcome to Yulia's Draw and Chat App!`,
        newSubscription: `Yulia's DrawChat: New notification subscription created!`,
        existingSubscription: `Welcome back! We are happy to see you again!`,
        default: 'Welcome to the App!'
    }
    const body = triggerType[trigger] || triggerType['default'];

    return JSON.stringify({
        notification: {
            title,
            body,
            // icon: '/favicon.ico',
            // badge: '/favicon.png',
        },
    });
}

// Function to send push notifications to client
async function sendPushNotification(subscription, payload) {
    try {
        await webPush.sendNotification(subscription, payload);
        console.log('createPushPayloadByTriggerType: Notification sent successfully:', subscription.endpoint);
    } catch (err) {
        console.error('createPushPayloadByTriggerType: Error sending notification:', err);
    }
}

// Function to send notification to all recipients
async function sendToAllRecipients(subscriptions, notificationPayload, res) {
    try {
        // Wait for all notifications to be sent
        await Promise.all(subscriptions.map(subscription => sendPushNotification(subscription, notificationPayload)));
        console.log(`/sendNotification sent to all recipients: `, notificationPayload);
        res.status(200).json(notificationPayload);
    } catch (err) {
        console.error('/sendNotification: Error sending notification', err);
        res.status(500).json({ message: 'Error sending notification: ' + err });
    }
}

// Function to send notification to all recipients
async function sendToSingleRecipient(subscription, notificationPayload, res) {
    try {
        // Wait for all notifications to be sent
        await sendPushNotification(subscription, notificationPayload);
        console.log(`sendToSingleRecipient: sent: `, notificationPayload);
        res.status(200).json(notificationPayload);
    } catch (err) {
        console.error('sendToSingleRecipient: error: ', err);
        res.status(500).json({ message: 'Error sending notification: ' + err });
    }
}

//--------------------------------------------------------
// Subscription Endpoints

// Endpoint to handle subscriptions for push notifications
app.post('/subscribe', (req, res) => {
    // Get push subscription object from request body
    const subscription = req.body;

    (async () => {
        try {
            // Check if the subscription already exists
            const userSubscribed = subscriptionExists(subscription)
            console.log('Subscription exists: ', userSubscribed, subscription);
            const resStatus = userSubscribed ? 200 : 201;
            const triggerType = userSubscribed ? 'existingSubscription' : 'newSubscription';
            if (!userSubscribed) {
                subscriptions.push(subscription);
            }
            const payload = createPushPayloadByTriggerType(triggerType);
            const notification = await sendPushNotification(subscription, payload);
            return res.status(resStatus).json({notification, subscription});
        } catch (err) {
            console.error('Error sending push notification:', err);
            return res.status(500).json({
                message: `/subscribe: Error sending push notification`,
                error: err
            });
        }
    })(); // Immediately invoke the async function
    return; // Prevent further execution of the route handler
});

// Endpoint to send push notifications to all subscribers
app.post('/sendNotification', (req, res) => {
    const {trigger, subscription} = req.body;
    console.log('/sendNotification trigger ', trigger);
    const notificationPayload = createPushPayloadByTriggerType(trigger);

    (async () => {
        try {
            await sendToSingleRecipient(subscription, notificationPayload, res)
        } catch (err) {
            console.error('/sendNotification: Error sending notification', err);
            res.status(500).json({message: 'Error sending notification: ' + err});
        }
    })(); // Immediately invoke the async function
    return; // Prevent further execution of the route handler
});

// Start the server
const PORT = process.env.PORT || 6069;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
