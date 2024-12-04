document.addEventListener('DOMContentLoaded', function () {
    const plusButton = document.querySelector('thead img[alt="추가"]');
    const tbody = document.querySelector('tbody');
    const totalTimeElement = document.querySelector('.time-text');
    let timers = {};
    let totalTimer = { hours: 0, minutes: 0, seconds: 0 };

    // Local Storage에서 데이터 로드
    loadFromLocalStorage();

    plusButton.addEventListener('click', function () {
        addNewSubject();
    });

    tbody.addEventListener('click', function (e) {
        if (e.target.alt === '재생' || e.target.alt === '일시정지') {
            toggleTimer(e.target);
        }
    });

    function addNewSubject(subject = '', time = '00:00:00') {
        const newRow = tbody.insertRow();
        newRow.innerHTML = `
        <td>${subject || '<input type="text" placeholder="과목명">'}</td>
        <td>${time}</td>
        <td class="button-cell">
            <div class="play-button-cell">
                <img src="play-button.png" alt="재생" width="10" height="10">
            </div>
        </td>
        <td class="delete-button-cell">
            <img src="delete.png" alt="삭제" width="10" height="10">
        </td>
    `;
        if (!subject) {
            const input = newRow.querySelector('input');
            input.focus();
            // 입력 필드에서 Enter 키를 눌렀을 때 저장하도록 이벤트 추가
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    // Enter를 눌렀을 때 저장
                    if (this.value.trim() !== '') {
                        this.parentElement.innerHTML = this.value;
                        saveToLocalStorage();
                    } else {
                        newRow.remove(); // 빈 값이면 삭제
                    }
                }
            });

            input.addEventListener('blur', function () {
                if (this.value.trim() !== '') {
                    this.parentElement.innerHTML = this.value;
                    saveToLocalStorage();
                } else {
                    newRow.remove();
                }
            });
        }
        saveToLocalStorage();
    }

    // 삭제 버튼 클릭 처리
    tbody.addEventListener('click', function (e) {
        if (e.target.alt === '삭제') {
            const row = e.target.closest('tr');
            const subject = row.cells[0].textContent;
            const time = row.cells[1].textContent;
            // 삭제 전 사용자 확인
            if (confirm("정말로 이 과목을 삭제하시겠습니까?")) {
                row.remove(); // 과목 삭제

                // 삭제된 과목을 deletedSubjects에 추가 (시간 포함)
                const today = new Date();
                const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                const deletedSubjects = JSON.parse(localStorage.getItem('deletedSubjects')) || {};
                if (!deletedSubjects[dateKey]) {
                    deletedSubjects[dateKey] = [];
                }
                deletedSubjects[dateKey].push({ name: subject, time: time });

                // 로컬 스토리지에 저장
                localStorage.setItem('deletedSubjects', JSON.stringify(deletedSubjects));

                saveToLocalStorage(); // 로컬 스토리지에 현재 상태 저장
            }
        }
    });



    function toggleTimer(button) {
        const row = button.closest('tr');
        const subject = row.cells[0].textContent;
        const timeCell = row.cells[1];

        if (timers[subject]) {
            clearInterval(timers[subject]);
            delete timers[subject];
            button.src = 'play-button.png';
            button.alt = '재생';
        } else {
            let [hours, minutes, seconds] = timeCell.textContent.split(':').map(Number);
            timers[subject] = setInterval(() => {
                seconds++;
                if (seconds === 60) {
                    seconds = 0;
                    minutes++;
                    if (minutes === 60) {
                        minutes = 0;
                        hours++;
                    }
                }
                timeCell.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                updateTotalTime();
                saveToLocalStorage();
            }, 1000);
            button.src = 'pause-button.png';
            button.alt = '일시정지';
        }
    }

    function updateTotalTime() {
        totalTimer.seconds++;
        if (totalTimer.seconds === 60) {
            totalTimer.seconds = 0;
            totalTimer.minutes++;
            if (totalTimer.minutes === 60) {
                totalTimer.minutes = 0;
                totalTimer.hours++;
            }
        }
        totalTimeElement.textContent = `${String(totalTimer.hours).padStart(2, '0')}:${String(totalTimer.minutes).padStart(2, '0')}:${String(totalTimer.seconds).padStart(2, '0')}`;
        saveToLocalStorage();
    }

    function saveToLocalStorage() {
        const today = new Date();
        const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const subjects = Array.from(tbody.rows).map(row => ({
            name: row.cells[0].textContent,
            time: row.cells[1].textContent,
        }));

        // 기존 데이터 불러오기
        const studyData = JSON.parse(localStorage.getItem('studyData')) || {};
        const totalTimes = JSON.parse(localStorage.getItem('totalTimes')) || {};
        let deletedSubjects = JSON.parse(localStorage.getItem('deletedSubjects')) || {};

        // 날짜별 과목 데이터 업데이트
        studyData[dateKey] = subjects;

        // 삭제된 과목 처리
        if (!deletedSubjects[dateKey]) {
            deletedSubjects[dateKey] = [];
        }
        const currentSubjectNames = subjects.map(s => s.name);
        const previousSubjects = studyData[dateKey] || [];
        previousSubjects.forEach(subject => {
            if (!currentSubjectNames.includes(subject.name)) {
                // 중복 방지를 위해 이름 기반으로 체크
                const alreadyDeleted = deletedSubjects[dateKey].find(s => s.name === subject.name);
                if (!alreadyDeleted) {
                    deletedSubjects[dateKey].push(subject);
                }
            }
        });

        // 총 학습 시간 저장 (삭제된 과목 포함)
        totalTimes[dateKey] = `${String(totalTimer.hours).padStart(2, '0')}:${String(totalTimer.minutes).padStart(2, '0')}:${String(totalTimer.seconds).padStart(2, '0')}`;

        // 데이터 저장
        localStorage.setItem('studyData', JSON.stringify(studyData));
        localStorage.setItem('totalTimes', JSON.stringify(totalTimes));
        localStorage.setItem('deletedSubjects', JSON.stringify(deletedSubjects));
        localStorage.setItem('subjects', JSON.stringify(subjects));
    }




    function loadFromLocalStorage() {
        const subjects = JSON.parse(localStorage.getItem('subjects')) || [];
        const totalTimes = JSON.parse(localStorage.getItem('totalTimes')) || {};

        // 오늘 날짜 키 생성
        const today = new Date();
        const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        // 오늘 날짜의 총 시간 불러오기
        const todayTotalTime = totalTimes[dateKey] || '00:00:00';

        // 총 시간을 시, 분, 초로 분리
        const [hours, minutes, seconds] = todayTotalTime.split(':').map(Number);

        totalTimer = { hours, minutes, seconds };
        totalTimeElement.textContent = todayTotalTime;

        tbody.innerHTML = ''; // 기존 테이블 내용 초기화
        subjects.forEach(subject => addNewSubject(subject.name, subject.time));
    }

});