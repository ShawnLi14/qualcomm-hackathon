import React from 'react';
import './PlaylistCard.css';

interface PlaylistCardProps {
  title: string;
  description: string;
  imageUrl: string;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ title, description, imageUrl }) => {
  return (
    <div className="playlist-card">
      <div className="playlist-image placeholder-image">
        <span>🎵</span>
      </div>
      <div className="playlist-info">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default PlaylistCard;
