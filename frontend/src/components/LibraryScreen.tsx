import React, { useState } from 'react';
import PlaylistCard from './PlaylistCard';
import './LibraryScreen.css';

const LibraryScreen = () => {
  const [filter, setFilter] = useState<'all' | 'playlists' | 'artists' | 'albums'>('all');

  const libraryItems = [
    { title: 'Liked Songs', description: '234 songs', imageUrl: 'https://via.placeholder.com/150' },
    { title: 'My Playlist #1', description: 'Created by you • 45 songs', imageUrl: 'https://via.placeholder.com/150' },
    { title: 'Workout Mix', description: 'Created by you • 28 songs', imageUrl: 'https://via.placeholder.com/150' },
    { title: 'Chill Vibes', description: 'Created by you • 67 songs', imageUrl: 'https://via.placeholder.com/150' },
    { title: 'Road Trip', description: 'Created by you • 52 songs', imageUrl: 'https://via.placeholder.com/150' },
  ];

  const recentlyPlayed = [
    { title: 'Today\'s Top Hits', description: 'Spotify • Updated daily', imageUrl: 'https://via.placeholder.com/150' },
    { title: 'Discover Weekly', description: 'Spotify • Updated weekly', imageUrl: 'https://via.placeholder.com/150' },
    { title: 'Release Radar', description: 'Spotify • Updated weekly', imageUrl: 'https://via.placeholder.com/150' },
  ];

  return (
    <div className="library-screen">
      <div className="library-header">
        <h1>Your Library</h1>
        <div className="library-controls">
          <button className="create-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="library-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === 'playlists' ? 'active' : ''}`}
          onClick={() => setFilter('playlists')}
        >
          Playlists
        </button>
        <button 
          className={`filter-btn ${filter === 'artists' ? 'active' : ''}`}
          onClick={() => setFilter('artists')}
        >
          Artists
        </button>
        <button 
          className={`filter-btn ${filter === 'albums' ? 'active' : ''}`}
          onClick={() => setFilter('albums')}
        >
          Albums
        </button>
      </div>

      <section className="library-section">
        <h2>Recently Created</h2>
        <div className="playlist-grid">
          {libraryItems.map((item, index) => (
            <PlaylistCard key={index} {...item} />
          ))}
        </div>
      </section>

      <section className="library-section">
        <h2>Recently Played</h2>
        <div className="playlist-grid">
          {recentlyPlayed.map((item, index) => (
            <PlaylistCard key={index} {...item} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default LibraryScreen;