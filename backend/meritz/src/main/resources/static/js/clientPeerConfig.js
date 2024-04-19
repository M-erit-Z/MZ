let localStreamElement = document.querySelector('#localStream');
const myKey = Math.random().toString(36).substring(2, 11);
let pcListMap = new Map();
let otherKeyList = [];
let localStream = undefined;
const messages = [];
let chatClient = null;
let terminateClient = null;
let clientId = null;
let lat = null;
let lng = null;

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
// 상담 종료 알림 추가
const connectChat = async () => {
    const chatSocket = new SockJS('/signaling');
    chatClient = Stomp.over(chatSocket);

    chatClient.connect({}, function(frame) {
        console.log('Connected as client');
        chatClient.subscribe(`/topic/${roomId}`, function(message) {
            const messageData = JSON.parse(message.body)
            if (messageData.msg === "상담이 종료되었습니다.") {
                alert('상담이 종료되었습니다.');
                window.location.href = '/history/' + messageData.clientId;
            } else {
                // const receivedMessage = JSON.parse(message.body);
                messages.push(messageData);
                displayMessages();
            }

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
                // urls: "turn:meritz.store", username: "meritz", credential: "meritz"
                urls: "turn:34.64.249.146", username: "meritz", credential: "meritz"
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

// 방 번호받고 입장 후 캠 + 웹소켓 실행
window.onload = async function() {
    fetch(`/api/rooms/client/${roomId}`, { })
        .then(response => response.json())
        .then(data => {
            console.log()
            clientId = data.clientId;
        });
    await startCam();

    if (localStream !== undefined) {
        document.querySelector('#localStream').style.display = 'block';
    }

    await connectSocket();
    await connectChat();

};


function sendMessage() {
    const newMessage = document.getElementById('message-input').value;
    if (newMessage && chatClient && chatClient.connected) {
        const chatMessage = {
            roomId: roomId,
            writerId: 'client',
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
        messageElement.className = `message ${message.writerId === 'client' ? 'sent' : 'received'}`;

        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';
        contentElement.textContent = message.messages; // 메시지 내용 설정

        messageElement.appendChild(contentElement);
        messageList.appendChild(messageElement);

        messageList.scrollTop = messageList.scrollHeight;
    });
}

function findMap() {
    // 현재 위치 전달
    // 지도 페이지로 이동
    window.location.href = '/map';
}

function endCall() {
    window.location.href = `/history/${clientId}`;
}

var map;
var infowindow = new kakao.maps.InfoWindow({removable: true});
var markers = []; // 마커를 저장할 배열

document.getElementById('mapBtn').addEventListener('click', function() {
    document.getElementById('mapModal').style.display = 'block';
    if (!map) {
        map = new kakao.maps.Map(document.getElementById('map'), {
            center: new kakao.maps.LatLng(37.566826, 126.9786567), // 서울 시청
            level: 3 // 지도의 확대 레벨
        });
    }
    navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude,
            lng = position.coords.longitude;
        map.setCenter(new kakao.maps.LatLng(lat, lng));
    });
});

window.onclick = function(event) {
    if (event.target == document.getElementById('mapModal')) {
        document.getElementById('mapModal').style.display = 'none';
    }
}

function searchPlaces(type) {
    var ps = new kakao.maps.services.Places();
    var center = map.getCenter();
    ps.keywordSearch(type, function(data, status, pagination) {
        if (status === kakao.maps.services.Status.OK) {
            clearOverlays(); // 기존 마커 제거
            for (var i=0; i<data.length; i++) {
                displayMarker(data[i]);
            }
        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
            alert('검색 결과가 존재하지 않습니다.');
        } else if (status === kakao.maps.services.Status.ERROR) {
            alert('검색 결과 중 오류가 발생했습니다.');
        }
    }, { location: center });
}

function displayMarker(place) {
    var marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x)
    });
    markers.push(marker); // 마커를 배열에 추가
    kakao.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
        infowindow.open(map, marker);
    });
}

function clearOverlays() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = []; // 마커 배열 초기화
}