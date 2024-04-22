let clientId = null;

window.onload = function() {
    fetch(`/api/record/${roomId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayRecord(data);
            clientId = data.clientId;
        })
        .catch(error => {
            console.error('Failed to fetch record:', error);
        });
};

function displayRecord(record) {
    const recordDetails = document.getElementById('recordDetails');
    recordDetails.innerHTML = `
        <p>고객 이름: ${record.clientName}</p>
        <p>고객 전화번호: ${record.clientPhone}</p>
        <p>사고 시간: ${record.occurTime}</p>
        <p>위치: ${record.location}</p>
        <p>내용: ${record.content}</p>
        <p>채팅 기록: ${record.chatting}</p>
    `;
}

document.getElementById('toList').addEventListener('click', function(event){
    window.location.href=`/history/${clientId}`;
    }
);