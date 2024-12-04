document.addEventListener('DOMContentLoaded', function () {
    // 초기화 버튼 클릭 시 로컬스토리지 데이터 삭제
    initButton.addEventListener('click', function () {
        if (confirm("정말로 모든 데이터를 초기화하시겠습니까?")) {
            localStorage.clear();  // 로컬 스토리지의 모든 데이터 삭제
            location.reload();  // 페이지 리로드하여 초기화된 상태로 되돌림
        }
    });

    let userName = localStorage.getItem('userName');

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
});
