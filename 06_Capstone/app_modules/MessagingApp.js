// Retrieve the GPT URL and OpenAI key from the global configuration file (config.js)
// const GPT_URL = window.env.GPT_URL;
// const OPENAI_KEY = window.env.OPENAI_KEY;
const SERVER_URL = window.env.SERVER_URL;


// Class to handle messaging functionality
class MessagingApp {

    // Initialize the messaging app and set up necessary components
    constructor() {
        console.log('MessagingApp loaded!');

        // Reference to the chat history element
        this.messageHistory = document.getElementById('messageHistory');

        // Reference to the message input box
        this.messageInput = document.getElementById('messageInput');

        // Reference to the send button
        this.sendButton = document.getElementById('sendMessage');

        // Queue to store offline messages
        this.messageQueue = [];

        // Counter to track the number of API requests
        this.apiRequestCount = 0;

        // Set up event listeners for user actions and network changes
        this.setupEventListeners();

        // Load saved message history from local storage
        this.loadMessageHistory();
    }

    // Set up event listeners for user interactions and network status changes
    setupEventListeners() {
        // Add event listener for the send button to trigger sending a message
        this.sendButton.addEventListener('click', () => this.sendMessage());

        // Add event listener for the Enter key to send a message (without Shift key)
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Add event listener for online status to process queued messages
        window.addEventListener('online', () => this.processMessageQueue());

        // Add event listener for offline status to notify the user
        window.addEventListener('offline', () => {
            this.addMessageToHistory('system', 'You are currently offline. Messages will be sent when connection is restored.');
        });
    }

    // Helper function to wait for a specified time (used for retries)
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Handle sending a user message
    async sendMessage() {
        // Trim the input message to remove extra spaces
        const message = this.messageInput.value.trim();

        // If the message is empty, exit the function
        if (!message) return;

        // Add the user's message to the chat history
        this.addMessageToHistory('user', message);

        // Clear the input box after the message is sent
        this.messageInput.value = '';

        // Check if the user is online
        if (navigator.onLine) {
            // If online, send the message to ChatGPT
            await this.sendToChatGPT(message);
        } else {
            // If offline, queue the message for sending later
            this.messageQueue.push(message);
            this.addMessageToHistory('system', 'Message queued for sending when online');
            this.saveMessageQueue(); // Save the message queue to local storage
        }
    }

    // Send a message to the ChatGPT API with error handling and retries
    async sendToChatGPT(message, attempt = 1) {

        // Prevent sending requests if the counter is more than 1
        if (this.apiRequestCount > 1) {
            console.warn("API request limit reached. Manually aborting further requests.");
            this.addMessageToHistory('system', 'API request limit reached. Try again later.');
            return;
        }

        try {
            // Increment the API request counter
            this.apiRequestCount++;
            // Log the current API request count
            console.log(`API Request Count: ${this.apiRequestCount}`);

            // Make the API request
            const response = await fetch(SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${OPENAI_KEY}`,
                },
                // body: JSON.stringify({
                //     model: "gpt-4o-mini",
                //     messages: [{ role: "user", content: message }] // Send user message
                // })
                body: JSON.stringify({message})
            });


            // Parse and display the API response
            const data = await response.json();
            console.log('Response status', response.status);
            console.log('Response headers:', response.headers);
            console.log('Response data from GPT', data);

            // handle unsuccessful requests
            if (!response.ok) {
                if (response.status === 401) {
                    // console.error('401: Invalid API Key or Authentication Failed');
                    this.addMessageToHistory('system', 'Invalid API Key or Authentication Failed');
                } else if (response.status === 429) {
                    // const delay = Math.pow(2, attempt) * 1000; // Calculate delay using exponential backoff
                    // console.error(`Rate limit exceeded. Retrying after ${delay / 1000} seconds...`);
                    // await this.sleep(delay); // Wait for the calculated delay
                    // return this.sendToChatGPT(message, attempt + 1); // Retry the request
                    // console.error('429: Too many requests. Rate limit exceeded');
                    this.addMessageToHistory('system', '429: Too many requests. Rate limit exceeded');
                }
                // console.error('Error: ', data.error.message )
                this.addMessageToHistory('system', `Error: ${data.error.message}`);
                console.log(`API Request Count: ${this.apiRequestCount}`);
                return;
            }
            // this.addMessageToHistory('assistant', data.choices[0].message.content);
            this.addMessageToHistory('assistant', data.reply);
            // Save the chat history after receiving a response
            this.saveMessageHistory();
        } catch (error) {
            // Log and notify the user of any errors during the request
            console.error('Error sending message to ChatGPT:', error);
            this.addMessageToHistory('system', 'Error sending message to ChatGPT');
        }
    }

    // Add a message to the chat history
    addMessageToHistory(role, content) {
        // Create a new message element
        const messageDiv = document.createElement('div');

        // Add CSS classes for styling the message
        messageDiv.classList.add('message', role);

        // Set the text content of the message
        messageDiv.textContent = `${role}: ${content}`;

        // Append the message to the chat history
        this.messageHistory.appendChild(messageDiv);

        // Automatically scroll to the bottom of the chat history
        this.messageHistory.scrollTop = this.messageHistory.scrollHeight;

        // Save the updated chat history to local storage
        this.saveMessageHistory();
    }

    // Save the chat history to local storage
    saveMessageHistory() {
        // Convert the chat messages to a format suitable for storage
        const messages = Array.from(this.messageHistory.children).map(msg => ({
            role: msg.classList[1], // Extract the role (e.g., user, assistant)
            content: msg.textContent.split(': ').slice(1).join(': ') // Extract the content
        }));

        // Save the messages to local storage as a JSON string
        localStorage.setItem('messageHistory', JSON.stringify(messages));
    }

    // Load the chat history from local storage
    loadMessageHistory() {
        // Retrieve saved messages from local storage
        const savedMessages = JSON.parse(localStorage.getItem('messageHistory') || '[]');

        // Add each saved message back to the chat history
        savedMessages.forEach(msg => this.addMessageToHistory(msg.role, msg.content));
    }

    // Save the message queue to local storage
    saveMessageQueue() {
        // Convert the message queue to a JSON string and save it
        localStorage.setItem('messageQueue', JSON.stringify(this.messageQueue));
    }

    // Process queued messages when the user goes online
    async processMessageQueue() {
        // Send each queued message to ChatGPT
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift(); // Remove the first message from the queue
            await this.sendToChatGPT(message); // Send the message to ChatGPT
        }

        // Save the updated (now empty) queue to local storage
        this.saveMessageQueue();
    }
}

// Export the MessagingApp class for use in other app_modules
export default MessagingApp;
