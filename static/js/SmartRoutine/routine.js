let allRoutines = []; // 모든 루틴을 저장할 전역 변수

document.addEventListener('DOMContentLoaded', function() {
    setupDayButtons();
    fetchAllUserRoutines();
    fetchTitles();
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

function fetchTitles() {
    fetch('/routine/titles')
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            updateTitleList(data);
        })
        .catch(error => {
            console.error('Fetch error:', error);
            const noTitleMessage = document.getElementById('no-title-message');
            noTitleMessage.textContent = '칭호를 불러오는 중 오류가 발생했습니다: ' + error.message;
            noTitleMessage.style.display = 'block';
        });
}


function updateTitleList(titles) {
    const titleList = document.getElementById('title-list');
    const noTitleMessage = document.getElementById('no-title-message');

    // 기존 칭호 목록 초기화
    titleList.innerHTML = '';
    
    if (titles.length > 0) {
        noTitleMessage.style.display = 'none';

        // 칭호를 First와 Last로 분류
        const firstTitles = titles.filter(title => title.Type === 'First');
        const lastTitles = titles.filter(title => title.Type === 'Last');

        // 컨테이너 생성
        const container = document.createElement('div');
        container.className = 'title-container';

        // 왼쪽 (First) 칭호 목록 생성
        const leftList = createTitleList(firstTitles, 'First');
        leftList.className = 'title-list left';

        // 오른쪽 (Last) 칭호 목록 생성
        const rightList = createTitleList(lastTitles, 'Last');
        rightList.className = 'title-list right';

        // 컨테이너에 왼쪽과 오른쪽 목록 추가
        container.appendChild(leftList);
        container.appendChild(rightList);

        // 전체 목록에 컨테이너 추가
        titleList.appendChild(container);
    } else {
        noTitleMessage.style.display = 'block';
    }
}

// 전역 변수로 현재 선택된 칭호를 저장
let selectedTitle = null;

function selectTitle(titleId, type) {
    console.log("Function called with:", { titleId, type });

    // titleId가 undefined나 null이면 함수를 종료합니다.
    if (titleId == null) {
        console.log("Invalid titleId");
        return;
    }

    // titleId를 문자열로 변환
    titleId = String(titleId);

    // 클릭된 칭호를 찾습니다.
    const clickedTitle = document.querySelector(`.title-item[data-id="${titleId}"]`);
    
    console.log("Clicked title element:", clickedTitle);

    if (clickedTitle) {
        // 현재 선택된 칭호와 같은 칭호를 클릭한 경우, 선택을 해제합니다.
        if (selectedTitle === titleId) {
            clickedTitle.style.color = '';
            selectedTitle = null;
        } else {
            // 이전에 선택된 칭호가 있다면 그 색상을 초기화합니다.
            if (selectedTitle) {
                const previousSelectedTitle = document.querySelector(`.title-item[data-id="${selectedTitle}"]`);
                if (previousSelectedTitle) {
                    previousSelectedTitle.style.color = '';
                }
            }
            
            // 새로운 칭호를 선택 상태로 만듭니다.
            clickedTitle.style.color = 'var(--accent4)';
            selectedTitle = titleId;
        }
    } else {
        console.log("Clicked title element not found");
    }

    console.log(`Selected Title:`, selectedTitle);
}


function createTitleList(titles, type) {
    const list = document.createElement('ul');
    list.className = `title-list ${type.toLowerCase()}`;

    titles.forEach(title => {
        if (title.UnlockedID) {
            const li = document.createElement('li');
            li.className = 'title-item';
            li.textContent = title.TitleName;
            
            // TitleID가 존재하는지 확인하고, 없으면 UnlockedID를 사용
            const titleId = title.TitleID !== undefined ? title.TitleID : title.UnlockedID;
            li.dataset.id = String(titleId);

            li.onclick = function(event) {
                event.preventDefault();
                console.log("Title clicked:", { id: titleId, name: title.TitleName });
                selectTitle(titleId, type);
            };
            list.appendChild(li);
        }
    });

    if (list.children.length === 0) {
        const li = document.createElement('li');
        li.textContent = `${type} 칭호가 없습니다.`;
        list.appendChild(li);
    }

    return list;
}
