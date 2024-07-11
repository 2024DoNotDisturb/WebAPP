// routine_setting.js

document.addEventListener('DOMContentLoaded', function () {
    const addRoutineBtn = document.getElementById('addRoutineBtn');
    const routineModal = new bootstrap.Modal(document.getElementById('routineModal'), {
        backdrop: 'static', // 배경 클릭 시 모달이 닫히지 않도록 설정
        keyboard: false // ESC 키로 모달을 닫는 기능 비활성화
    });

    addRoutine.addEventListener('click', function () {
        // 모달 열기
        routineModal.show();
    });
    
    const routineSelect = document.getElementById('routineSelect');
    const startTimeInput = document.getElementById('startTimeInput');

    addRoutine.addEventListener('click', function () {
        // 사용자 입력 값 처리 예시
        const selectedRoutine = routineSelect.value;
        const startTime = startTimeInput.value;

        console.log('선택한 루틴:', selectedRoutine);
        console.log('시작 시간:', startTime);

        // 여기서 추가적인 작업 수행 (예: 데이터 처리 등)

        // 모달 닫기
        routineModal.hide();
    });
});
