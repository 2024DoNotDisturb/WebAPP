document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.button-grid button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const url = button.getAttribute('data-url');
            if (url) {
                window.location.href = url; // 각 페이지 url로 이동
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var today = new Date();
    var days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    var weekday = days[today.getDay()];
    var month = today.getMonth() + 1; // getMonth()는 0부터 시작하므로 1을 더합니다.
    var day = today.getDate();
    var date = month + '/' + day;

    document.getElementById('weekday').textContent = weekday;
    document.getElementById('date').textContent = date;
});