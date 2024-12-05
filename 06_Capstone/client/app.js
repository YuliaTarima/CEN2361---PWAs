import MessagingApp  from './app_modules/MessagingApp.js';
import DrawingApp from "./app_modules/DrawingApp.js";
import UIManager from "./app_modules/UIManager.js";
import PWAManager from "./app_modules/PWAManager.js";

// Initialize the app on page load
document.addEventListener('DOMContentLoaded', async () => {
    new UIManager();
    new DrawingApp();
    new MessagingApp();
    await PWAManager.initialize();
});
