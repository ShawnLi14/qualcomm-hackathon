import os
import secrets
import urllib.parse
from typing import Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

app = FastAPI(title="Vibify Backend")

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Spotify configuration
SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
SPOTIFY_REDIRECT_URI = os.getenv('SPOTIFY_REDIRECT_URI', 'http://localhost:8000/callback')

# Required scopes for full functionality
SPOTIFY_SCOPES = [
    'user-read-playback-state',     # Current playback info
    'user-modify-playback-state',   # Control playback
    'user-read-currently-playing',  # Now playing info
    'playlist-read-private',        # User playlists
    'playlist-read-collaborative',  # Collaborative playlists
    'user-library-read',           # Liked songs
    'user-read-recently-played',    # Recently played
    'user-read-private',           # User profile
]

# Store for temporary state and tokens (in production, use proper storage)
auth_states = {}
user_tokens = {}

@app.get("/")
def read_root():
    return {"message": "Vibify Backend", "status": "running"}

@app.get("/auth/spotify/login")
def spotify_login():
    """Generate Spotify authorization URL"""
    if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Spotify credentials not configured")
    
    # Generate random state for security
    state = secrets.token_urlsafe(32)
    auth_states[state] = True
    
    # Create Spotify OAuth object
    sp_oauth = SpotifyOAuth(
        client_id=SPOTIFY_CLIENT_ID,
        client_secret=SPOTIFY_CLIENT_SECRET,
        redirect_uri=SPOTIFY_REDIRECT_URI,
        scope=' '.join(SPOTIFY_SCOPES),
        state=state
    )
    
    auth_url = sp_oauth.get_authorize_url()
    
    return {
        "auth_url": auth_url,
        "state": state
    }

@app.get("/callback")
def spotify_callback(code: str, state: str, error: Optional[str] = None):
    """Handle Spotify OAuth callback"""
    if error:
        return HTMLResponse(f"""
        <html>
            <body>
                <h1>Authentication Failed</h1>
                <p>Error: {error}</p>
                <script>
                    if (window.opener) {{
                        window.opener.postMessage({{
                            type: 'spotify_auth_error',
                            error: '{error}'
                        }}, '*');
                    }}
                    window.close();
                </script>
            </body>
        </html>
        """)
    
    if state not in auth_states:
        return HTMLResponse("""
        <html>
            <body>
                <h1>Authentication Failed</h1>
                <p>Invalid state parameter</p>
                <script>
                    if (window.opener) {
                        window.opener.postMessage({
                            type: 'spotify_auth_error',
                            error: 'Invalid state parameter'
                        }, '*');
                    }
                    window.close();
                </script>
            </body>
        </html>
        """)
    
    # Remove used state
    del auth_states[state]
    
    try:
        # Exchange code for tokens
        sp_oauth = SpotifyOAuth(
            client_id=SPOTIFY_CLIENT_ID,
            client_secret=SPOTIFY_CLIENT_SECRET,
            redirect_uri=SPOTIFY_REDIRECT_URI,
            scope=' '.join(SPOTIFY_SCOPES)
        )
        
        token_info = sp_oauth.get_access_token(code)
        
        if not token_info:
            return HTMLResponse("""
            <html>
                <body>
                    <h1>Authentication Failed</h1>
                    <p>Failed to get access token</p>
                    <script>
                        if (window.opener) {
                            window.opener.postMessage({
                                type: 'spotify_auth_error',
                                error: 'Failed to get access token'
                            }, '*');
                        }
                        window.close();
                    </script>
                </body>
            </html>
            """)
        
        # Get user info
        sp = spotipy.Spotify(auth=token_info['access_token'])
        user_info = sp.current_user()
        
        # Store token info (in production, use proper storage with user ID)
        user_id = user_info['id']
        user_tokens[user_id] = token_info
        
        # Return success page that passes token to parent window
        return HTMLResponse(f"""
        <html>
            <body>
                <h1>Authentication Successful!</h1>
                <p>Welcome {user_info.get('display_name', user_id)}! You can close this window.</p>
                <script>
                    if (window.opener) {{
                        window.opener.postMessage({{
                            type: 'spotify_auth_success',
                            access_token: '{token_info["access_token"]}',
                            user_id: '{user_id}'
                        }}, '*');
                    }}
                    setTimeout(() => window.close(), 1000);
                </script>
            </body>
        </html>
        """)
        
    except Exception as e:
        return HTMLResponse(f"""
        <html>
            <body>
                <h1>Authentication Failed</h1>
                <p>Error: {str(e)}</p>
                <script>
                    if (window.opener) {{
                        window.opener.postMessage({{
                            type: 'spotify_auth_error',
                            error: '{str(e)}'
                        }}, '*');
                    }}
                    window.close();
                </script>
            </body>
        </html>
        """)

