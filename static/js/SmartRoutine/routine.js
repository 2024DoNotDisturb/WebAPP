let allRoutines = []; // 모든 루틴을 저장할 전역 변수

document.addEventListener('DOMContentLoaded', function() {
    setupDayButtons();
    fetchAllUserRoutines();
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
    return allRoutines.filter(routine => routine.Day === selectedDay);
}

function displayRoutines(routines) {
    const routineList = document.getElementById('routine-list');
    routineList.innerHTML = '';

    if (routines.length === 0) {
        routineList.innerHTML = '<li id="no-routine-message">해당 요일에 <br>설정된 루틴이 없습니다.</li>';
        return;
    }

    routines.forEach(routine => {
        const li = document.createElement('li');
        
        let actionText, actionColor;
        switch(routine.ActionType.toLowerCase()) {
            case 'wait':
                actionText = '대기중';
                actionColor = '#333333';
                break;
            case 'true':
                actionText = '성공';
                actionColor = '#008000';
                break;
            case 'false':
                actionText = '실패';
                actionColor = '#FF0000';
                break;
            default:
                actionText = routine.ActionType;
                actionColor = '#333333'; 
        }

        li.innerHTML = `
            <span class="routine-time">${routine.StartTime || '시간 미설정'}</span>
            <span class="routine-name">${routine.RoutineName}</span>
            <span class="routine-action ${actionText.toLowerCase()}" data-schedule-id="${routine.ScheduleID}">${actionText}</span>
        `;
        routineList.appendChild(li);
    });
}

function setupDayButtons() {
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
    const dayButtons = document.querySelectorAll('.day-button');
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    
    dayButtons.forEach((button, index) => {
        button.textContent = days[index];
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
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const todayName = days[today];
    const todayButton = document.querySelector(`.day-button:nth-child(${(today === 0 ? 7 : today)})`);
    if (todayButton) {
        todayButton.click();
    } else {
        console.warn('Today button not found');
    }
}

function resetRoutineStatuses() {
    fetch('/routine/reset_routine_statuses', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Routine statuses reset:', data);
        fetchAllUserRoutines(); // 루틴 목록을 새로고침
    })
    .catch(error => {
        console.error('Error resetting routine statuses:', error);
        displayError('루틴 상태 초기화 중 오류가 발생했습니다.');
    });
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