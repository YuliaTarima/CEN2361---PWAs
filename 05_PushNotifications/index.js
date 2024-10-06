// Import required modules
const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");

// Initialize Express application
const app = express();

// Set static path to serve the client files
app.use(express.static(path.join(__dirname, "client")));

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Public VAPID key for push notification service
const publicVapidKey =
    "BJthRQ5myDgc7OSXzPCMftGw-n16F7zQBEN7EUD6XxcfTTvrLGWSIG7y_JxiWtVlCFua0S8MTB5rPziBqNx1qIo";

// Private VAPID key for push notification service
const privateVapidKey = "3KzvKasA2SoCxsp0iIG_o9B0Ozvl1XDwI63JRKNIWBM";

// Setting VAPID details (identifying sender)
webpush.setVapidDetails(
    "mailto:test@test.com",
    publicVapidKey,
    privateVapidKey
);

// Route to handle subscription requests
app.post("/subscribe", (req, res) => {
  // Get pushSubscription object from request body
  const subscription = req.body;

  // Send a response with status 201 indicating resource was created
  res.status(201).json({});

  // Create a payload with a notification title
  const payload = JSON.stringify({ title: "Yulia: Push Test" });

  // Send the notification using the subscription and payload
  webpush
      .sendNotification(subscription, payload)
      // Log any errors
      .catch(err => console.error("Yulia: ", err));
});

// Set the server port
const port = 5000;

// Start the server and log
app.listen(port, () => console.log(`Yulia: Server started on port ${port}`));
