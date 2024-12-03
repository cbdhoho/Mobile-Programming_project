document.addEventListener('DOMContentLoaded', function () {
    const datePicker = document.getElementById('date-picker');
    const todoInput = document.getElementById('todo-input');
    const addTodoButton = document.getElementById('add-todo');
    const todoList = document.getElementById('todo-list');
    const selectedDateTitle = document.getElementById('selected-date-title');

    // 현재 날짜로 디폴트 설정
    const today = new Date().toISOString().split('T')[0];
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

    function setSelectedDateTitle(date) {
        if (selectedDateTitle) {
            selectedDateTitle.textContent = `${date}의 할 일`;
        }
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
            <span class="${completed ? 'completed' : ''}" style="${completed ? 'text-decoration: line-through;' : ''}">${text}</span>
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
        
        // 키보드 접근성 추가
        checkbox.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                this.click();
                e.preventDefault(); // 기본 동작 방지
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
    onChange: function(selectedDates, dateStr, instance) {
        setSelectedDateTitle(dateStr);
        loadTodos(dateStr);
    }
});
});