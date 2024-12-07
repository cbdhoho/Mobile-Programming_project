document.addEventListener('DOMContentLoaded', function () {
    const datePicker = document.getElementById('date-picker');
    const todoInput = document.getElementById('todo-input');
    const addTodoButton = document.getElementById('add-todo');
    const todoList = document.getElementById('todo-list');
    const selectedDateTitle = document.getElementById('selected-date-title');

    const todays = new Date();
    const year = todays.getFullYear();
    const month = String(todays.getMonth() + 1).padStart(2, '0');
    const day = String(todays.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

    datePicker.value = today;
    setSelectedDateTitle(today);
    loadTodos(today);

    datePicker.addEventListener('change', function () {
        const selectedDate = this.value;
        setSelectedDateTitle(selectedDate);
        loadTodos(selectedDate);
    });

    addTodoButton.addEventListener('click', function () {
        const todoText = todoInput.value.trim();
        const selectedDate = datePicker.value;
        if (todoText) {
            addTodo(selectedDate, todoText);
            todoInput.value = '';
        }
    });

    todoInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            const todoText = todoInput.value.trim();
            const selectedDate = datePicker.value;
            if (todoText) {
                addTodo(selectedDate, todoText);
                todoInput.value = '';
            }
        }
    });

    function setSelectedDateTitle(date) {
        const dateObj = new Date(date);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const formattedDate = dateObj.toLocaleDateString('ko-KR', options).replace(/\./g, '.');
        const dayOfWeek = getDayOfWeek(dateObj);
        if (selectedDateTitle) {
            selectedDateTitle.textContent = `${formattedDate}(${dayOfWeek}) 할 일 리스트`;
        }
    }

    function getDayOfWeek(date) {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return days[date.getDay()];
    }

    function addTodo(date, text) {
        const todoItem = createTodoElement(text, false);
        todoList.appendChild(todoItem);
        saveTodos(date);
        updateNoTodoMessage();
    }

    function createTodoElement(text, completed) {
        const todoItem = document.createElement('li');
        todoItem.innerHTML = `
            <div class="custom-checkbox ${completed ? 'checked' : ''}" tabindex="0"></div>
            <input type="text" class="edit-input" style="display: none;" placeholder="수정할 내용을 입력하세요" />
            <span class="${completed ? 'completed' : ''}" style="${completed ? 'text-decoration: line-through;' : ''}">${text}</span>
            <button class="edit-button">수정</button>
            <button class="delete-button">삭제</button>
        `;

        const checkbox = todoItem.querySelector('.custom-checkbox');
        checkbox.addEventListener('click', function () {
            this.classList.toggle('checked');
            const span = todoItem.querySelector('span');
            span.style.textDecoration = this.classList.contains('checked') ? 'line-through' : 'none';
            span.classList.toggle('completed', this.classList.contains('checked'));
            saveTodos(datePicker.value);
        });

        const editButton = todoItem.querySelector('.edit-button');
        const editInput = todoItem.querySelector('.edit-input');

        editButton.addEventListener('click', function () {
            const span = todoItem.querySelector('span');
            if (editInput.style.display === 'none') {
                editInput.value = span.textContent;
                editInput.style.display = 'inline-block';
                span.style.display = 'none';
                editButton.textContent = '완료';
            } else {
                const newText = editInput.value.trim();
                if (newText) {
                    span.textContent = newText;
                    editInput.style.display = 'none';
                    span.style.display = 'inline';
                    editButton.textContent = '수정';
                    saveTodos(datePicker.value);
                }
            }
        });

        editInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const newText = editInput.value.trim();
                if (newText) {
                    const span = todoItem.querySelector('span');
                    span.textContent = newText;
                    editInput.style.display = 'none';
                    span.style.display = 'inline';
                    const editButton = todoItem.querySelector('.edit-button');
                    editButton.textContent = '수정';
                    saveTodos(datePicker.value);
                }
            }
        });

        todoItem.querySelector('.delete-button').addEventListener('click', function () {
            todoList.removeChild(todoItem);
            saveTodos(datePicker.value);
            updateNoTodoMessage();
        });

        return todoItem;
    }

    function saveTodos(date) {
        const todos = Array.from(todoList.children)
            .filter(item => !item.id || item.id !== 'no-todo-message')
            .map(item => ({
                text: item.querySelector('span').textContent,
                completed: item.querySelector('.custom-checkbox').classList.contains('checked'),
            }));

        localStorage.setItem(`todos_${date}`, JSON.stringify(todos));
        refreshCalendar();
    }

    function loadTodos(date) {
        todoList.innerHTML = '';
        const todos = JSON.parse(localStorage.getItem(`todos_${date}`)) || [];
        if (todos.length === 0) {
            updateNoTodoMessage();
        } else {
            todos.forEach(todo => {
                const todoItem = createTodoElement(todo.text, todo.completed);
                todoList.appendChild(todoItem);
            });
            updateNoTodoMessage();
        }
    }

    function updateNoTodoMessage() {
        const noTodoMessageId = 'no-todo-message';
        let noTodoMessage = document.getElementById(noTodoMessageId);
        if (todoList.children.length === 0) {
            if (!noTodoMessage) {
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
        onChange: function (selectedDates, dateStr) {
            setSelectedDateTitle(dateStr);
            loadTodos(dateStr);
        },
        onDayCreate: function (dObj, dStr, fp, dayElem) {
            const date = dayElem.dateObj;
            const dateString = formatDate(date);
            const todos = JSON.parse(localStorage.getItem(`todos_${dateString}`)) || [];
            if (todos.length > 0) {
                const dot = document.createElement('span');
                dot.classList.add('event-dot');
                dayElem.appendChild(dot);
            }
        }
    });

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function refreshCalendar() {
        const fp = document.querySelector("#date-picker")._flatpickr;
        fp.redraw();
    }
});
