import React, { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import PlayerScreen from './components/PlayerScreen';
import SearchScreen from './components/SearchScreen';
import LibraryScreen from './components/LibraryScreen';
import LoginScreen from './components/LoginScreen';
import spotifyService from './services';
import './app.css';

type TabType = 'home' | 'search' | 'library';

const App = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('spotify_access_token');
    if (token) {
      spotifyService.setAccessToken(token);
      setIsAuthenticated(true);
    }
    setIsLoading(false);

    return () => {
      // Clean up polling when app unmounts
      spotifyService.stopPolling();
    };
  }, []);

  const handleLogin = (token: string) => {
    localStorage.setItem('spotify_access_token', token);
    spotifyService.setAccessToken(token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token');
    spotifyService.stopPolling();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#121212',
        color: 'white' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'search':
        return <SearchScreen />;
      case 'library':
        return <LibraryScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <h1>Vibify</h1>
        </div>
        <nav>
          <ul>
            <li 
              className={activeTab === 'home' ? 'active' : ''}
              onClick={() => setActiveTab('home')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7.577a2 2 0 0 0-1-1.732l-7.5-4.33z"/>
              </svg>
              Home
            </li>
            <li 
              className={activeTab === 'search' ? 'active' : ''}
              onClick={() => setActiveTab('search')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.353-4.353c1.289-1.618 2.058-3.674 2.058-5.908 0-5.138-4.229-9.278-9.379-9.278zm-7.407 9.279c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.279-7.407 7.279-7.407-3.273-7.407-7.28z"/>
              </svg>
              Search
            </li>
            <li 
              className={activeTab === 'library' ? 'active' : ''}
              onClick={() => setActiveTab('library')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1.5.866l8-9a1 1 0 0 0 0-1.732l-8-9z"/>
                <path d="M6 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z"/>
              </svg>
              Your Library
            </li>
          </ul>
        </nav>
        <div className="sidebar-bottom">
          <div className="create-playlist">
            <button className="create-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z"/>
              </svg>
              Create Playlist
            </button>
          </div>
          <div className="user-profile">
            <button className="logout-btn" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h5a1 1 0 0 0 0-2H4V3h4a1 1 0 0 0 0-2H3z"/>
                <path d="M13.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L12.293 8 10.146 5.854a.5.5 0 1 1 .708-.708l3 3z"/>
                <path d="M11.5 8a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 1 0v1a.5.5 0 0 1-.5.5z"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </aside>
      <main className="main-content">
        {renderContent()}
      </main>
      <footer className="player-bar">
        <PlayerScreen />
      </footer>
    </div>
  );
};

export default App;
