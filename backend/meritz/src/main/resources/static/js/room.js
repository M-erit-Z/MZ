let socket = null;
let stompClient = null;

function connectWebSocket() {
    socket = new SockJS('/signaling'); // 서버에서 설정한 WebSocket 연결 endpoint
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function(frame) {
        console.log('Connected: ' + frame);

        // 서버로부터 방 목록 정보를 받아 처리하는 부분
        stompClient.subscribe('/topic/rooms', function(room) {
            addRoomToList(JSON.parse(room.body));
        });
    }, function(error) {
        console.log('STOMP error: ' + error);
    });
}

function addRoomToList(room) {
    const oldTbodyId = determineTableIdByStatus(room.previousStatus);
    const newTbodyId = determineTableIdByStatus(room.status);

    if (oldTbodyId && oldTbodyId !== newTbodyId) {
        removeRoomFromList(room.roomId, oldTbodyId);
    }

    const tbody = document.getElementById(newTbodyId).getElementsByTagName('tbody')[0];
    const row = tbody.insertRow();
    row.insertCell(0).textContent = room.roomId;
    row.insertCell(1).textContent = room.clientName;
    row.insertCell(2).textContent = room.location;
    row.insertCell(3).textContent = new Date(room.occurTime).toLocaleString();
    row.insertCell(4).textContent = room.managerName;

    const enterBtn = document.createElement('button');
    enterBtn.textContent = '입장';
    enterBtn.onclick = () => enterRoom(room.roomId);
    row.insertCell(5).appendChild(enterBtn);
}

function determineTableIdByStatus(status) {
    switch(status) {
        case "대기중":
            return 'waitRoomList';
        case "처리중":
            return 'processRoomList';
        case "완료":
            return 'completeRoomList';
        default:
            console.error('Unknown room status:', status);
            return null;
    }
}


function removeRoomFromList(roomId, tbodyId) {
    const tbody = document.getElementById(tbodyId).getElementsByTagName('tbody')[0];
    const rows = tbody.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].cells[0].textContent == roomId) {
            tbody.deleteRow(i);
            break;
        }
    }
}

function fetchRooms() {
    fetch('/api/rooms')
        .then(response => response.json())
        .then(data => {
            // 각 상태별 tbody 초기화
            const tbodyWait = document.getElementById('waitRoomList').getElementsByTagName('tbody')[0];
            const tbodyProcess = document.getElementById('processRoomList').getElementsByTagName('tbody')[0];
            const tbodyComplete = document.getElementById('completeRoomList').getElementsByTagName('tbody')[0];
            tbodyWait.innerHTML = '';
            tbodyProcess.innerHTML = '';
            tbodyComplete.innerHTML = '';

            // 데이터 분류 및 각 테이블에 추가
            populateTable(data['대기중'], tbodyWait);
            populateTable(data['처리중'], tbodyProcess);
            populateTable(data['완료'], tbodyComplete);
        })
        .catch(error => console.error('Error fetching rooms:', error));
}

function populateTable(rooms, tbody) {
    if (rooms) {
        rooms.forEach(room => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = room.roomId;
            row.insertCell(1).textContent = room.clientName;
            row.insertCell(2).textContent = room.location;
            row.insertCell(3).textContent = new Date(room.occurTime).toLocaleString();
            row.insertCell(4).textContent = room.managerName;
            const enterBtn = document.createElement('button');


            if (room.status == '대기중') {
                enterBtn.textContent = '입장';
            } else if (room.status == '처리중') {
                enterBtn.textContent = '재입장';
            } else {
                enterBtn.textContent = '열람';
            }
            enterBtn.onclick = () => enterRoom(room.roomId);
            row.insertCell(5).appendChild(enterBtn);
        });
    }
}




function enterRoom(roomId) {
    fetch(`/api/rooms/${roomId}`, {
        method: 'PATCH', // PATCH 메서드 사용
        headers: {
            'Content-Type': 'application/json'
        }
        // 추가적인 데이터가 필요하다면, body를 추가하여 전송
    }).then(response => {
        if (response.ok) {
            console.log('Room entered successfully');
            window.location.href = `/manager.html/${roomId}`; // 성공 시 페이지 이동
        } else {
            console.error('Failed to enter room');
        }
    }).catch(error => {
        console.error('Error entering room:', error);
    });
}




// 초기 로드 시 방 목록을 즉시 가져옴
fetchRooms();

// WebSocket 연결 초기화
connectWebSocket();
