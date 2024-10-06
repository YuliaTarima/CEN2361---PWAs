// Public VAPID key for push notification service
const publicVapidKey =
    "BJthRQ5myDgc7OSXzPCMftGw-n16F7zQBEN7EUD6XxcfTTvrLGWSIG7y_JxiWtVlCFua0S8MTB5rPziBqNx1qIo";

// Check if service workers are supported by the browser
if ("serviceWorker" in navigator) {
  // Call the send function and handle errors if any
  send().catch(err => console.error("Yulia: ", err));
}

// Function to register service worker, register push, and send push notifications
async function send() {
  // Register the service worker with the specified scope
  console.log("Yulia: Registering service worker...");
  const register = await navigator.serviceWorker.register("/worker.js", {
    scope: "/"
  });
  console.log("Yulia: Service Worker Registered...");

  // Register for push notifications
  console.log("Yulia: Registering Push...");
  const subscription = await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });
  console.log("Yulia: Push Registered...");

  // Send the push subscription object to the server via a POST request
  console.log("Yulia: Sending Push...");
  await fetch("/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: {
      "content-type": "application/json"
    }
  });
  console.log("Yulia: Push Sent...");
}

// Function to convert the base64 public key to a UInt8Array
function urlBase64ToUint8Array(base64String) {
  // Add padding to the base64 string if necessary and replace URL-safe characters
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

  // Convert base64 string to a binary array
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  // Populate the output array with character codes from the base64 string
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
