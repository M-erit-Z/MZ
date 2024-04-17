let localStreamElement = document.querySelector('#localStream');
const myKey = Math.random().toString(36).substring(2, 11);
let pcListMap = new Map();
let otherKeyList = [];
let localStream = undefined;
const messages = [];
let chatClient = null;
let clientEmail = null;

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

// 소켓 연결
const connectSocket = async () =>{
    const socket = new SockJS('/signaling');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, function () {
        console.log('Connected to WebRTC server');
        console.log('0');


        //iceCandidate peer 교환을 위한 subscribe
        stompClient.subscribe(`/topic/peer/iceCandidate/${myKey}/${roomId}`, candidate => {
            const key = JSON.parse(candidate.body).key
            const message = JSON.parse(candidate.body).body;
            console.log("1");

            // 해당 key에 해당되는 peer 에 받은 정보를 addIceCandidate 해준다.
            pcListMap.get(key).addIceCandidate(new RTCIceCandidate({candidate:message.candidate,sdpMLineIndex:message.sdpMLineIndex,sdpMid:message.sdpMid}));
            console.log("2");
        });

        //offer peer 교환을 위한 subscribe
        stompClient.subscribe(`/topic/peer/offer/${myKey}/${roomId}`, offer => {
            const key = JSON.parse(offer.body).key;
            const message = JSON.parse(offer.body).body;

            // 해당 key에 새로운 peerConnection 를 생성해준후 pcListMap 에 저장해준다.
            pcListMap.set(key,createPeerConnection(key));

            // 생성한 peer 에 offer정보를 setRemoteDescription 해준다.
            pcListMap.get(key).setRemoteDescription(new RTCSessionDescription({type:message.type,sdp:message.sdp}));

            //sendAnswer 함수를 호출해준다.
            sendAnswer(pcListMap.get(key), key);

        });

        //answer peer 교환을 위한 subscribe
        stompClient.subscribe(`/topic/peer/answer/${myKey}/${roomId}`, answer =>{
            const key = JSON.parse(answer.body).key;
            const message = JSON.parse(answer.body).body;
            console.log("7");

            // 해당 key에 해당되는 Peer 에 받은 정보를 setRemoteDescription 해준다.
            pcListMap.get(key).setRemoteDescription(new RTCSessionDescription(message));
            console.log("8");

        });

        //key를 보내라는 신호를 받은 subscribe
        stompClient.subscribe(`/topic/call/key`, message =>{
            //자신의 key를 보내는 send
            stompClient.send(`/app/send/key`, {}, JSON.stringify(myKey));
            console.log("9");
        });

        //상대방의 key를 받는 subscribe
        stompClient.subscribe(`/topic/send/key`, message => {
            const key = JSON.parse(message.body);

            //만약 중복되는 키가 ohterKeyList에 있는지 확인하고 없다면 추가해준다.
            if(myKey !== key && otherKeyList.find((mapKey) => mapKey === myKey) === undefined){
                otherKeyList.push(key);
            }
            console.log("10");
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
                urls: "turn:meritz.store", username: "meritz", credential: "meritz"
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
            let dateString = date.toISOString().slice(0, 16);
            clientEmail = data.clientEmail;
            document.getElementById('clientName').value = data.clientName;
            document.getElementById('clientName').setAttribute('readonly', true);
            document.getElementById('clientPhone').value = data.clientPhone;
            document.getElementById('clientPhone').setAttribute('readonly', true);
            document.getElementById('occurTime').value = dateString;
            document.getElementById('occurTime').setAttribute('readonly', true);
            document.getElementById('location').value = data.location;
            document.getElementById('location').setAttribute('readonly', true);
        })
    await startCam();

    if (localStream !== undefined && localStreamElement) {
        document.querySelector('#localStream').style.display = 'block';
        document.querySelector('#startSteamBtn').style.display = '';
    }

    await connectSocket();
    await connectChat();
};


// 스트림 버튼 클릭시 , 다른 웹 key들 웹소켓을 가져 온뒤에 offer -> answer -> iceCandidate 통신
// peer 커넥션은 pcListMap 으로 저장
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

function sendMessage() {
    const newMessage = document.getElementById('message-input').value;
    if (newMessage && chatClient && chatClient.connected) {
        const chatMessage = {
            writerId: 'manager',
            messages: newMessage
        };

        chatClient.send(`/app/chat/sendMessage/${roomId}`, {}, JSON.stringify(chatMessage));
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
        messageElement.className = `message ${message.writerId === 'manager' ? 'sent' : 'received'}`;
        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';
        contentElement.textContent = message.messages;
        messageElement.appendChild(contentElement);
        messageList.appendChild(messageElement);
    });
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
            content: document.getElementById('content').value,
            chatting: "Chat"
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