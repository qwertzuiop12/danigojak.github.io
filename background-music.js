
// background-music.js
document.addEventListener('DOMContentLoaded', function() {
    // Extract video ID from your YouTube link
    const videoId = 'MzFYzXKWwik';
    
    // Create music player container
    const musicContainer = document.createElement('div');
    musicContainer.id = 'background-music-container';
    musicContainer.style.position = 'fixed';
    musicContainer.style.bottom = '20px';
    musicContainer.style.right = '20px';
    musicContainer.style.zIndex = '1000';
    musicContainer.style.display = 'flex';
    musicContainer.style.gap = '10px';
    musicContainer.style.alignItems = 'center';
    
    // Create YouTube iframe (hidden)
    const iframe = document.createElement('iframe');
    iframe.id = 'background-music-player';
    iframe.width = '0';
    iframe.height = '0';
    iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&loop=1&playlist=${videoId}`;
    iframe.frameBorder = '0';
    iframe.allow = 'autoplay; encrypted-media';
    iframe.allowFullscreen = '';
    iframe.style.border = 'none';
    
    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.innerHTML = '🔊 Background Music';
    toggleBtn.style.background = 'rgba(0,0,0,0.7)';
    toggleBtn.style.color = 'white';
    toggleBtn.style.border = 'none';
    toggleBtn.style.borderRadius = '20px';
    toggleBtn.style.padding = '8px 16px';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.fontSize = '14px';
    toggleBtn.style.fontFamily = 'Arial, sans-serif';
    
    // Add elements to container
    musicContainer.appendChild(iframe);
    musicContainer.appendChild(toggleBtn);
    document.body.appendChild(musicContainer);
    
    // Toggle functionality
    let isPlaying = false;
    
    // Wait for YouTube API to be ready
    window.onYouTubeIframeAPIReady = function() {
        const player = new YT.Player('background-music-player', {
            events: {
                'onReady': function(event) {
                    // Start muted due to autoplay restrictions
                    event.target.mute();
                    event.target.playVideo();
                    isPlaying = true;
                }
            }
        });
    };
    
    // Load YouTube API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    toggleBtn.addEventListener('click', function() {
        const player = document.getElementById('background-music-player');
        if (isPlaying) {
            player.contentWindow.postMessage(
                '{"event":"command","func":"pauseVideo","args":""}',
                '*'
            );
           
