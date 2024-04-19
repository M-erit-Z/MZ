let localStreamElement = document.querySelector('#localStream');
const myKey = Math.random().toString(36).substring(2, 11);
let pcListMap = new Map();
let otherKeyList = [];
let localStream = undefined;
const messages = [];
let chatClient = null;
let clientEmail = null;
let mediaRecorder;
let recordedChunks = [];

const startCam = async () =>{
    if(navigator.mediaDevices !== undefined){
        await navigator.mediaDevices.getUserMedia({ audio: true, video : true })
            .then(async (stream) => {
                console.log('Stream found');
                localStream = stream;
                if(localStreamElement) {
                    localStreamElement.srcObject = localStream;
                }
            }).catch(error => {
                console.error("Error accessing media devices:", error);
            });
    }
}

// 채팅용 소켓 연결
const connectChat = async () => {
    const chatSocket = new SockJS('/signaling');
    chatClient = Stomp.over(chatSocket);

    chatClient.connect({}, function(frame) {
        console.log('Connected as manger');
        chatClient.subscribe(`/topic/${roomId}`, function(message) {
            const receivedMessage = JSON.parse(message.body);
            messages.push(receivedMessage);
            displayMessages();
        });
    });
    document.getElementById('message-input').addEventListener('keydown', handleKeyDown);
}

// WebRTC용 소켓 연결
const connectSocket = async () =>{
    const socket = new SockJS('/signaling');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, function () {
        console.log('Connected to WebRTC server');

        stompClient.subscribe(`/topic/peer/iceCandidate/${myKey}/${roomId}`, candidate => {
            const key = JSON.parse(candidate.body).key
            const message = JSON.parse(candidate.body).body;

            pcListMap.get(key).addIceCandidate(new RTCIceCandidate({candidate:message.candidate,sdpMLineIndex:message.sdpMLineIndex,sdpMid:message.sdpMid}));
        });


        stompClient.subscribe(`/topic/peer/offer/${myKey}/${roomId}`, offer => {
            const key = JSON.parse(offer.body).key;
            const message = JSON.parse(offer.body).body;


            pcListMap.set(key,createPeerConnection(key));
            pcListMap.get(key).setRemoteDescription(new RTCSessionDescription({type:message.type,sdp:message.sdp}));

            sendAnswer(pcListMap.get(key), key);
        });

        stompClient.subscribe(`/topic/peer/answer/${myKey}/${roomId}`, answer =>{
            const key = JSON.parse(answer.body).key;
            const message = JSON.parse(answer.body).body;

            pcListMap.get(key).setRemoteDescription(new RTCSessionDescription(message));
        });

        stompClient.subscribe(`/topic/call/key`, message =>{
            stompClient.send(`/app/send/key`, {}, JSON.stringify(myKey));
        });

        stompClient.subscribe(`/topic/send/key`, message => {
            const key = JSON.parse(message.body);

            if(myKey !== key && otherKeyList.find((mapKey) => mapKey === myKey) === undefined){
                otherKeyList.push(key);
            }
        });

    });
}

let onTrack = (event, otherKey) => {
    if(document.getElementById(`${otherKey}`) === null){
        const video =  document.createElement('video');

        video.autoplay = true;
        video.controls = true;
        video.id = otherKey;
        video.srcObject = event.streams[0];

        document.getElementById('remoteStreamDiv').appendChild(video);
    }
};

const createPeerConnection = (otherKey) =>{
    const config = {
        iceServers: [
            {
                // urls: "turn:meritz.store", username: "meritz", credential: "meritz"
                urls: "turn:34.64.249.146", username: "meritz", credential: "meritz"
            }
        ]
    };
    const pc = new RTCPeerConnection(config);
    try {
        pc.addEventListener('icecandidate', (event) =>{
            console.log("manager icecandidate start");
            onIceCandidate(event, otherKey);
        });
        pc.addEventListener('track', (event) =>{
            onTrack(event, otherKey);
        });
        if(localStream !== undefined){
            localStream.getTracks().forEach(track => {
                pc.addTrack(track, localStream);
            });
        }
        console.log('PeerConnection created');
    } catch (error) {
        console.error('PeerConnection failed: ', error);
    }
    return pc;
}

let onIceCandidate = (event, otherKey) => {
    if (event.candidate) {
        console.log('ICE candidate');
        stompClient.send(`/app/peer/iceCandidate/${otherKey}/${roomId}`,{}, JSON.stringify({
            key : myKey,
            body : event.candidate
        }));
    }
};

let sendOffer = (pc ,otherKey) => {
    pc.createOffer().then(offer =>{
        setLocalAndSendMessage(pc, offer);
        stompClient.send(`/app/peer/offer/${otherKey}/${roomId}`, {}, JSON.stringify({
            key : myKey,
            body : offer
        }));
        console.log('Send offer');
    });
};

