document.addEventListener('DOMContentLoaded', function () {
    const datePicker = document.getElementById('date-picker');
    const todoInput = document.getElementById('todo-input');
    const addTodoButton = document.getElementById('add-todo');
    const todoList = document.getElementById('todo-list');
    const selectedDateTitle = document.getElementById('selected-date-title');

    const todays = new Date(); // 현재 날짜와 시간을 대한민국 시간대로 가져옴
    const year = todays.getFullYear();
    const month = String(todays.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(todays.getDate()).padStart(2, '0'); // 날짜 포맷에 맞게 2자리로 표현

    const today = `${year}-${month}-${day}`; // YYYY-MM-DD 형식으로 변환
    datePicker.value = today;

    // 초기 상태 설정
    setSelectedDateTitle(today);
    loadTodos(today);

    // 날짜 변경 시 이벤트
    datePicker.addEventListener('change', function () {
        const selectedDate = this.value;
        setSelectedDateTitle(selectedDate);
        loadTodos(selectedDate);
    });

    // 할일 추가 버튼 클릭 시
    addTodoButton.addEventListener('click', function () {
        const todoText = todoInput.value.trim();
        const selectedDate = datePicker.value;

        if (todoText) {
            addTodo(selectedDate, todoText);
            todoInput.value = ''; // 입력창 초기화
        }
    });

    // 엔터 키 입력 시 할일 추가
    todoInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            const todoText = todoInput.value.trim();
            const selectedDate = datePicker.value;

            if (todoText) {
                addTodo(selectedDate, todoText);
                todoInput.value = ''; // 입력창 초기화
            }
        }
    });

    function setSelectedDateTitle(date) {
        const dateObj = new Date(date);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const formattedDate = dateObj.toLocaleDateString('ko-KR', options).replace(/\./g, '.'); // YYYY.MM.DD 형식으로 변환
        const dayOfWeek = getDayOfWeek(dateObj); // 요일 계산
        if (selectedDateTitle) {
            selectedDateTitle.textContent = `${formattedDate}(${dayOfWeek}) 할 일 리스트`;
        }
    }

    // 요일 계산 함수
    function getDayOfWeek(date) {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return days[date.getDay()]; // getDay()는 0(일요일)부터 6(토요일)까지의 숫자를 반환
    }

    function addTodo(date, text) {
        const todoItem = createTodoElement(text, false);
        todoList.appendChild(todoItem);
        saveTodos(date); // 할일 저장
        updateNoTodoMessage(); // "할 일이 없습니다." 메시지 업데이트
    }

    function createTodoElement(text, completed) {
        const todoItem = document.createElement('li');

        // 커스텀 체크박스 HTML 추가
        todoItem.innerHTML = `
            <div class="custom-checkbox ${completed ? 'checked' : ''}" tabindex="0"></div>
            <input type="text" class="edit-input" style="display: none;" placeholder="수정할 내용을 입력하세요" />
            <span class="${completed ? 'completed' : ''}" style="${completed ? 'text-decoration: line-through;' : ''}">${text}</span>
            <button class="edit-button">수정</button>
            <button class="delete-button">삭제</button>
        `;

        // 체크박스 클릭 이벤트
        const checkbox = todoItem.querySelector('.custom-checkbox');

        checkbox.addEventListener('click', function () {
            this.classList.toggle('checked');
            const span = todoItem.querySelector('span');
            span.style.textDecoration = this.classList.contains('checked') ? 'line-through' : 'none';
            span.classList.toggle('completed', this.classList.contains('checked')); // 완료 클래스 추가
            saveTodos(datePicker.value); // 상태 저장
        });

        // 수정 버튼 이벤트
        const editButton = todoItem.querySelector('.edit-button');
        const editInput = todoItem.querySelector('.edit-input');

        editButton.addEventListener('click', function () {
            const span = todoItem.querySelector('span'); // span 요소를 가져옴
            if (editInput.style.display === 'none') {
                editInput.value = span.textContent; // 현재 텍스트로 초기화
                editInput.style.display = 'inline-block'; // 입력란 보이기
                span.style.display = 'none'; // 원래 텍스트 숨기기
                editButton.textContent = '완료'; // 버튼 텍스트 변경
            } else {
                const newText = editInput.value.trim();
                if (newText) {
                    span.textContent = newText; // 텍스트 업데이트
                    editInput.style.display = 'none'; // 입력란 숨기기
                    span.style.display = 'inline'; // 원래 텍스트 보이기
                    editButton.textContent = '수정'; // 버튼 텍스트 원래대로 변경
                    saveTodos(datePicker.value); // 상태 저장
                }
            }
        });

        // Enter 키로 수정 완료
        editInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const newText = editInput.value.trim();
                if (newText) {
                    const span = todoItem.querySelector('span');
                    span.textContent = newText; // 텍스트 업데이트
                    editInput.style.display = 'none'; // 입력란 숨기기
                    span.style.display = 'inline'; // 원래 텍스트 보이기
                    const editButton = todoItem.querySelector('.edit-button');
                    editButton.textContent = '수정'; // 버튼 텍스트 원래대로 변경
                    saveTodos(datePicker.value); // 상태 저장
                }
            }
        });


        // 삭제 버튼 이벤트
        todoItem.querySelector('.delete-button').addEventListener('click', function () {
            todoList.removeChild(todoItem);
            saveTodos(datePicker.value); // 상태 저장
            updateNoTodoMessage(); // "할 일이 없습니다." 메시지 업데이트
        });

        return todoItem;
    }

    function saveTodos(date) {
        const todos = Array.from(todoList.children)
            .filter(item => !item.id || item.id !== 'no-todo-message') // "할 일이 없습니다." 항목 제외
            .map(item => ({
                text: item.querySelector('span').textContent,
                completed: item.querySelector('.custom-checkbox').classList.contains('checked'),
            }));

        localStorage.setItem(`todos_${date}`, JSON.stringify(todos));
    }


    function loadTodos(date) {
        todoList.innerHTML = ''; // 기존 리스트 초기화
        const todos = JSON.parse(localStorage.getItem(`todos_${date}`)) || [];

        if (todos.length === 0) {
            updateNoTodoMessage(); // "할 일이 없습니다." 메시지 표시
        } else {
            todos.forEach(todo => {
                const todoItem = createTodoElement(todo.text, todo.completed);
                todoList.appendChild(todoItem);
            });
            updateNoTodoMessage(); // "할 일이 없습니다." 메시지 업데이트
        }
    }

    // "할 일이 없습니다." 메시지 업데이트 함수
    function updateNoTodoMessage() {
        const noTodoMessageId = 'no-todo-message';
        let noTodoMessage = document.getElementById(noTodoMessageId);

        if (todoList.children.length === 0) {
            if (!noTodoMessage) { // 메시지가 없을 때만 추가
                noTodoMessage = document.createElement('li');
                noTodoMessage.id = noTodoMessageId;
                noTodoMessage.textContent = '할 일이 없습니다.';
                noTodoMessage.style.textAlign = 'center';
                todoList.appendChild(noTodoMessage);
            }
        } else if (noTodoMessage) {
            todoList.removeChild(noTodoMessage);
        }
    }

    flatpickr("#date-picker", {
        dateFormat: "Y-m-d",
        onChange: function (selectedDates, dateStr, instance) {
            setSelectedDateTitle(dateStr);
            loadTodos(dateStr);
        }
    });
});