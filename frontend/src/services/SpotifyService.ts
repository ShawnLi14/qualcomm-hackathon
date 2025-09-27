// Spotify Web API and Player service
class SpotifyService {
  private accessToken: string | null = null;
  private player: any = null;
  private deviceId: string | null = null;
  private isInitialized = false;

  // Backend API base URL
  private readonly API_BASE = 'http://127.0.0.1:8000';

  // Get Spotify login URL from backend
  async getLoginUrl(): Promise<string> {
    try {
      const response = await fetch(`${this.API_BASE}/auth/spotify/login`);
      const data = await response.json();
      return data.auth_url;
    } catch (error) {
      console.error('Failed to get login URL:', error);
      throw error;
    }
  }

  // Set access token (called after OAuth flow)
  setAccessToken(token: string) {
    this.accessToken = token;
    this.initializePlayer();
  }

  // Initialize Spotify Web Playback SDK
  private async initializePlayer() {
    if (!this.accessToken || this.isInitialized) return;

    return new Promise<void>((resolve) => {
      // Wait for Spotify SDK to be ready
      const checkForSDK = () => {
        if (window.Spotify) {
          this.createPlayer();
          resolve();
        } else {
          setTimeout(checkForSDK, 100);
        }
      };
      checkForSDK();
    });
  }

  private createPlayer() {
    this.player = new window.Spotify.Player({
      name: 'DJ Assistant',
      getOAuthToken: (cb: (token: string) => void) => {
        if (this.accessToken) {
          cb(this.accessToken);
        }
      },
      volume: 0.5
    });

    // Error handling
    this.player.addListener('initialization_error', ({ message }: any) => {
      console.error('Spotify Player Initialization Error:', message);
      if (message.includes('EME')) {
        console.warn('DRM/EME Error - This may be due to Electron\'s DRM configuration. Web Playback SDK may not work fully.');
      }
      // Emit error event for UI to handle
      window.dispatchEvent(new CustomEvent('spotify-player-error', { 
        detail: { type: 'initialization', message } 
      }));
    });

    this.player.addListener('authentication_error', ({ message }: any) => {
      console.error('Spotify Player Authentication Error:', message);
      if (message.includes('Invalid token scopes') || message.includes('Premium required')) {
        console.warn('Spotify Premium account required for Web Playback SDK');
        // Emit premium required event
        window.dispatchEvent(new CustomEvent('spotify-premium-required', { 
          detail: { message: 'Spotify Premium account required for music playback' } 
        }));
      }
      window.dispatchEvent(new CustomEvent('spotify-player-error', { 
        detail: { type: 'authentication', message } 
      }));
    });

    this.player.addListener('account_error', ({ message }: any) => {
      console.error('Spotify Player Account Error:', message);
      if (message.includes('Premium required') || message.includes('premium')) {
        console.warn('Spotify Premium account required for Web Playback SDK');
        window.dispatchEvent(new CustomEvent('spotify-premium-required', { 
          detail: { message: 'Spotify Premium account required for music playback' } 
        }));
      }
      window.dispatchEvent(new CustomEvent('spotify-player-error', { 
        detail: { type: 'account', message } 
      }));
    });

    // Ready
    this.player.addListener('ready', ({ device_id }: any) => {
      console.log('Ready with Device ID', device_id);
      this.deviceId = device_id;
      this.isInitialized = true;
    });

    // Not Ready
    this.player.addListener('not_ready', ({ device_id }: any) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Player state changes
    this.player.addListener('player_state_changed', (state: any) => {
      if (!state) return;
      
      console.log('Player state changed:', state);
      // Emit events for UI updates
      window.dispatchEvent(new CustomEvent('spotify-player-state', { detail: state }));
    });

    // Connect to the player
    this.player.connect();
  }

  // Get user's playlists
  async getUserPlaylists() {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const response = await fetch(
        `${this.API_BASE}/user/playlists?access_token=${this.accessToken}`
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to get playlists:', error);
      throw error;
    }
  }

  // Get tracks from a playlist
  async getPlaylistTracks(playlistId: string) {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const response = await fetch(
        `${this.API_BASE}/playlist/${playlistId}/tracks?access_token=${this.accessToken}`
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to get playlist tracks:', error);
      throw error;
    }
  }

  // Search for tracks, albums, artists, playlists
  async search(query: string, type: string = 'track,artist,album,playlist', limit: number = 20) {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const response = await fetch(
        `${this.API_BASE}/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}&access_token=${this.accessToken}`
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to search:', error);
      throw error;
    }
  }

  // Play a track or playlist
  async play(uris?: string[], contextUri?: string) {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const body: any = {};
      if (uris) body.uris = uris;
      if (contextUri) body.context_uri = contextUri;
      
      const response = await fetch(
        `${this.API_BASE}/player/play?access_token=${this.accessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to play:', error);
      throw error;
    }
  }

  // Pause playback
  async pause() {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const response = await fetch(
        `${this.API_BASE}/player/pause?access_token=${this.accessToken}`,
        { method: 'POST' }
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to pause:', error);
      throw error;
    }
  }

  // Resume playback
  async resume() {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const response = await fetch(
        `${this.API_BASE}/player/resume?access_token=${this.accessToken}`,
        { method: 'POST' }
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to resume:', error);
      throw error;
    }
  }

  // Next track
  async next() {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const response = await fetch(
        `${this.API_BASE}/player/next?access_token=${this.accessToken}`,
        { method: 'POST' }
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to skip to next:', error);
      throw error;
    }
  }

  // Previous track
  async previous() {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const response = await fetch(
        `${this.API_BASE}/player/previous?access_token=${this.accessToken}`,
        { method: 'POST' }
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to skip to previous:', error);
      throw error;
    }
  }

  // Get current playback state
  async getCurrentPlayback() {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const response = await fetch(
        `${this.API_BASE}/player/current?access_token=${this.accessToken}`
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to get current playback:', error);
      throw error;
    }
  }

  // Set volume (0.0 to 1.0)
  async setVolume(volume: number) {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const response = await fetch(
        `${this.API_BASE}/player/volume?volume=${Math.floor(volume * 100)}&access_token=${this.accessToken}`,
        { method: 'POST' }
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to set volume:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Check if player is ready
  isPlayerReady(): boolean {
    return this.isInitialized && !!this.deviceId;
  }

  // Get device ID
  getDeviceId(): string | null {
    return this.deviceId;
  }

  // Get access token
  getAccessToken(): string | null {
    return this.accessToken;
  }
}

// Create singleton instance
const spotifyService = new SpotifyService();
export default spotifyService;

// Type declarations for Spotify Web Playback SDK
declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

// Basic type interfaces for Spotify data
export interface SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  album: {
    name: string;
    images: { url: string }[];
  };
  artists: { name: string }[];
  duration_ms: number;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: {
    total: number;
  };
}

export interface PlayerState {
  context: {
    uri: string;
    metadata: any;
  };
  disallows: {
    pausing: boolean;
    skipping_next: boolean;
    skipping_prev: boolean;
  };
  paused: boolean;
  position: number;
  repeat_mode: number;
  shuffle: boolean;
  track_window: {
    current_track: SpotifyTrack;
    previous_tracks: SpotifyTrack[];
    next_tracks: SpotifyTrack[];
  };
}