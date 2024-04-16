let localStreamElement = document.querySelector('#localStream');
const myKey = Math.random().toString(36).substring(2, 11);
let pcListMap = new Map();
let roomId;
let otherKeyList = [];
let localStream = undefined;
const messages = [];
let chatClient = null;

const startCam = async () => {
    if (navigator.mediaDevices !== undefined) {
        // 브라우저가 미디어 디바이스(카메라, 마이크 등)에 접근 가능한지 확인
        await navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: "environment" } })
            .then(async (stream) => {
                console.log('Stream found');
                localStream = stream;  // 스트림을 전역 변수에 저장
                stream.getAudioTracks()[0].enabled = true;  // 오디오 트랙 활성화
                localStreamElement.srcObject = localStream;  // 비디오 요소에 스트림 연결
            }).catch(error => {
                console.error("Error accessing media devices:", error);  // 에러 처리
            });
    }
}

// 채팅용 소켓 연결
const connectChat = async () => {
    const chatSocket = new SockJS('/signaling');
    chatClient = Stomp.over(chatSocket);

    chatClient.connect({}, function(frame) {
        console.log('Connected as client');
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

        //iceCandidate peer 교환을 위한 subscribe
        stompClient.subscribe(`/topic/peer/iceCandidate/${myKey}/${roomId}`, candidate => {
            const key = JSON.parse(candidate.body).key
            const message = JSON.parse(candidate.body).body;

            // 해당 key에 해당되는 peer 에 받은 정보를 addIceCandidate 해준다.
            pcListMap.get(key).addIceCandidate(new RTCIceCandidate({candidate:message.candidate,sdpMLineIndex:message.sdpMLineIndex,sdpMid:message.sdpMid}));
            console.log("2");
        });

        //offer peer 교환을 위한 subscribe
        stompClient.subscribe(`/topic/peer/offer/${myKey}/${roomId}`, offer => {
            const key = JSON.parse(offer.body).key;
            const message = JSON.parse(offer.body).body;
            console.log("3");

            // 해당 key에 새로운 peerConnection 를 생성해준후 pcListMap 에 저장해준다.
            pcListMap.set(key,createPeerConnection(key));
            console.log("4");
            // 생성한 peer 에 offer정보를 setRemoteDescription 해준다.
            pcListMap.get(key).setRemoteDescription(new RTCSessionDescription({type:message.type,sdp:message.sdp}));
            console.log("5");
            //sendAnswer 함수를 호출해준다.
            sendAnswer(pcListMap.get(key), key);
            console.log("6");
        });

        //answer peer 교환을 위한 subscribe
        stompClient.subscribe(`/topic/peer/answer/${myKey}/${roomId}`, answer =>{
            const key = JSON.parse(answer.body).key;
            const message = JSON.parse(answer.body).body;

            // 해당 key에 해당되는 Peer 에 받은 정보를 setRemoteDescription 해준다.
            pcListMap.get(key).setRemoteDescription(new RTCSessionDescription(message));
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
    if (event.track.kind === 'audio') {
        // 오디오 요소 생성 및 설정
        let audio = document.createElement('audio');
        audio.autoplay = true;
        audio.controls = true;
        audio.id = `audio_${otherKey}`;  // 오디오 요소에 고유 ID 부여

        // 스트림을 오디오 요소에 설정
        audio.srcObject = new MediaStream([event.track]);

        // 오디오 요소를 DOM에 추가
        document.getElementById('remoteStreamDiv').appendChild(audio);
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
            console.log("client icecandidate start");
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

//룸 번호 입력 후 캠 + 웹소켓 실행
document.querySelector('#enterRoomBtn').addEventListener('click', async () =>{
    await startCam();

    if(localStream !== undefined){
        document.querySelector('#localStream').style.display = 'block';
        document.querySelector('#startSteamBtn').style.display = '';
    }

    roomId = document.querySelector('#roomIdInput').value;
    document.querySelector('#roomIdInput').disabled = true;
    document.querySelector('#enterRoomBtn').disabled = true;

    await connectSocket();
    await connectChat();
});

// 스트림 버튼 클릭시 , 다른 웹 key들 웹소켓을 가져 온뒤에 offer -> answer -> iceCandidate 통신
// peer 커넥션은 pcListMap 으로 저장
// document.querySelector('#startSteamBtn').addEventListener('click', async () =>{
//     await stompClient.send(`/app/call/key`, {}, {});
//
//     setTimeout(() =>{
//
//         otherKeyList.map((key) =>{
//             if(!pcListMap.has(key)){
//                 pcListMap.set(key, createPeerConnection(key));
//                 sendOffer(pcListMap.get(key),key);
//             }
//         });
//
//     },1000);
// });



function sendMessage() {
    const newMessage = document.getElementById('message-input').value;
    if (newMessage && chatClient && chatClient.connected) {
        const chatMessage = {
            writerId: 'client',
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
        messageElement.className = `message ${message.writerId === 'client' ? 'sent' : 'received'}`;
        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';
        contentElement.textContent = message.messages;
        messageElement.appendChild(contentElement);
        messageList.appendChild(messageElement);
    });
}