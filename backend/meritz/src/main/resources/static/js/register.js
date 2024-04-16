document.getElementById('registerButton').addEventListener('click', function(e) {
    e.preventDefault();
    const clientName = document.getElementById('clientName').value;
    const clientPhone = document.getElementById('clientPhone').value;
    const location = document.getElementById('location').value;

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
            window.location.href = `/client/${data}`;
        })
        .catch(error => console.error('Error:', error));
});

document.getElementById('historyButton').addEventListener('click', function(e) {
    e.preventDefault();
    const clientName = document.getElementById('clientName').value;
    const clientPhone = document.getElementById('clientPhone').value;

    const queryParams = new URLSearchParams({
        clientName: clientName,
        clientPhone: clientPhone
    }).toString();

    fetch(`/api/clients?${queryParams}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => {
            window.location.href = `/history/${data}`;
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
