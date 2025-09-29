import React, { useState, useEffect } from 'react';
import spotifyService from '../services';
import './PlayerScreen.css';

interface PlaybackState {
  is_playing: boolean;
  progress_ms: number;
  device: any;
  item: {
    id: string;
    name: string;
    artists: string[];
    album: string;
    duration_ms: number;
    uri: string;
    image: string;
  } | null;
}

const PlayerScreen = () => {
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'track' | 'context'>('off');

  useEffect(() => {
    // Listen for playback state updates
    const handlePlaybackState = (event: CustomEvent) => {
      setPlaybackState(event.detail);
    };

    window.addEventListener('spotify-playback-state', handlePlaybackState as EventListener);

    // Load initial devices
    loadDevices();

    return () => {
      window.removeEventListener('spotify-playback-state', handlePlaybackState as EventListener);
    };
  }, []);

  const loadDevices = async () => {
    try {
      const devicesData = await spotifyService.getDevices();
      setDevices(devicesData.devices || []);
      
      // Auto-select the first active device
      const activeDevice = devicesData.devices?.find((device: any) => device.is_active);
      if (activeDevice) {
        setSelectedDevice(activeDevice.id);
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (playbackState?.is_playing) {
        await spotifyService.pause(selectedDevice);
      } else {
        await spotifyService.play(selectedDevice);
      }
    } catch (error) {
      console.error('Failed to play/pause:', error);
    }
  };

  const handlePrevious = async () => {
    try {
      await spotifyService.previous(selectedDevice);
    } catch (error) {
      console.error('Failed to skip to previous:', error);
    }
  };

  const handleNext = async () => {
    try {
      await spotifyService.next(selectedDevice);
    } catch (error) {
      console.error('Failed to skip to next:', error);
    }
  };

  const handleShuffle = async () => {
    try {
      const newShuffleState = !isShuffled;
      await spotifyService.setShuffle(newShuffleState, selectedDevice);
      setIsShuffled(newShuffleState);
    } catch (error) {
      console.error('Failed to toggle shuffle:', error);
    }
  };

  const handleRepeat = async () => {
    try {
      const modes: ('off' | 'track' | 'context')[] = ['off', 'context', 'track'];
      const currentIndex = modes.indexOf(repeatMode);
      const newMode = modes[(currentIndex + 1) % modes.length];
      
      await spotifyService.setRepeat(newMode, selectedDevice);
      setRepeatMode(newMode);
    } catch (error) {
      console.error('Failed to set repeat mode:', error);
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = async (event: React.MouseEvent<HTMLDivElement>) => {
    if (!currentTrack || !selectedDevice) return;
    
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newPosition = Math.floor(percentage * currentTrack.duration_ms);
    
    try {
      await spotifyService.seekToPosition(newPosition, selectedDevice);
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  };

  const currentTrack = playbackState?.item;
  const progressPercent = currentTrack 
    ? (playbackState.progress_ms / currentTrack.duration_ms) * 100 
    : 0;

  return (
    <div className="player-screen">
      <div className="now-playing">
        <div className="track-info">
          {currentTrack?.image ? (
            <img src={currentTrack.image} alt="Album cover" className="album-cover" />
          ) : (
            <div className="album-cover placeholder-cover">
              <span>🎵</span>
            </div>
          )}
          <div className="track-details">
            <h4>{currentTrack?.name || 'No track selected'}</h4>
            <p>{currentTrack?.artists?.join(', ') || 'Connect your Spotify'}</p>
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
            title={playbackState?.is_playing ? 'Pause' : 'Play'}
          >
            {playbackState?.is_playing ? (
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
            className={`control-btn ${repeatMode !== 'off' ? 'active' : ''}`}
            onClick={handleRepeat}
            title={`Repeat ${repeatMode === 'off' ? 'off' : repeatMode === 'context' ? 'all' : 'one'}`}
          >
            {repeatMode === 'track' ? (
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
          <span className="time">
            {playbackState?.progress_ms ? formatTime(playbackState.progress_ms) : '0:00'}
          </span>
          <div className="progress" onClick={handleProgressClick}>
            <div 
              className="progress-fill" 
              style={{width: `${progressPercent}%`}}
            >
              <div className="progress-handle"></div>
            </div>
          </div>
          <span className="time">
            {currentTrack?.duration_ms ? formatTime(currentTrack.duration_ms) : '0:00'}
          </span>
        </div>
      </div>
      
      <div className="chat-container">
        {devices.length > 0 && (
          <div className="device-selector">
            <span>Device:</span>
            <select 
              value={selectedDevice || ''} 
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="device-select"
            >
              <option value="">Select Device</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name} {device.is_active ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
        <input type="text" placeholder="Talk to the DJ..." className="chat-input" />
      </div>
    </div>
  );
};

export default PlayerScreen;
