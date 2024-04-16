function fetchRooms() {
    fetch(`/api/clients/${clientId}`)
        .then(response => response.json())
        .then(data => {
            const tbodyWait = document.getElementById('waitRoomList').getElementsByTagName('tbody')[0];
            const tbodyProcess = document.getElementById('processRoomList').getElementsByTagName('tbody')[0];
            const tbodyComplete = document.getElementById('completeRoomList').getElementsByTagName('tbody')[0];
            tbodyWait.innerHTML = '';
            tbodyProcess.innerHTML = '';
            tbodyComplete.innerHTML = '';

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


            if (room.status == '완료') {
                enterBtn.textContent = '열람';
            } else {
                enterBtn.textContent = '재입장';
            }
            enterBtn.onclick = () => enterRoom(room.roomId, room.status);
            row.insertCell(5).appendChild(enterBtn);
        });
    }
}

function enterRoom(roomId, roomStatus) {
    if (roomStatus == '완료') {
        window.location.href = `/record/${roomId}`
    } else {
        window.location.href = `/client/${roomId}`;
    }
}

fetchRooms();