import React, { useState, useEffect } from 'react';
import PlaylistCard from './PlaylistCard';
import spotifyService from '../services/SpotifyService';
import './HomeScreen.css';

interface Playlist {
  id: string;
  name: string;
  description: string;
  image: string | null;
  tracks_total: number;
  owner: string;
}

const HomeScreen = () => {
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [playingPlaylistId, setPlayingPlaylistId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user is authenticated
        if (!spotifyService.isAuthenticated()) {
          setError('Please log in to view your playlists');
          setLoading(false);
          return;
        }

        const response = await spotifyService.getUserPlaylists();
        setSpotifyPlaylists(response.playlists || []);
        
        // Also fetch available devices
        try {
          const devicesResponse = await spotifyService.getDevices();
          setDevices(devicesResponse.devices || []);
        } catch (deviceError) {
          console.warn('Could not fetch devices:', deviceError);
        }
      } catch (error) {
        console.error('Failed to fetch playlists:', error);
        setError('Failed to load playlists. Please try logging in again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
    
    // Listen for authentication changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'spotify_access_token') {
        fetchPlaylists();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handlePlaylistClick = async (playlistId: string, playlistName: string) => {
    try {
      setPlayingPlaylistId(playlistId);
      
      // Refresh devices in case they've changed
      try {
        const devicesResponse = await spotifyService.getDevices();
        setDevices(devicesResponse.devices || []);
      } catch (deviceError) {
        console.warn('Could not refresh devices:', deviceError);
      }
      
      // Find an active device or use the first available device
      let targetDevice = devices.find(device => device.is_active);
      if (!targetDevice && devices.length > 0) {
        targetDevice = devices[0];
      }
      
      if (!targetDevice) {
        // If no devices available, show helpful error
        setError('No Spotify devices found. Please open Spotify on your phone, computer, or other device first.');
        setPlayingPlaylistId(null);
        return;
      }
      
      // Play the playlist using its URI
      const playlistUri = `spotify:playlist:${playlistId}`;
      await spotifyService.play(targetDevice.id, undefined, playlistUri);
      
      console.log(`Playing playlist "${playlistName}" on device "${targetDevice.name}"`);
      
      // Clear any existing errors
      setError(null);
      
    } catch (error) {
      console.error('Failed to play playlist:', error);
      setError(`Failed to play playlist. Make sure Spotify is open on one of your devices.`);
    } finally {
      // Clear playing state after a short delay
      setTimeout(() => setPlayingPlaylistId(null), 2000);
    }
  };

  const autoMixes = [
    { title: 'Rainy Coding', description: 'Low-tempo electronic', imageUrl: '' },
    { title: 'Upbeat Morning', description: 'Energetic pop and rock', imageUrl: '' },
    { title: 'Late Night Focus', description: 'Ambient and instrumental', imageUrl: '' },
  ];

  // Remove the hardcoded playlists array since we're fetching real data now

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
        {loading ? (
          <div className="loading-message">Loading playlists...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : spotifyPlaylists.length > 0 ? (
          <div className="playlist-grid">
            {spotifyPlaylists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                title={playlist.name}
                description={playlist.description || `${playlist.tracks_total} tracks • by ${playlist.owner}`}
                imageUrl={playlist.image || undefined}
                onClick={() => handlePlaylistClick(playlist.id, playlist.name)}
                isLoading={playingPlaylistId === playlist.id}
              />
            ))}
          </div>
        ) : (
          <div className="empty-message">No playlists found. Create some playlists in Spotify!</div>
        )}
      </section>
    </div>
  );
};

export default HomeScreen;
