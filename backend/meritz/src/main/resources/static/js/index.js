document.getElementById('clientEntry').addEventListener('click', function() {
    window.location.href = '/register.html'; // 고객 버튼 클릭 시 '/room'으로 리다이렉트
});

document.getElementById('managerEntry').addEventListener('click', function() {
    window.location.href = '/room.html'; // 매니저 버튼 클릭 시 '/rooms'으로 리다이렉트
});

document.getElementById('clientSignup').addEventListener('click', function () {
    window.location.href='/clientSignUp.html';
})
