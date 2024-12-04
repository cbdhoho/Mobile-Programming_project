document.addEventListener('DOMContentLoaded', function() {
    const plusButton = document.querySelector('thead img[alt="추가"]');
    const tbody = document.querySelector('tbody');
    const totalTimeElement = document.querySelector('.time-text');
    let timers = {};
    let totalTimer = { hours: 0, minutes: 0, seconds: 0 };

    // Local Storage에서 데이터 로드
    loadFromLocalStorage();

    plusButton.addEventListener('click', function() {
        addNewSubject();
    });

    tbody.addEventListener('click', function(e) {
        if (e.target.alt === '재생' || e.target.alt === '일시정지') {
            toggleTimer(e.target);
        }
    });

    function addNewSubject(subject = '', time = '00:00:00') {
        const newRow = tbody.insertRow();
        newRow.innerHTML = `
            <td>${subject || '<input type="text" placeholder="과목명">'}</td>
            <td>${time}</td>
            <td>
                <img src="play-button.png" alt="재생" width="10" height="10">
                <img src="delete.png" alt="삭제" width="10" height="10">
            </td>
        `;
        if (!subject) {
            const input = newRow.querySelector('input');
            input.focus();
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
            row.remove();
            saveToLocalStorage();
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
            time: row.cells[1].textContent
        }));
    
        // 기존 데이터 불러오기
        const studyData = JSON.parse(localStorage.getItem('studyData')) || {};
        
        // 해당 날짜의 데이터 저장
        studyData[dateKey] = subjects.map(subject => subject.time);
    
        // 저장
        localStorage.setItem('studyData', JSON.stringify(studyData));
        localStorage.setItem('subjects', JSON.stringify(subjects));
        localStorage.setItem('totalTime', JSON.stringify(totalTimer));
    }
    

    function loadFromLocalStorage() {
        const subjects = JSON.parse(localStorage.getItem('subjects')) || [];
        const savedTotalTime = JSON.parse(localStorage.getItem('totalTime'));

        if (savedTotalTime) {
            totalTimer = savedTotalTime;
            totalTimeElement.textContent = `${String(totalTimer.hours).padStart(2, '0')}:${String(totalTimer.minutes).padStart(2, '0')}:${String(totalTimer.seconds).padStart(2, '0')}`;
        }

        tbody.innerHTML = ''; // 기존 테이블 내용 초기화
        subjects.forEach(subject => addNewSubject(subject.name, subject.time));
    }
});