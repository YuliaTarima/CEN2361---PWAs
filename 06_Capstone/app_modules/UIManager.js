class UIManager {
    constructor() {
        console.log('UIManager loaded!')
        this.initializeUI();
        this.setupThemeHandling();
        this.setupConnectionStatus();
    }

    // Initialize app shell elements
    initializeUI() {
        document.body.innerHTML = `
            <div class="app-header">
                <h1>YuliaDrawChat</h1>
                <div class="connection-status" id="connectionStatus"></div>
                <button id="installPWA" class="hidden">Install App</button>
            </div>
            <div class="app-container">
                <div class="drawing-section">
                    <div class="drawing-controls">
                        <input type="color" id="colorPicker" value="#000000">
                        <input type="range" id="brushSize" min="1" max="20" value="2">
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

    // Handle theme detection and application
    setupThemeHandling() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        const handleThemeChange = (e) => {
            document.body.classList.toggle('dark-theme', e.matches);
        };
        prefersDark.addListener(handleThemeChange);
        handleThemeChange(prefersDark);
    }

    // Update connection status on UI
    setupConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        const updateConnectionStatus = () => {
            statusElement.textContent = navigator.onLine ? 'Online' : 'Offline';
            statusElement.className = `connection-status ${navigator.onLine ? 'online' : 'offline'}`;
        };
        window.addEventListener('online', updateConnectionStatus);
        window.addEventListener('offline', updateConnectionStatus);
        updateConnectionStatus();
    }
}
export default UIManager;