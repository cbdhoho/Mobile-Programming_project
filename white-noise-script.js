document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audioPlayer');
    const currentSongTitle = document.getElementById('currentSongTitle');
    const musicList = document.getElementById('music-list').children;

    Array.from(musicList).forEach(item => {
        item.addEventListener('click', () => {
            const songSrc = item.getAttribute('data-src');
            const songTitle = item.textContent;
            
            // 현재 재생 중인 노래를 정지
            if (!audioPlayer.paused) {
                audioPlayer.pause();
                audioPlayer.currentTime = 0; // 재생 위치 초기화                
            }

            // 새로운 노래 로드 및 재생
            audioPlayer.src = songSrc;
            audioPlayer.play().catch(error => {
                console.error(`Error playing the song: ${error.message}`);
            });

            // 현재 재생 중인 노래 제목 업데이트
            currentSongTitle.textContent = `재생 중인 노래: ${songTitle}`;
        });
    });
    
});
