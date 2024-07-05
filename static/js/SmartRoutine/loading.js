document.addEventListener('DOMContentLoaded', function() {
    const messages = [
        "해방하러 이동중...",
        "곧 해방됩니다...",
        "무엇이든지 해방!",
        "도파민으로부터 해방!"
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    document.getElementById('randomMessage').textContent = randomMessage;

    function checkLoginStatus() {
        fetch('/check-login-status')
            .then(response => response.json())
            .then(data => {
                if (data.isLoggedIn) {
                    window.location.href = "/routine-home";
                } else {
                    window.location.href = "/auth/login";
                }
            })
            .catch(error => {
                console.error('Error:', error);
                window.location.href = "/error";
            });
    }

    // 2초 후에 로그인 상태 확인
    setTimeout(checkLoginStatus, 2000);
});