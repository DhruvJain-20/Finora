
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
const sendButton = document.getElementById('send-button');

const conversationHistory = [];

function addMessage(text, sender) {
    const message = document.createElement('div');
    message.className = `message ${sender}-message`;

    const label = document.createElement('div');
    label.className = 'message-label';
    label.textContent = sender === 'user' ? 'You' : 'Finora AI';

    const content = document.createElement('div');
    content.className = 'message-content';

    if (sender === 'assistant') {
        content.innerHTML = DOMPurify.sanitize(marked.parse(text));
    } else {
        content.textContent = text;
    }

    message.append(label, content);
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return message;
}

chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const message = chatInput.value.trim();

    if (!message || sendButton.disabled) return;

    addMessage(message, 'user');

    chatInput.value = '';
    sendButton.disabled = true;

    const loadingMessage = addMessage('Thinking...', 'assistant');

    try {
        const response = await fetch('/ai-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                history: conversationHistory
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Unable to get a response.');
        }

        if (typeof data.reply !== 'string' || !data.reply.trim()) {
            throw new Error('Finora AI returned an empty response.');
        }

        loadingMessage.querySelector('.message-content').innerHTML = DOMPurify.sanitize(marked.parse(data.reply));
        conversationHistory.push(
            { role: 'user', parts: [{ text: message }] },
            { role: 'model', parts: [{ text: data.reply }] }
        );

        // Keep the most recent 10 messages (5 exchanges).
        if (conversationHistory.length > 10) {
            conversationHistory.splice(
                0,
                conversationHistory.length - 10
            );
        }
    } catch (error) {
        loadingMessage.querySelector('.message-content').textContent =
    error.message || 'Something went wrong. Please try again.';
    } finally {
        sendButton.disabled = false;
        chatInput.focus();
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});

