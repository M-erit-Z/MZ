document.getElementById('managerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const managerName = document.getElementById('managerName').value;

    fetch('/api/managers/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            managerName: managerName
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
