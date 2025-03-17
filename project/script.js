document.addEventListener('DOMContentLoaded', () => {
    // Chatbot functionality
    const chatbotButton = document.getElementById('chatbot-button');
    const chatbotModal = document.getElementById('chatbot-modal');
    const messagesContainer = document.getElementById('chatbot-messages');
    const userInput = document.getElementById('user-input');

    // Add initial welcome message
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

    window.sendMessage = () => {
        const message = userInput.value.trim();
        if (message) {
            addMessage('user', message);
            // Here you would typically make an API call to your chatbot service
            // For now, we'll just echo back a simple response
            setTimeout(() => {
                const responses = [
                    "I'll help you with that! What specific information are you looking for?",
                    "Thanks for your message. Let me assist you with that.",
                    "I understand. Could you provide more details about what you need?",
                    "I'm here to help! What would you like to know about our mentoring services?"
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addMessage('bot', randomResponse);
            }, 1000);
            userInput.value = '';
        }
    };

    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Login modal functionality
    window.openLoginModal = (type) => {
        // Here you would typically show a login modal
        alert(`Opening ${type} login modal`);
    };
});