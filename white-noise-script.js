document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audioPlayer');
    const currentSongTitle = document.getElementById('currentSongTitle');
    const musicList = document.getElementById('music-list').children;

    // Set up click events for music list items
    Array.from(musicList).forEach(item => {
        item.addEventListener('click', () => {
            const songSrc = item.getAttribute('data-src');
            const songTitle = item.textContent;

            audioPlayer.src = songSrc;
            audioPlayer.play();

            currentSongTitle.textContent = `재생 중인 노래: ${songTitle}`;
        });
    });
});
