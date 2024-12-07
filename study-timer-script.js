document.addEventListener('DOMContentLoaded', function () {
    const plusButton = document.querySelector('thead img[alt="추가"]');
    const tbody = document.querySelector('tbody');
    const totalTimeElement = document.querySelector('.time-text');
    let timers = {};
    let totalTimer = { hours: 0, minutes: 0, seconds: 0 };

    loadFromLocalStorage();
    resetSubjectTimesForNewDay();

    plusButton.addEventListener('click', () => addNewSubject());

    tbody.addEventListener('click', (e) => {
        if (e.target.alt === '재생' || e.target.alt === '일시정지') toggleTimer(e.target);
        if (e.target.alt === '삭제') deleteSubject(e.target);
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
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && input.value.trim()) {
                    newRow.cells[0].textContent = input.value;
                    saveToLocalStorage();
                } else if (e.key === 'Enter') newRow.remove();
            });
            input.addEventListener('blur', () => {
                if (input.value.trim()) {
                    newRow.cells[0].textContent = input.value;
                    saveToLocalStorage();
                } else newRow.remove();
            });
        }
        saveToLocalStorage();
    }

    function deleteSubject(button) {
        const row = button.closest('tr');
        const subject = row.cells[0].textContent;
        const time = row.cells[1].textContent;
        if (confirm("정말로 이 과목을 삭제하시겠습니까?")) {
            row.remove();
            const today = new Date();
            const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const deletedSubjects = JSON.parse(localStorage.getItem('deletedSubjects')) || {};
            if (!deletedSubjects[dateKey]) deletedSubjects[dateKey] = [];
            deletedSubjects[dateKey].push({ name: subject, time });
            localStorage.setItem('deletedSubjects', JSON.stringify(deletedSubjects));
            saveToLocalStorage();
        }
    }

    function toggleTimer(button) {
        const row = button.closest('tr');
        const subject = row.cells[0].textContent;
        const timeCell = row.cells[1];

        Object.keys(timers).forEach((key) => {
            clearInterval(timers[key]);
            const activeRow = Array.from(tbody.rows).find(r => r.cells[0].textContent === key);
            if (activeRow) {
                const buttonToUpdate = activeRow.querySelector('img[alt="일시정지"]');
                if (buttonToUpdate) {
                    buttonToUpdate.src = 'play-button.png';
                    buttonToUpdate.alt = '재생';
                }
            }
        });

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

    function resetSubjectTimesForNewDay() {
        const today = new Date();
        const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const lastVisitDate = localStorage.getItem('lastVisitDate');
        const subjects = JSON.parse(localStorage.getItem('subjects')) || [];
        if (lastVisitDate !== dateKey) {
            subjects.forEach(subject => subject.time = '00:00:00');
            localStorage.setItem('subjects', JSON.stringify(subjects));
            tbody.innerHTML = '';
            subjects.forEach(subject => addNewSubject(subject.name, subject.time));
        }
        localStorage.setItem('lastVisitDate', dateKey);
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
        const studyData = JSON.parse(localStorage.getItem('studyData')) || {};
        const totalTimes = JSON.parse(localStorage.getItem('totalTimes')) || {};
        const deletedSubjects = JSON.parse(localStorage.getItem('deletedSubjects')) || {};
        if (!deletedSubjects[dateKey]) deletedSubjects[dateKey] = [];
        const currentSubjectNames = subjects.map(s => s.name);
        (studyData[dateKey] || []).forEach(subject => {
            if (!currentSubjectNames.includes(subject.name)) {
                if (!deletedSubjects[dateKey].find(s => s.name === subject.name)) {
                    deletedSubjects[dateKey].push(subject);
                }
            }
        });
        studyData[dateKey] = subjects;
        totalTimes[dateKey] = `${String(totalTimer.hours).padStart(2, '0')}:${String(totalTimer.minutes).padStart(2, '0')}:${String(totalTimer.seconds).padStart(2, '0')}`;
        localStorage.setItem('studyData', JSON.stringify(studyData));
        localStorage.setItem('totalTimes', JSON.stringify(totalTimes));
        localStorage.setItem('deletedSubjects', JSON.stringify(deletedSubjects));
        localStorage.setItem('subjects', JSON.stringify(subjects));
    }

    function loadFromLocalStorage() {
        const subjects = JSON.parse(localStorage.getItem('subjects')) || [];
        const totalTimes = JSON.parse(localStorage.getItem('totalTimes')) || {};
        const today = new Date();
        const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const todayTotalTime = totalTimes[dateKey] || '00:00:00';
        const [hours, minutes, seconds] = todayTotalTime.split(':').map(Number);
        totalTimer = { hours, minutes, seconds };
        totalTimeElement.textContent = todayTotalTime;
        tbody.innerHTML = '';
        subjects.forEach(subject => addNewSubject(subject.name, subject.time));
    }
});
