# Spotify Wrapper with AI DJ

A smart music recommendation app built with Electron + React frontend and Python FastAPI backend.

## Features

- **Smart AutoMix Playlists**: Context-aware music recommendations based on your activity
- **Live DJ Chat**: Use natural language to influence the music selection in real-time
- **Spotify Integration**: Access your existing playlists and library
- **Activity Detection**: Automatically adapt music based on what you're doing

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

## API Endpoints

- `GET /` - Health check
- `POST /auth/spotify` - Spotify authentication
- `POST /recs/start` - Start recommendations
- `POST /nlp/parse` - Parse natural language input
- `WS /ws` - WebSocket for real-time communication

## Development Status

This is a high-level boilerplate. Next steps include:

1. Implement Spotify OAuth integration
2. Add context detection services
3. Build recommendation engine with ML models
4. Integrate LLM for natural language processing
5. Add proper state management and WebSocket communication
6. Implement the AutoMix card generation logic

## Tech Stack

- **Frontend**: Electron, React, TypeScript, Webpack
- **Backend**: Python, FastAPI, WebSockets
- **Future integrations**: Spotify Web API, ML libraries (scikit-learn, transformers), Vector databases (FAISS)