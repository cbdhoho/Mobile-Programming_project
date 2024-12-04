document.addEventListener('DOMContentLoaded', function () {
    const calendarBody = document.getElementById('calendar-body');
    const monthYearDisplay = document.getElementById('month-year');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');

    let currentDate = new Date(); // 현재 날짜
    let myChart; // 차트 객체를 전역으로 선언

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

        updateChart(); // 차트 업데이트
    }

    function getTotalStudyHours(day) {
        const totalTimes = JSON.parse(localStorage.getItem('totalTimes')) || {};
        const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        return totalTimes[dateKey] || null;
    }

    function updateChart() {
        // 기존 차트가 있다면 제거
        if (myChart) {
            myChart.destroy();
        }
    
        const studyData = JSON.parse(localStorage.getItem('studyData')) || {};
        const deletedSubjects = JSON.parse(localStorage.getItem('deletedSubjects')) || {};
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
    
        const subjectTimeMap = {};
    
        // 현재 월의 모든 날짜에 대해 반복
        for (let day = 1; day <= 31; day++) {
            const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
            // 현재 과목 데이터 처리
            if (studyData[dateKey]) {
                studyData[dateKey].forEach(subject => {
                    addSubjectTime(subjectTimeMap, subject.name, subject.time);
                });
            }
    
            // 삭제된 과목 데이터 처리
            if (deletedSubjects[dateKey]) {
                deletedSubjects[dateKey].forEach(subject => {
                    addSubjectTime(subjectTimeMap, subject.name, subject.time);
                });
            }
        }
    
        // 차트 데이터 준비 및 렌더링
        const labels = Object.keys(subjectTimeMap).filter(name => subjectTimeMap[name] > 0);
        const data = labels.map(name => subjectTimeMap[name] / 3600); // 시간을 초 단위에서 시간 단위로 변환
        renderChart(labels, data);
    }
    

    function addSubjectTime(map, name, time) {
        if (!map[name]) map[name] = 0;
    
        // time이 유효한지 확인
        if (!time || time === "00:00:00") return; // 시간이 "00:00:00"인 과목은 포함하지 않음
    
        const [hours, minutes, seconds] = time.split(':').map(Number);
        map[name] += hours * 3600 + minutes * 60 + seconds;
    }
    
    function renderChart(labels, data) {
        const ctx = document.getElementById('myChart').getContext('2d');

        myChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                    ],
                    borderWidth: 1,
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            // 범례 텍스트 스타일
                            font: {
                                size: 14,
                                family: "'Poor Story', Arial, Helvetica, 'sans-serif'"
                            },
                        }
                    },
                    title: {
                        display: true,
                        text: `${currentDate.getMonth() + 1}월 학습 통계`,
                        font: {
                            size: 24,
                            family: "'Poor Story', Arial, Helvetica, 'sans-serif'"                            
                        }
                    },
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
