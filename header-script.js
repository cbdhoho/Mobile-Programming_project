document.addEventListener('DOMContentLoaded', function () {
    // 초기화 버튼 클릭 시 로컬스토리지 데이터 삭제
    const initButton = document.getElementById('initButton');
    initButton.addEventListener('click', function () {
        if (confirm("정말로 모든 데이터를 초기화하시겠습니까?")) {
            localStorage.clear();  // 로컬 스토리지의 모든 데이터 삭제
            location.reload();  // 페이지 리로드하여 초기화된 상태로 되돌림
        }
    });

    let userName = localStorage.getItem('userName');

    // 이름이 없으면 이름을 물어보고 저장
    if (!userName) {
        userName = prompt("이름을 입력해주세요:"); // Ask for the user's name if not stored
        if (userName) {
            localStorage.setItem('userName', userName); // Save name to localStorage
        }
    }

    // Update the header title with the user's name
    const headerTitle = document.getElementById('headerTitle');
    if (userName) {
        headerTitle.textContent = `${userName}'s Study Timer`;
    }

    // Show a prompt to change the name when "이름 변경" is clicked
    const nameChangeButton = document.getElementById('nameChange');
    nameChangeButton.addEventListener('click', function () {
        // Prompt the user to enter a new name
        const newUserName = prompt("변경할 이름을 입력하세요:");

        if (newUserName && newUserName.trim() !== "") {
            // Update the user's name in localStorage and the header
            localStorage.setItem('userName', newUserName);
            headerTitle.textContent = `${newUserName}'s Study Timer`;
        } else {
            alert("유효한 이름을 입력해주세요!");
        }
    });

    // headerTitle 클릭 시 main-page.html로 이동하도록 설정
    headerTitle.addEventListener('click', function () {
        window.location.href = 'main-page.html';
    });
});
