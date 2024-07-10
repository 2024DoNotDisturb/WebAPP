let allRoutines = []; // 모든 루틴을 저장할 전역 변수

document.addEventListener('DOMContentLoaded', function() {
    setupDayButtons();
    fetchAllUserRoutines();
    AddRoutine();
});

function fetchAllUserRoutines() {
    fetch('/routine/user_routines', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(routines => {
        console.log('Fetched all routines:', routines); // 디버깅용 로그
        allRoutines = routines; // 서버에서 이미 처리된 데이터를 그대로 사용
        activateTodayButton();
    })
    .catch(error => {
        console.error('Error fetching routines:', error);
        displayError('루틴을 불러오는 중 오류가 발생했습니다.');
    });
}

function filterRoutinesByDay(selectedDay) {
    console.log('Filtering for day:', selectedDay);
    const weekdays = ['월요일', '화요일', '수요일', '목요일', '금요일'];
    const weekends = ['토요일', '일요일'];
    const isWeekday = weekdays.includes(selectedDay);
    const isWeekend = weekends.includes(selectedDay);

    const filtered = allRoutines.filter(routine => {
        // 선택된 요일이 루틴의 Days 배열에 포함되어 있는 경우
        if (routine.Days.includes(selectedDay)) {
            return true;
        }
        // '매일매일' 루틴 (Days 배열에 모든 요일이 포함됨)
        if (routine.Days.length === 7) {
            return true;
        }
        // 평일이 선택되었고, 루틴이 '평일만'인 경우
        if (isWeekday && routine.Days.length === 5 && weekdays.every(day => routine.Days.includes(day))) {
            return true;
        }
        // 주말이 선택되었고, 루틴이 '주말만'인 경우
        if (isWeekend && routine.Days.length === 2 && weekends.every(day => routine.Days.includes(day))) {
            return true;
        }
        return false;
    });

    console.log('Filtered routines:', filtered);
    return filtered;
}

function displayRoutines(routines) {
    const routineList = document.getElementById('routine-list');
    routineList.innerHTML = '';

    routines.forEach(routine => {
        const li = document.createElement('li');
        
        // ActionType에 따라 표시할 텍스트 결정
        let actionText, actionColor;;
        switch(routine.ActionType.toLowerCase()) {
            case 'wait':
                actionText = '대기중';
                actionColor = '#333333'; // 회색
                break;
            case 'true':
                actionText = '성공';
                actionColor = '#008000'; // 초록색
                break;
            case 'false':
                actionText = '실패';
                actionColor = '#FF0000'; // 빨간색
                break;
            default:
                actionText = routine.ActionType; // 기본값으로 원래 ActionType 표시
                actionColor = '#333333'; 
        }

        li.innerHTML = `
            <span class="routine-time">${routine.StartTime || '시간 미설정'}</span>
            <span class="routine-name">${routine.RoutineName}</span>
            <span class="routine-action ${actionText.toLowerCase()}">${actionText}</span>
        `;
        routineList.appendChild(li);
    });
}

function setupDayButtons() {
    const dayButtons = document.querySelectorAll('.day-button');
    dayButtons.forEach(button => {
        button.addEventListener('click', function() {
            dayButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const day = this.textContent;
            console.log('Selected day:', day);
            const filteredRoutines = filterRoutinesByDay(day);
            displayRoutines(filteredRoutines);
        });
    });
}

function activateTodayButton() {
    const today = new Date().getDay();
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const todayButton = document.querySelector(`.day-button:nth-child(${today + 1})`);
    if (todayButton) {
        todayButton.click();
    }
}

function AddRoutine(){
        const addRoutineButton = document.getElementById('addRoutine');

        addRoutineButton.addEventListener('click', function() {
            const switchInputs = document.querySelectorAll('.radio-input[type="radio"]');
        let selectedSwitchId = '';

        switchInputs.forEach(input => {
            if (input.checked) {
                selectedSwitchId = input.id;
            }
        });

        const startTime = document.getElementById('startTimeInput').value;
        const routineTime = document.getElementById('routineSelect').value;
        const daysOfWeek = [];

        const dayCheckboxes = document.querySelectorAll('.radio-inputs input[type="checkbox"]');
        dayCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const dayName = checkbox.parentElement.querySelector('.name').textContent.trim();
                daysOfWeek.push(dayName);
            }
        });

        const noticeText = document.querySelector('.notice_txt_input').value;

        console.log(selectedSwitchId)

        const formData = {
            routineID: selectedSwitchId,
            startTime: startTime,
            routineTime: routineTime,
            daysOfWeek: daysOfWeek,
            noticeText: noticeText
        };

        fetch('/routine/save-routine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Routine successfully saved:', data);
        })
        .catch(error => {
            console.error('Error saving routine:', error);
        });
    });
}

document.querySelector('.button-container .button').addEventListener('click', function() {
    console.log('루틴 추가 버튼 클릭됨');
    const routineModal = new bootstrap.Modal(document.getElementById('routineModal'));
    routineModal.show();
});