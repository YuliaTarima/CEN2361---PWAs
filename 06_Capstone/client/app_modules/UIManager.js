// UIManager class to manage and initialize the user interface
class UIManager {
    // Constructor to initialize UIManager, set up theme handling, and connection status updates
    constructor() {
        console.log('UIManager: loaded!');
        this.initializeUI();
        this.setupThemeHandling();
        this.setupConnectionStatus();
    }

    // Initialize the layout and UI components of the app
    initializeUI() {
        console.log('HTML comes from UIManager.')
        document.body.innerHTML = `
            <div class="app-header">
                <h1>Yulia's Drawing and Chatting App</h1>
                <div class="connection-status" id="connectionStatus"></div>
<!--                <button class="hidden" id="installPWA">Install App</button>-->
                    <button id="installPWA">Install App</button>
            </div>
            <div class="app-container">
                <div class="drawing-section">
                    <div class="drawing-controls">
                        <input id="colorPicker" type="color" value="#317EFB">
                        <input id="brushSize" max="20" min="1" type="range" value="2">
                        <button id="clearCanvas">Clear</button>
                        <button id="downloadDrawing">Download</button>
                    </div>
                    <canvas id="drawingCanvas"></canvas>
                </div>
                <div class="messaging-section">
                    <div id="messageHistory"></div>
                    <div class="message-input">
                        <textarea id="messageInput" placeholder="Type your message here"></textarea>
                        <button id="sendMessage">Send</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Detect and apply the user's theme preference (light or dark mode)
    setupThemeHandling() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        const handleThemeChange = (e) => {
            document.body.classList.toggle('dark-theme', e.matches);
        };
        prefersDark.addListener(handleThemeChange); // Listen for theme changes
        handleThemeChange(prefersDark); // Apply the current theme preference
    }

    // Display the online/offline connection status on the UI
    setupConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        const updateConnectionStatus = () => {
            statusElement.textContent = navigator.onLine ? 'Online' : 'Offline';
            statusElement.className = `connection-status ${navigator.onLine ? 'online' : 'offline'}`;
        };
        window.addEventListener('online', updateConnectionStatus); // Update on going online
        window.addEventListener('offline', updateConnectionStatus); // Update on going offline
        updateConnectionStatus(); // Set initial connection status
    }
}

// Export the class for use in other modules
export default UIManager;
