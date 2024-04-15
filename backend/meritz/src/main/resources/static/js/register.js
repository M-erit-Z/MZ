document.getElementById('accidentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const clientName = document.getElementById('clientName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const location = document.getElementById('location').value;

    // Fetch API를 사용하여 서버에 데이터 전송
    fetch('/api/rooms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            clientName: clientName,
            phoneNumber: phoneNumber,
            location: location
        })
    })
        .then(response => response.json())
        .then(data => {
            // 응답으로 받은 roomId를 사용하여 리다이렉트
            window.location.href = `/client/${data}`;
        })
        .catch(error => console.error('Error:', error));
});

document.getElementById('locateButton').addEventListener('click', function() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            getKakaoAddress(lat, lng);
        }, function(error) {
            console.error('Geolocation error:', error);
        });
    } else {
        alert('Geolocation API를 지원하지 않는 브라우저입니다.');
    }
});

function getKakaoAddress(lat, lng) {
    const geocoder = new kakao.maps.services.Geocoder();

    const coord = new kakao.maps.LatLng(lat, lng);
    const callback = function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            console.log('그런 너의 주소는 ' + result[0].address.address_name);
            document.getElementById('location').value = result[0].address.address_name;
        }
    };

    geocoder.coord2Address(coord.getLng(), coord.getLat(), callback);
}
