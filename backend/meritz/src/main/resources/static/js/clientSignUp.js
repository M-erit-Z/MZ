document.getElementById('clientForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const clientName = document.getElementById('clientName').value;
    const clientPhone = document.getElementById('clientPhone').value;
    const clientEmail = document.getElementById('clientEmail').value;

    fetch('/api/clients/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            clientName: clientName,
            clientPhone: clientPhone,
            clientEmail: clientEmail
        })
    })
        .then(response => response.json())
        .then(data => {
            alert('회원가입 성공');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('회원가입 실패');
        });
});
