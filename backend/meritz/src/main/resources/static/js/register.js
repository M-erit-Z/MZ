document.getElementById('accidentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const clientName = document.getElementById('clientName').value;
    const clientPhone = document.getElementById('clientPhone').value;
    const location = document.getElementById('location').value;

    // Fetch API를 사용하여 서버에 데이터 전송
    fetch('/api/rooms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            clientName: clientName,
            clientPhone: clientPhone,
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
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude,
                lng = position.coords.longitude,
                coord = new kakao.maps.LatLng(lat, lng),
                geocoder = new kakao.maps.services.Geocoder();

            var callback = function(result, status) {
                if (status === kakao.maps.services.Status.OK) {
                    var address = result[0].address.address_name;
                    document.getElementById('location').value = address;
                    console.log('현재 위치의 주소는 ' + address + ' 입니다.');
                }
            };

            geocoder.coord2Address(coord.getLng(), coord.getLat(), callback);
        }, function(error) {
            console.error('Geolocation 실패: ', error);
            alert('위치를 가져올 수 없습니다.');
        });
    } else {
        alert('이 브라우저에서는 지오로케이션을 사용할 수 없습니다.');
    }
});


// document.getElementById('locateButton').addEventListener('click', function() {
//     const geocoder = new kakao.maps.services.Geocoder();
//
//     const coord = new kakao.maps.LatLng(lat, lng);
//     const callback = function(result, status) {
//         if (status === kakao.maps.services.Status.OK) {
//             console.log('그런 너의 주소는 ' + result[0].address.address_name);
//             document.getElementById('location').value = result[0].address.address_name;
//         }
//     };
//
//     geocoder.coord2Address(coord.getLng(), coord.getLat(), callback);
// });
