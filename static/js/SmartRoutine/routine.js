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

function AddRoutine() {
    console.log('루틴 추가');
    const addRoutineButton = document.getElementById('addRoutine');

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

    const formData = {
        routineID: selectedSwitchId,
        startTime: startTime,
        routineTime: routineTime,
        daysOfWeek: daysOfWeek,
        noticeText: noticeText
    };

    fetch('/routine/save_routine', {
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
            window.location.reload();
        })
        .catch(error => {
            console.error('Error saving routine:', error);
        });

}

document.getElementById('addRoutine').addEventListener('click', AddRoutine);

document.querySelector('.button-container .button').addEventListener('click', function () {
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

function selectTitle(titleId, type, titleName) {
    console.log("Function called with:", { titleId, type, titleName });

    if (titleId == null) {
        console.log("Invalid titleId");
        return;
    }

    titleId = String(titleId);

    const clickedTitle = document.querySelector(`.title-item[data-id="${titleId}"]`);
    console.log("Clicked title element:", clickedTitle);

    if (clickedTitle) {
        if (selectedTitle === titleId) {
            clickedTitle.style.color = '';
            selectedTitle = null;
        } else {
            if (selectedTitle) {
                const previousSelectedTitle = document.querySelector(`.title-item[data-id="${selectedTitle}"]`);
                if (previousSelectedTitle) {
                    previousSelectedTitle.style.color = '';
                }
            }
            clickedTitle.style.color = 'var(--accent4)';
            selectedTitle = titleId;

            // 모달 창을 띄웁니다.
            showModal(titleName, type);
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
                console.log("Title clicked:", { id: titleId, name: title.TitleName, type: type });
                selectTitle(titleId, type, title.TitleName);
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



// 모달 관련 함수들
function showModal(titleName, type) {
    const modalBackground = document.querySelector('.modal-background');
    const modal = document.querySelector('.title-setting');
    const heading = modal.querySelector('.title-setting-heading');
    const titleNameSpan = modal.querySelector('.title-name');
    const cancelButton = modal.querySelector('.secondary');
    const applyButton = modal.querySelector('.primary');
    const exitButton = modal.querySelector('.exit-button');

    heading.textContent = '칭호 착용';
    titleNameSpan.textContent = titleName;
    
    modalBackground.style.display = 'flex';

    cancelButton.onclick = closeModal;
    exitButton.onclick = closeModal;
    applyButton.onclick = function() {
        console.log(`Applying title: ${titleName}, Type: ${type}`);
        updateEquippedTitle(titleName, type);
        closeModal();
    };

    modalBackground.onclick = function(event) {
        if (event.target === modalBackground) {
            closeModal();
        }
    };
}

function closeModal() {
    const modalBackground = document.querySelector('.modal-background');
    modalBackground.style.display = 'none';
}

function updateEquippedTitle(titleName, type) {
    fetch('/title/equip_title', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title_name: titleName,
            title_type: type
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data.message);
        alert('칭호가 성공적으로 착용되었습니다.');
    })
    .catch((error) => {
        console.error('Error:', error.message);
        alert(`칭호 착용 중 오류가 발생했습니다: ${error.message}`);
    });
}
