import  MessagingApp  from './modules/MessagingApp.js';
import DrawingApp from "./modules/DrawingApp.js";
import UIManager from "./modules/UIManager.js";
import PWAManager from "./modules/PWAManager.js";

// Initialize the app on page load
document.addEventListener('DOMContentLoaded', async () => {
    new UIManager();
    new DrawingApp();
    new MessagingApp();
    await PWAManager.initialize();
});
