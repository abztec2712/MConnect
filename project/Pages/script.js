document.addEventListener('DOMContentLoaded', () => {
    const chatbotButton = document.getElementById('chatbot-button');
    const chatbotModal = document.getElementById('chatbot-modal');
    const messagesContainer = document.getElementById('chatbot-messages');
    const userInput = document.getElementById('user-input');

    // Check server health on startup
    checkServerHealth();

    setTimeout(() => {
        addMessage('bot', 'Hello! 👋 How can I assist you today?');
    }, 500);

    chatbotButton.addEventListener('click', () => {
        chatbotModal.style.display = 'block';
    });

    window.closeChatbot = () => {
        chatbotModal.style.display = 'none';
    };

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    async function checkServerHealth() {
        try {
            const response = await fetch('http://localhost:5000/health');
            if (!response.ok) {
                console.error('Server is not responding properly');
                addMessage('bot', 'Server connection issue. Please try again later.');
            }
        } catch (error) {
            console.error('Cannot connect to server:', error);
            addMessage('bot', 'Cannot connect to server. Please ensure the server is running.');
        }
    }

    window.sendMessage = async () => {
        const message = userInput.value.trim();
        if (message) {
            addMessage('user', message);
            userInput.value = '';

            // Show loading message
            const loadingId = addMessage('bot', 'Thinking...');

            try {
                const botResponse = await getGeminiResponse(message);
                // Replace loading message with actual response
                updateMessage(loadingId, 'bot', botResponse);
            } catch (error) {
                updateMessage(loadingId, 'bot', "Sorry, I couldn't process that request. Please ensure the server is running.");
                console.error("Error with Gemini API:", error);
            }
        }
    };

    async function getGeminiResponse(userMessage) {
        try {
            const response = await fetch("http://localhost:5000/api/gemini", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: userMessage })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Received from Backend:", data.text);

            // Correctly extract the AI response
            return data.text;
        } catch (error) {
            console.error("Error fetching response from backend:", error);
            return "Oops! Something went wrong.";
        }
    }

    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return messageDiv.id = `msg-${Date.now()}`; // Return ID for potential updates
    }

    function updateMessage(messageId, sender, text) {
        const messageDiv = document.getElementById(messageId);
        if (messageDiv) {
            messageDiv.textContent = text;
        } else {
            addMessage(sender, text);
        }
    }
});
