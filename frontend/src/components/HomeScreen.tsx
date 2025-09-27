import React from 'react';
import PlaylistCard from './PlaylistCard';
import './HomeScreen.css';

const HomeScreen = () => {
  const autoMixes = [
    { title: 'Rainy Coding', description: 'Low-tempo electronic', imageUrl: '' },
    { title: 'Upbeat Morning', description: 'Energetic pop and rock', imageUrl: '' },
    { title: 'Late Night Focus', description: 'Ambient and instrumental', imageUrl: '' },
  ];

  const spotifyPlaylists = [
    { title: 'Liked Songs', description: 'Your favorite tracks', imageUrl: '' },
    { title: 'Discover Weekly', description: 'New music for you', imageUrl: '' },
    { title: 'Chill Hits', description: 'Relax and unwind', imageUrl: '' },
  ];

  return (
    <div className="home-screen">
      <section>
        <h2>AutoMixes</h2>
        <div className="playlist-grid">
          {autoMixes.map((playlist, index) => (
            <PlaylistCard key={index} {...playlist} />
          ))}
        </div>
      </section>
      <section>
        <h2>Your Spotify Playlists</h2>
        <div className="playlist-grid">
          {spotifyPlaylists.map((playlist, index) => (
            <PlaylistCard key={index} {...playlist} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;
