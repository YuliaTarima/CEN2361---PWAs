import MessagingApp from './app_modules/MessagingApp.js';
import DrawingApp from "./app_modules/DrawingApp.js";
import UIManager from "./app_modules/UIManager.js";
import PWAManager from "./app_modules/PWAManager.js";

(async () => {
    try {
        // Initialize the app on page load
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                console.log("Initializing app modules...");
                // Initialize app modules
                new UIManager();
                new DrawingApp();
                new MessagingApp();
                await PWAManager.initialize();



            } catch (error) {
                console.error("App.js: Error Initializing app modules:", error);
            }
        });

    } catch (error) {
        console.error("App.js: Error initializing the app:", error);
    }
})();