@app.get("/user/playlists")
def get_user_playlists(access_token: str):
    """Get user's playlists"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        playlists = sp.current_user_playlists(limit=50)
        
        formatted_playlists = []
        for playlist in playlists['items']:
            formatted_playlists.append({
                'id': playlist['id'],
                'name': playlist['name'],
                'description': playlist.get('description', ''),
                'image': playlist['images'][0]['url'] if playlist['images'] else None,
                'tracks_total': playlist['tracks']['total'],
                'owner': playlist['owner']['display_name']
            })
        
        return {"playlists": formatted_playlists}
        
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Failed to get playlists: {str(e)}")

# Spotify Connect API endpoints

@app.get("/player/devices")
def get_devices(access_token: str):
    """Get user's available devices"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        devices = sp.devices()
        return devices
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get devices: {str(e)}")

@app.get("/player/currently-playing")
def get_currently_playing(access_token: str):
    """Get currently playing track"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        current = sp.currently_playing()
        
        if not current or not current.get('item'):
            return {"is_playing": False, "item": None}
        
        track = current['item']
        return {
            "is_playing": current['is_playing'],
            "progress_ms": current.get('progress_ms', 0),
            "device": current.get('device', {}),
            "item": {
                "id": track['id'],
                "name": track['name'],
                "artists": [artist['name'] for artist in track['artists']],
                "album": track['album']['name'],
                "duration_ms": track['duration_ms'],
                "uri": track['uri'],
                "image": track['album']['images'][0]['url'] if track['album']['images'] else None
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get currently playing: {str(e)}")

@app.post("/player/play")
def start_playback(request: dict, access_token: str):
    """Start/resume playback"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        device_id = request.get('device_id')
        uris = request.get('uris', [])
        context_uri = request.get('context_uri')
        
        if uris:
            sp.start_playback(device_id=device_id, uris=uris)
        elif context_uri:
            sp.start_playback(device_id=device_id, context_uri=context_uri)
        else:
            sp.start_playback(device_id=device_id)
            
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to start playback: {str(e)}")

@app.post("/player/pause")
def pause_playback(access_token: str, device_id: str = None):
    """Pause playback"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        sp.pause_playback(device_id=device_id)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to pause playback: {str(e)}")

@app.post("/player/next")
def next_track(access_token: str, device_id: str = None):
    """Skip to next track"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        sp.next_track(device_id=device_id)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to skip to next track: {str(e)}")

@app.post("/player/previous")
def previous_track(access_token: str, device_id: str = None):
    """Skip to previous track"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        sp.previous_track(device_id=device_id)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to skip to previous track: {str(e)}")

@app.post("/player/volume")
def set_volume(request: dict, access_token: str):
    """Set playback volume"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        volume_percent = request.get('volume_percent', 50)
        device_id = request.get('device_id')
        sp.volume(volume_percent, device_id=device_id)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to set volume: {str(e)}")

@app.post("/player/shuffle")
def set_shuffle(request: dict, access_token: str):
    """Toggle shuffle mode"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        state = request.get('state', True)
        device_id = request.get('device_id')
        sp.shuffle(state, device_id=device_id)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to set shuffle: {str(e)}")

@app.post("/player/repeat")
def set_repeat(request: dict, access_token: str):
    """Set repeat mode"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        state = request.get('state', 'off')  # 'off', 'track', 'context'
        device_id = request.get('device_id')
        sp.repeat(state, device_id=device_id)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to set repeat: {str(e)}")

