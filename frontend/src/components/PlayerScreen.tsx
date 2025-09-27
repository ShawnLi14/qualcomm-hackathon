import React, { useState } from 'react';
import './PlayerScreen.css';

const PlayerScreen = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: repeat all, 2: repeat one

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    // TODO: Connect to previous song logic
  };

  const handleNext = () => {
    // TODO: Connect to next song logic
  };

  const handleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const handleRepeat = () => {
    setRepeatMode((prev) => (prev + 1) % 3);
  };

  return (
    <div className="player-screen">
      <div className="now-playing">
        <div className="track-info">
          <div className="album-cover placeholder-cover">
            <span>🎵</span>
          </div>
          <div className="track-details">
            <h4>No track selected</h4>
            <p>Connect your Spotify</p>
          </div>
        </div>
      </div>
      
      <div className="player-controls">
        <div className="control-buttons">
          <button 
            className={`control-btn ${isShuffled ? 'active' : ''}`}
            onClick={handleShuffle}
            title="Shuffle"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356A2.25 2.25 0 0 1 11.16 4.5h1.95l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"/>
              <path d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.95l-1.017-1.018a.75.75 0 1 1 1.06-1.06L15.98 12.25l-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z"/>
            </svg>
          </button>
          <button 
            className="control-btn"
            onClick={handlePrevious}
            title="Previous"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.588a.7.7 0 0 1-1.05.606L4 8.149V13.3a.7.7 0 0 1-1.4 0V1.7a.7.7 0 0 1 .7-.7z"/>
            </svg>
          </button>
          <button 
            className="control-btn play-pause-btn"
            onClick={handlePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.287V1.713z"/>
              </svg>
            )}
          </button>
          <button 
            className="control-btn"
            onClick={handleNext}
            title="Next"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.588a.7.7 0 0 0 1.05.606L12 8.149V13.3a.7.7 0 0 0 1.4 0V1.7a.7.7 0 0 0-.7-.7z"/>
            </svg>
          </button>
          <button 
            className={`control-btn ${repeatMode > 0 ? 'active' : ''}`}
            onClick={handleRepeat}
            title={`Repeat ${repeatMode === 0 ? 'off' : repeatMode === 1 ? 'all' : 'one'}`}
          >
            {repeatMode === 2 ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"/>
                <circle cx="8" cy="8" r="1" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"/>
              </svg>
            )}
          </button>
        </div>
        <div className="progress-bar">
          <span className="time">0:00</span>
          <div className="progress">
            <div className="progress-track"></div>
            <div className="progress-fill" style={{width: '30%'}}></div>
            <div className="progress-handle"></div>
          </div>
          <span className="time">3:45</span>
        </div>
      </div>
      
      <div className="chat-container">
        <input type="text" placeholder="Talk to the DJ..." className="chat-input" />
      </div>
    </div>
  );
};

export default PlayerScreen;
