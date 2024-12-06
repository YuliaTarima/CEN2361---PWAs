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

// Allow all requests from all domains & localhost
app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET");
    next();
});

// Middleware to parse JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// VAPID keys for push notifications
webPush.setVapidDetails(
    'mailto:your-email@example.com',  // Replace with your email address
    VAPID_KEY_PUBLIC,
    VAPID_KEY_PRIVATE
);

let subscriptions = []; // Store subscriptions temporarily (use a DB in production)

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

// Endpoint to subscribe to push notifications
app.post('/subscribe', (req, res) => {
    const subscription = req.body;

    // Store the subscription (you should store this in a DB)
    subscriptions.push(subscription);
    console.log('New subscription received:', subscription);

    res.status(201).json({message: 'Subscription created', subscription});
});

// Endpoint to send push notifications to all subscribers
app.post('/sendNotification', (req, res) => {
const {trigger, subscription} = req.body;
    console.log('req.body', req.body);
    const triggerType ={
        onPageLoad: `Welcome to Yulia's Draw and Chat App!`,
    }

    const notificationPayload = {
        notification: {
            title: 'New Message!',
            body: triggerType[trigger],
            icon: '/favicon.ico',
            badge: '/favicon.png',
        },
    };

    // Send the notification to all subscribers
    Promise.all(subscriptions.map(sub => {
        return webPush.sendNotification(sub, notificationPayload);
    }))
        .then(() => {
            res.status(200).json(notificationPayload);
        })
        .catch(err => {
            console.error('Error sending notification', err);
            res.status(500).json({message: 'Error sending notification: '+ err});
        });
});

// Start the server
const PORT = process.env.PORT || 6069;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
