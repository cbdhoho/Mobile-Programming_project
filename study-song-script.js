document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audioPlayer');
    const currentSongTitle = document.getElementById('currentSongTitle');
    const musicList = document.getElementById('music-list').children;

    Array.from(musicList).forEach(item => {
        item.addEventListener('click', () => {
            const songSrc = item.getAttribute('data-src');
            const songTitle = item.textContent;

            if (!audioPlayer.paused) {
                audioPlayer.pause();
                audioPlayer.currentTime = 0;
            }

            audioPlayer.src = songSrc;
            audioPlayer.play().catch(error => {
                console.error(`Error playing the song: ${error.message}`);
            });

            currentSongTitle.textContent = `재생 중인 노래: ${songTitle}`;
        });
    });
});
