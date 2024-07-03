/* 메뉴 펼치기 */
const showMenu = (toggleId, navbarId, bodyId) => {
    const toggle = document.getElementById(toggleId),
          navbar = document.getElementById(navbarId),
          bodypadding = document.getElementById(bodyId);

    if (toggle && navbar) {
        toggle.addEventListener('click', () => {
            navbar.classList.toggle('expander');
            bodypadding.classList.toggle('body-pd');
        });
    }
};

showMenu('nav-toggle', 'navbar', 'body-pd');

const navbar = document.getElementById('navbar');
const bodypadding = document.getElementById('body-pd');

navbar.addEventListener('mouseenter', () => {
    navbar.classList.add('expander');
    bodypadding.classList.add('body-pd');
});

navbar.addEventListener('mouseleave', () => {
    navbar.classList.remove('expander');
    bodypadding.classList.remove('body-pd');
});

/* 활성 링크 */
const linkColor = document.querySelectorAll('.nav__link');
function colorLink() {
    // 모든 링크에서 active 클래스 제거
    linkColor.forEach(l => l.classList.remove('active'));
    
    // 클릭된 링크에 active 클래스 추가
    this.classList.add('active');
}
linkColor.forEach(l => l.addEventListener('click', colorLink));

/* 로그아웃 핸들러 */
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(event) {
            event.preventDefault();

            fetch('/auth/logout', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            .then(response => {
                if (response.ok) {
                    window.location.replace('/auth/login');
                } else {
                    console.error('로그아웃 실패');
                }
            })
            .catch(error => {
                console.error('로그아웃 오류:', error);
            });
        });
    }
});