@app.post("/player/seek")
def seek_to_position(request: dict, access_token: str):
    """Seek to position in currently playing track"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        position_ms = request.get('position_ms', 0)
        device_id = request.get('device_id')
        sp.seek_track(position_ms, device_id=device_id)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to seek: {str(e)}")

@app.get("/playlist/{playlist_id}/tracks")
def get_playlist_tracks(playlist_id: str, access_token: str):
    """Get tracks from a specific playlist"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        results = sp.playlist_tracks(playlist_id, limit=50)
        
        tracks = []
        for item in results['items']:
            if item['track']:
                track = item['track']
                tracks.append({
                    'id': track['id'],
                    'name': track['name'],
                    'artists': [artist['name'] for artist in track['artists']],
                    'album': track['album']['name'],
                    'duration_ms': track['duration_ms'],
                    'uri': track['uri'],
                    'image': track['album']['images'][0]['url'] if track['album']['images'] else None
                })
        
        return {"tracks": tracks}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get playlist tracks: {str(e)}")

@app.get("/playlist/{playlist_id}/tracks")
def get_playlist_tracks(playlist_id: str, access_token: str):
    """Get tracks from a specific playlist"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        results = sp.playlist_tracks(playlist_id, limit=50)
        
        tracks = []
        for item in results['items']:
            if item['track']:
                track = item['track']
                tracks.append({
                    'id': track['id'],
                    'name': track['name'],
                    'artist': ', '.join([artist['name'] for artist in track['artists']]),
                    'album': track['album']['name'],
                    'duration_ms': track['duration_ms'],
                    'uri': track['uri'],
                    'image': track['album']['images'][0]['url'] if track['album']['images'] else None
                })
        
        return {"tracks": tracks}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get playlist tracks: {str(e)}")

@app.post("/player/play")
def play_track(request: dict, access_token: str):
    """Start playback of a track or playlist"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        
        # Get available devices
        devices = sp.devices()
        if not devices['devices']:
            return {"error": "No active devices found. Please open Spotify on a device."}
        
        # Find our web player or use the first available device
        device_id = None
        for device in devices['devices']:
            if 'DJ Assistant' in device['name']:
                device_id = device['id']
                break
        
        if not device_id:
            device_id = devices['devices'][0]['id']
        
        # Start playback
        if 'uris' in request:
            sp.start_playback(device_id=device_id, uris=request['uris'])
        elif 'context_uri' in request:
            sp.start_playback(device_id=device_id, context_uri=request['context_uri'])
        
        return {"message": "Playback started"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to start playback: {str(e)}")

@app.post("/player/pause")
def pause_playback(access_token: str):
    """Pause playback"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        sp.pause_playback()
        return {"message": "Playback paused"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to pause: {str(e)}")

@app.post("/player/resume")
def resume_playback(access_token: str):
    """Resume playback"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        sp.start_playback()
        return {"message": "Playback resumed"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to resume: {str(e)}")

@app.post("/player/next")
def next_track(access_token: str):
    """Skip to next track"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        sp.next_track()
        return {"message": "Skipped to next track"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to skip: {str(e)}")

@app.post("/player/previous")
def previous_track(access_token: str):
    """Skip to previous track"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        sp.previous_track()
        return {"message": "Skipped to previous track"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to go back: {str(e)}")

@app.get("/player/current")
def get_current_playback(access_token: str):
    """Get current playback state"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        current = sp.current_playback()
        
        if not current:
            return {"is_playing": False}
        
        track = current.get('item', {})
        return {
            "is_playing": current['is_playing'],
            "track": {
                "id": track.get('id'),
                "name": track.get('name'),
                "artist": ', '.join([artist['name'] for artist in track.get('artists', [])]),
                "album": track.get('album', {}).get('name'),
                "duration_ms": track.get('duration_ms'),
                "image": track.get('album', {}).get('images', [{}])[0].get('url')
            } if track else None,
            "progress_ms": current.get('progress_ms'),
            "device": current.get('device', {}).get('name')
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get current playback: {str(e)}")

@app.get("/search")
def search_spotify(q: str, type: str = 'track,artist,album,playlist', limit: int = 20, access_token: str = ''):
    """Search Spotify catalog"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        results = sp.search(q=q, type=type, limit=limit)
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to search: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
