document.addEventListener('DOMContentLoaded', function() {
    const dayButtons = document.querySelectorAll('.day-button');
    
    dayButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 모든 버튼의 활성 상태를 제거
            dayButtons.forEach(btn => btn.classList.remove('active'));
            
            // 클릭된 버튼에 활성 상태 추가
            this.classList.add('active');
        });
    });
});