let sendAnswer = (pc,otherKey) => {
    pc.createAnswer().then( answer => {
        setLocalAndSendMessage(pc ,answer);
        stompClient.send(`/app/peer/answer/${otherKey}/${roomId}`, {}, JSON.stringify({
            key : myKey,
            body : answer
        }));
        console.log('Send answer');
    });
};

const setLocalAndSendMessage = (pc ,sessionDescription) =>{
    pc.setLocalDescription(sessionDescription);
}

// 방 번호받고 입장 후 캠 + 웹소켓 실행
window.onload = async function() {
    // 기본 값 채우기
    fetch(`/api/rooms/${roomId}`, { })
        .then(response => response.json())
        .then(data => {
            let date = new Date(data.createTime);
            clientEmail = data.clientEmail;
            document.getElementById('clientName').value = data.clientName;
            document.getElementById('clientName').setAttribute('readonly', true);
            document.getElementById('clientPhone').value = data.clientPhone;
            document.getElementById('clientPhone').setAttribute('readonly', true);
            document.getElementById('occurTime').value = formatDateTimeForInput(date);
            document.getElementById('occurTime').setAttribute('readonly', true);
            document.getElementById('location').value = data.location;
            document.getElementById('location').setAttribute('readonly', true);
        });
    await startCam();

    if (localStream !== undefined && localStreamElement) {
        document.querySelector('#localStream').style.display = 'block';
        document.querySelector('#startSteamBtn').style.display = '';
    }

    await connectSocket();
    await connectChat();
};


document.querySelector('#startSteamBtn').addEventListener('click', async () =>{
    await stompClient.send(`/app/call/key`, {}, {});

    setTimeout(() =>{

        otherKeyList.map((key) =>{
            if(!pcListMap.has(key)){
                pcListMap.set(key, createPeerConnection(key));
                sendOffer(pcListMap.get(key),key);
            }
        });

    },1000);
});


// 영상녹화
document.getElementById('startRecording').addEventListener('click', function() {
    startRecording();
});

document.getElementById('stopRecording').addEventListener('click', function() {
    stopRecording();
});

function startRecording() {
    const stream = document.querySelector('#remoteStreamDiv video').srcObject;
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorder.ondataavailable = function(event) {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };
    mediaRecorder.start(10); // 10ms 단위로 데이터 저장
    document.getElementById('stopRecording').disabled = false;
}

function stopRecording() {
    mediaRecorder.stop();
    saveVideo();
    document.getElementById('stopRecording').disabled = true;
}

function saveVideo() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'recorded.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
}

function sendScript(message) {
    if (message && chatClient && chatClient.connected) {
        const chatMessage = {
            roomId: roomId,
            writerId: 'manager',
            messages: message
        };

        chatClient.send(`/app/chat/sendMessage/${roomId}`, {}, JSON.stringify(chatMessage));
    }
}

function sendMessage() {
    const newMessage = document.getElementById('message-input').value;
    if (newMessage && chatClient && chatClient.connected) {
        const chatMessage = {
            roomId: roomId,
            writerId: 'manager',
            messages: newMessage
        };
        chatClient.send(`/app/chat/sendMessage/${roomId}`, {}, JSON.stringify(chatMessage));
        document.getElementById('message-input').value = ''; // 메시지 입력란 초기화
    }
}

function displayMessages() {
    const messageList = document.getElementById('message-list');
    messageList.innerHTML = '';
    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.writerId === 'manager' ? 'sent' : 'received'}`;

        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';
        contentElement.textContent = message.messages; // 메시지 내용 설정

        messageElement.appendChild(contentElement);
        messageList.appendChild(messageElement);

        messageList.scrollTop = messageList.scrollHeight;
    });
}

function formatDateTimeForInput(dateTimeStr) {
    const date = new Date(dateTimeStr);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    // 최종적으로 조합된 포맷 반환
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// 상담 종료
document.getElementById('endRecord').addEventListener('click', function(event) {
    event.preventDefault(); // 폼의 기본 제출 동작을 막습니다.

    console.log("clicked");
    fetch(`/api/rooms/${roomId}`, {
        method: 'POST', // 또는 'GET', 서버의 요구사항에 따라 조정
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            roomId: roomId,
            clientName: document.getElementById('clientName').value,
            clientPhone: document.getElementById('clientPhone').value,
            clientEmail: clientEmail,
            occurTime: document.getElementById('occurTime').value,
            location: document.getElementById('location').value,
            content: document.getElementById('content').value
        })
    })
        .then(response => {
            if (response.ok) {
                return response.json(); // 응답을 JSON 형태로 파싱
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            console.log('Success:', data);
            window.location.href = `/record/${roomId}`; // 성공 시 리디렉션
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
