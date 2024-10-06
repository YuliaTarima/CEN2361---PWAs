// Log when the service worker has successfully loaded
console.log("Yulia: Service Worker Loaded...");

// Listen for the 'push' event (triggered when a push notification is received)
self.addEventListener("push", e => {
  // Parse the data received from the push event (assuming it's in JSON format)
  const data = e.data.json();

  // Log that the push notification has been received
  console.log("Yulia: Push Received...");

  // Display the push notification with the provided title, body, and icon
  self.registration.showNotification(data.title, {
    // Body of the notification
    body: "Notified by Yulia",
    // Icon displayed in the notification
    icon: "favicon.png"
  });
});
