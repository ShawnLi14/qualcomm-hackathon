import React from 'react';
import './PlaylistCard.css';

interface PlaylistCardProps {
  title: string;
  description: string;
  imageUrl?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ title, description, imageUrl, onClick, isLoading = false }) => {
  return (
    <div className={`playlist-card ${isLoading ? 'loading' : ''}`} onClick={onClick}>
      <div className="playlist-image">
        {imageUrl ? (
          <img src={imageUrl} alt={title} />
        ) : (
          <div className="placeholder-image">
            <span>🎵</span>
          </div>
        )}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner">▶</div>
          </div>
        )}
      </div>
      <div className="playlist-info">
        <h3>{title}</h3>
        <p>{isLoading ? 'Starting playback...' : description}</p>
      </div>
    </div>
  );
};

export default PlaylistCard;
