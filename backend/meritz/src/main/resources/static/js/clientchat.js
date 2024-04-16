let stompClient = null;
const messages = [];

window.onload = function() {
    const socket = new SockJS('/signaling');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function(frame) {
        console.log('Connected as client');
        stompClient.subscribe(`/topic/${roomId}`, function(message) {
            const receivedMessage = JSON.parse(message.body);
            messages.push(receivedMessage);
            displayMessages();
        });
    });

    window.onbeforeunload = function() {
        if (stompClient) {
            stompClient.disconnect();
        }
    };

    document.getElementById('message-input').addEventListener('keydown', handleKeyDown);
};

function sendMessage() {
    const newMessage = document.getElementById('message-input').value;
    if (newMessage && stompClient && stompClient.connected) {
        const chatMessage = {
            writerId: 'client',
            messages: newMessage
        };

        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        document.getElementById('message-input').value = ''; // 메시지 입력란 초기화
    }
}

function handleKeyDown(event) {
    if (event.key === 'Enter') {
        if (!event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }
}

function displayMessages() {
    const messageList = document.getElementById('message-list');
    messageList.innerHTML = '';
    messages.forEach((message, index) => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.writerId === 'client' ? 'sent' : 'received'}`;
        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';
        contentElement.textContent = message.messages;
        messageElement.appendChild(contentElement);
        messageList.appendChild(messageElement);
    });
}
