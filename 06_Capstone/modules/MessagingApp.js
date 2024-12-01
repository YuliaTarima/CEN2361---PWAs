class MessagingApp {
    constructor() {
        console.log('MessagingApp loaded!');
        this.messageHistory = document.getElementById('messageHistory');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendMessage');
        this.messageQueue = [];
        this.setupEventListeners();
        this.loadMessageHistory();
    }

    // Add event listeners for messaging
    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        window.addEventListener('online', () => this.processMessageQueue());
        window.addEventListener('offline', () => {
            this.addMessageToHistory('system', 'You are currently offline. Messages will be sent when connection is restored.');
        });
    }

    // Send a message
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        this.addMessageToHistory('user', message);
        this.messageInput.value = '';

        if (navigator.onLine) {
            await this.sendToChatGPT(message);
        } else {
            this.messageQueue.push(message);
            this.addMessageToHistory('system', 'Message queued for sending when online');
            this.saveMessageQueue();
        }
    }

    // Send message to ChatGPT API
    async sendToChatGPT(message) {
        try {
            const gptUrl = 'https://api.openai.com/v1/chat/completions';
            // WARNING: This API key is included for educational purposes only.
            // Do not use this key in production or share it publicly.
            const openAIKey = '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';
            const response = await fetch(gptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openAIKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [{role: "user", content: message}]
                })
            });

            // log gpt response status
            console.log('response status', response.status);

            // Check if the openAI request was successful
            if (response.ok) {
                console.log('Valid API Key, Successful Authentication, and Response Status');
            } else if (response.status === 401) {
                console.error('Invalid API Key or Authentication Failed');
            } else {
                console.error(`Response Status Code: ${response.status}`);
                const errorDetails = await response.json();
                console.error('!response.ok; Error details:', errorDetails);
                this.addMessageToHistory('system', `Error: ${errorDetails.error.message}`);
                return;
            }


            const data = await response.json();
            // log gpt response data
            console.log('data from GPT', data);

            if (data.error && data.error.type === 'insufficient_quota') {
                console.error('Quota exceeded. Please check your OpenAI plan.');
                this.addMessageToHistory('system', 'OpenAI Quota exceeded. Please check your OpenAI plan or try again later.');
                return;
            } else {

            }


            this.addMessageToHistory('assistant', data.choices[0].message.content);
            this.saveMessageHistory();
        } catch (error) {
            console.error('Error sending message to ChatGPT:', error);
            this.addMessageToHistory('system', 'Error sending message to ChatGPT');
        }
    }

    // Add message to chat history
    addMessageToHistory(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', role);
        messageDiv.textContent = `${role}: ${content}`;
        this.messageHistory.appendChild(messageDiv);
        this.messageHistory.scrollTop = this.messageHistory.scrollHeight;
        this.saveMessageHistory();
    }

    // Save chat history to local storage
    saveMessageHistory() {
        const messages = Array.from(this.messageHistory.children).map(msg => ({
            role: msg.classList[1],
            content: msg.textContent.split(': ').slice(1).join(': ')
        }));
        localStorage.setItem('messageHistory', JSON.stringify(messages));
    }

    // Load chat history from local storage
    loadMessageHistory() {
        const savedMessages = JSON.parse(localStorage.getItem('messageHistory') || '[]');
        savedMessages.forEach(msg => this.addMessageToHistory(msg.role, msg.content));
    }

    // Save message queue to local storage
    saveMessageQueue() {
        localStorage.setItem('messageQueue', JSON.stringify(this.messageQueue));
    }

    // Process queued messages when online
    async processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            await this.sendToChatGPT(message);
        }
        this.saveMessageQueue();
    }
}

export default MessagingApp;