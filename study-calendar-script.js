document.addEventListener('DOMContentLoaded', function () {
    const calendarBody = document.getElementById('calendar-body');
    const monthYearDisplay = document.getElementById('month-year');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    let currentDate = new Date();
    let myChart;

    function renderCalendar() {
        monthYearDisplay.textContent = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;
        calendarBody.innerHTML = '';
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startingDay = firstDayOfMonth.getDay();
        const totalDays = lastDayOfMonth.getDate();
        let row = document.createElement('tr');

        for (let i = 0; i < startingDay; i++) {
            row.appendChild(document.createElement('td'));
        }

        for (let day = 1; day <= totalDays; day++) {
            const cell = document.createElement('td');
            cell.innerHTML = `<div class="date">${day}</div>`;
            const studyHours = getTotalStudyHours(day);

            if (studyHours) {
                cell.innerHTML += `<div class="study-time">${studyHours}</div>`;
            } else {
                cell.innerHTML += `<div class="study-time">-</div>`;
            }

            row.appendChild(cell);
            if ((startingDay + day) % 7 === 0) {
                calendarBody.appendChild(row);
                row = document.createElement('tr');
            }
        }

        calendarBody.appendChild(row);
        updateChart();
    }

    function getTotalStudyHours(day) {
        const totalTimes = JSON.parse(localStorage.getItem('totalTimes')) || {};
        const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return totalTimes[dateKey] || null;
    }

    function updateChart() {
        if (myChart) {
            myChart.destroy();
        }

        const studyData = JSON.parse(localStorage.getItem('studyData')) || {};
        const deletedSubjects = JSON.parse(localStorage.getItem('deletedSubjects')) || {};
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const subjectTimeMap = {};

        for (let day = 1; day <= 31; day++) {
            const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            if (studyData[dateKey]) {
                studyData[dateKey].forEach(subject => {
                    addSubjectTime(subjectTimeMap, subject.name, subject.time);
                });
            }

            if (deletedSubjects[dateKey]) {
                deletedSubjects[dateKey].forEach(subject => {
                    addSubjectTime(subjectTimeMap, subject.name, subject.time);
                });
            }
        }

        const labels = Object.keys(subjectTimeMap).filter(name => subjectTimeMap[name] > 0);
        const data = labels.map(name => subjectTimeMap[name] / 3600);
        renderChart(labels, data);
    }

    function addSubjectTime(map, name, time) {
        if (!map[name]) map[name] = 0;
        if (!time || time === "00:00:00") return;

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
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthButton.addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();
});
