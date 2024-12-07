document.addEventListener('DOMContentLoaded', function () {
    const initButton = document.getElementById('initButton');
    initButton.addEventListener('click', function () {
        if (confirm("정말로 모든 데이터를 초기화하시겠습니까?")) {
            localStorage.clear();
            location.reload();
        }
    });

    let userName = localStorage.getItem('userName');
    if (!userName) {
        userName = prompt("이름을 입력해주세요:");
        if (userName) localStorage.setItem('userName', userName);
    }

    const headerTitle = document.getElementById('headerTitle');
    if (userName) headerTitle.textContent = `${userName}'s Study Timer`;

    const nameChangeButton = document.getElementById('nameChange');
    nameChangeButton.addEventListener('click', function () {
        const newUserName = prompt("변경할 이름을 입력하세요:");
        if (newUserName && newUserName.trim() !== "") {
            localStorage.setItem('userName', newUserName);
            headerTitle.textContent = `${newUserName}'s Study Timer`;
        } else {
            alert("유효한 이름을 입력해주세요!");
        }
    });

    headerTitle.addEventListener('click', function () {
        window.location.href = 'main-page.html';
    });
});
