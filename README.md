# Vibify 🎵

*Your AI-Powered Music Companion*

Vibify is a smart music streaming app that enhances your Spotify experience with AI-powered contextual recommendations and real-time chat control. Built with Electron + React frontend and Python FastAPI backend.

## ✨ Features

- **🎯 Smart AutoMix Playlists**: Context-aware music recommendations based on your activity and mood
- **💬 Live DJ Chat**: Use natural language to influence music selection in real-time
- **🔗 Spotify Connect Integration**: Control playback on any of your Spotify devices
- **📱 Unified Interface**: Access your existing playlists and library in a beautiful, intuitive design
- **🎮 Real-time Controls**: Play, pause, skip, shuffle, and seek with live progress tracking
- **🔄 Device Management**: Seamlessly switch between your phones, computers, and speakers

## Project Structure

```
├── frontend/          # Electron + React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── app.tsx       # Main React app
│   │   ├── renderer.tsx  # Electron renderer entry point
│   │   └── index.html    # HTML template
│   └── package.json
├── backend/           # Python FastAPI server
│   ├── main.py       # FastAPI application
│   └── requirements.txt
└── README.md
```

## Setup

### Frontend (Electron + React)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Backend (Python FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # or
   source venv/bin/activate  # On macOS/Linux
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the development server:
   ```bash
   uvicorn main:app --reload
   ```

The FastAPI server will be available at `http://localhost:8000`

## 🔌 API Endpoints

**Authentication:**
- `GET /auth/spotify/login` - Generate Spotify OAuth URL
- `GET /callback` - Handle OAuth callback and token exchange

**Playback Control:**
- `GET /player/devices` - Get available Spotify devices
- `GET /player/currently-playing` - Get current playback state
- `POST /player/play` - Start/resume playback or play specific content
- `POST /player/pause` - Pause playback
- `POST /player/next` - Skip to next track
- `POST /player/previous` - Skip to previous track
- `POST /player/seek` - Seek to position in track
- `POST /player/volume` - Set volume level
- `POST /player/shuffle` - Toggle shuffle mode
- `POST /player/repeat` - Set repeat mode

**Music Library:**
- `GET /user/playlists` - Get user's Spotify playlists
- `GET /playlist/{id}/tracks` - Get tracks from specific playlist
- `GET /search` - Search Spotify catalog

## 🚀 Current Status

**Vibify is now fully functional with core features implemented!**

✅ **Completed Features:**
- Spotify OAuth authentication with popup flow
- Real-time playback controls via Spotify Connect API
- Live progress tracking and seeking
- Device selection and management
- Playlist browsing and click-to-play functionality
- Beautiful dark-themed UI matching Spotify's design

🔄 **In Development:**
- AI-powered AutoMix playlist generation
- Natural language chat interface for music control
- Context detection and smart recommendations
- Advanced ML-based music curation

## Tech Stack

- **Frontend**: Electron, React, TypeScript, Webpack
- **Backend**: Python, FastAPI, WebSockets
- **Future integrations**: Spotify Web API, ML libraries (scikit-learn, transformers), Vector databases (FAISS)