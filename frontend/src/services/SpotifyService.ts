// Spotify Connect API service (no Web Playback SDK)
class SpotifyService {
  private accessToken: string | null = null;
  private currentDevice: any = null;
  private pollInterval: NodeJS.Timeout | null = null;

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
    this.startPolling();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  // Start polling for playback state updates
  private startPolling() {
    if (this.pollInterval) return;
    
    this.pollInterval = setInterval(async () => {
      try {
        const state = await this.getCurrentlyPlaying();
        if (state) {
          // Emit event for UI updates
          window.dispatchEvent(new CustomEvent('spotify-playback-state', { detail: state }));
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 1000); // Poll every second
  }

  // Stop polling
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // Get available devices
  async getDevices() {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const response = await fetch(`${this.API_BASE}/player/devices?access_token=${encodeURIComponent(this.accessToken)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get devices:', error);
      throw error;
    }
  }

  // Get currently playing track
  async getCurrentlyPlaying() {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const response = await fetch(`${this.API_BASE}/player/currently-playing?access_token=${encodeURIComponent(this.accessToken)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get currently playing:', error);
      throw error;
    }
  }

  // Play/Resume
  async play(deviceId?: string, uris?: string[], contextUri?: string) {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const body: any = {};
      if (deviceId) body.device_id = deviceId;
      if (uris) body.uris = uris;
      if (contextUri) body.context_uri = contextUri;
      
      const response = await fetch(`${this.API_BASE}/player/play?access_token=${encodeURIComponent(this.accessToken)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to play: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to play:', error);
      throw error;
    }
  }

  // Pause
  async pause(deviceId?: string) {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const url = `${this.API_BASE}/player/pause?access_token=${encodeURIComponent(this.accessToken)}${deviceId ? `&device_id=${deviceId}` : ''}`;
      const response = await fetch(url, { method: 'POST' });
      
      if (!response.ok) {
        throw new Error(`Failed to pause: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to pause:', error);
      throw error;
    }
  }

  // Next track
  async next(deviceId?: string) {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const url = `${this.API_BASE}/player/next?access_token=${encodeURIComponent(this.accessToken)}${deviceId ? `&device_id=${deviceId}` : ''}`;
      const response = await fetch(url, { method: 'POST' });
      
      if (!response.ok) {
        throw new Error(`Failed to skip to next: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to skip to next:', error);
      throw error;
    }
  }

  // Previous track
  async previous(deviceId?: string) {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const url = `${this.API_BASE}/player/previous?access_token=${encodeURIComponent(this.accessToken)}${deviceId ? `&device_id=${deviceId}` : ''}`;
      const response = await fetch(url, { method: 'POST' });
      
      if (!response.ok) {
        throw new Error(`Failed to skip to previous: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to skip to previous:', error);
      throw error;
    }
  }

  // Set volume
  async setVolume(volumePercent: number, deviceId?: string) {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const body: any = { volume_percent: Math.max(0, Math.min(100, volumePercent)) };
      if (deviceId) body.device_id = deviceId;
      
      const response = await fetch(`${this.API_BASE}/player/volume?access_token=${encodeURIComponent(this.accessToken)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to set volume: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to set volume:', error);
      throw error;
    }
  }

  // Toggle shuffle
  async setShuffle(state: boolean, deviceId?: string) {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const body: any = { state };
      if (deviceId) body.device_id = deviceId;
      
      const response = await fetch(`${this.API_BASE}/player/shuffle?access_token=${encodeURIComponent(this.accessToken)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to set shuffle: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to set shuffle:', error);
      throw error;
    }
  }

  // Set repeat mode
  async setRepeat(state: 'off' | 'track' | 'context', deviceId?: string) {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const body: any = { state };
      if (deviceId) body.device_id = deviceId;
      
      const response = await fetch(`${this.API_BASE}/player/repeat?access_token=${encodeURIComponent(this.accessToken)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to set repeat: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to set repeat:', error);
      throw error;
    }
  }

  // Seek to position in track
  async seekToPosition(positionMs: number, deviceId?: string) {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const body: any = { position_ms: Math.max(0, positionMs) };
      if (deviceId) body.device_id = deviceId;
      
      const response = await fetch(`${this.API_BASE}/player/seek?access_token=${encodeURIComponent(this.accessToken)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to seek: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to seek:', error);
      throw error;
    }
  }

  // Get user's playlists
  async getUserPlaylists() {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const response = await fetch(`${this.API_BASE}/user/playlists?access_token=${encodeURIComponent(this.accessToken)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get playlists:', error);
      throw error;
    }
  }

  // Get playlist tracks
  async getPlaylistTracks(playlistId: string) {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    try {
      const response = await fetch(`${this.API_BASE}/playlist/${playlistId}/tracks?access_token=${encodeURIComponent(this.accessToken)}`);
      const data = await response.json();
      return data;
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
        `${this.API_BASE}/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}&access_token=${encodeURIComponent(this.accessToken)}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to search:', error);
      throw error;
    }
  }
}

export default new SpotifyService();