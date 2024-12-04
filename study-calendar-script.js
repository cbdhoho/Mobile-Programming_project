document.addEventListener('DOMContentLoaded', function () {
    const calendarBody = document.getElementById('calendar-body');
    const monthYearDisplay = document.getElementById('month-year');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');

    let currentDate = new Date(); // 현재 날짜

    function renderCalendar() {
        monthYearDisplay.textContent = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;
    
        // 달력 내용 초기화
        calendarBody.innerHTML = '';
    
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
        const startingDay = firstDayOfMonth.getDay();
        const totalDays = lastDayOfMonth.getDate();
    
        // 빈 칸 추가
        let row = document.createElement('tr');
        for (let i = 0; i < startingDay; i++) {
            row.appendChild(document.createElement('td'));
        }
    
        // 날짜와 공부 시간 추가
        for (let day = 1; day <= totalDays; day++) {
            const cell = document.createElement('td');
            
            // 날짜를 상단에 추가
            cell.innerHTML = `<div class="date">${day}</div>`;
    
            // 공부 시간 가져오기
            const studyHours = getTotalStudyHours(day);
            if (studyHours) {
                // 공부 시간을 아래에 추가
                cell.innerHTML += `<div class="study-time">${studyHours}</div>`;
            } else {
                // 공부 시간이 없으면 빈 공간을 표시
                cell.innerHTML += `<div class="study-time">-</div>`;
            }
    
            row.appendChild(cell);
    
            // 한 주가 끝나면 새로운 행 생성
            if ((startingDay + day) % 7 === 0) {
                calendarBody.appendChild(row);
                row = document.createElement('tr');
            }
        }
    
        // 마지막 행 추가
        calendarBody.appendChild(row);
        updateChart();
    }
    


    function getTotalStudyHours(day) {
        const studyData = JSON.parse(localStorage.getItem('studyData')) || {};
        const totalTimes = JSON.parse(localStorage.getItem('totalTimes')) || {};
        const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
        // 총 학습 시간 우선 반환
        if (totalTimes[dateKey]) {
            return totalTimes[dateKey];
        }
    
        // 과목별 시간 합산 (이전 동작 유지)
        if (studyData[dateKey]) {
            let totalSeconds = studyData[dateKey].reduce((acc, timeString) => {
                const [hours, minutes, seconds] = timeString.split(':').map(Number);
                return acc + hours * 3600 + minutes * 60 + seconds;
            }, 0);
    
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
    
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    
        return null; // 해당 날짜에 데이터가 없으면 null 반환
    }
    
    
    

    function updateChart() {
        const savedSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // 현재 월에 해당하는 데이터 필터링
        const monthlySubjects = savedSubjects.filter(subject => {
            const date = new Date(subject.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        // 과목별 시간 합산
        const subjectTimeMap = {};
        monthlySubjects.forEach(subject => {
            const [hours, minutes, seconds] = subject.time.split(':').map(Number);
            const totalSeconds = hours * 3600 + minutes * 60 + seconds;

            if (!subjectTimeMap[subject.name]) {
                subjectTimeMap[subject.name] = 0;
            }
            subjectTimeMap[subject.name] += totalSeconds;
        });

        // 비율 계산 (초 -> 퍼센트)
        const totalSeconds = Object.values(subjectTimeMap).reduce((a, b) => a + b, 0);
        const labels = Object.keys(subjectTimeMap);
        const data = labels.map(name => Math.round((subjectTimeMap[name] / totalSeconds) * 100));

        // 차트 생성
        const ctx = document.getElementById('myChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)'],
                    borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)'],
                    borderWidth: 1,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: `${currentMonth + 1}월 학습 통계` },
                },
            },
        });
    }


    prevMonthButton.addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() - 1); // 이전 달로 이동
        renderCalendar();
    });

    nextMonthButton.addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() + 1); // 다음 달로 이동
        renderCalendar();
    });

    renderCalendar(); // 초기 달력 렌더링
});