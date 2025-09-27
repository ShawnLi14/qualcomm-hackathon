import React, { useState } from 'react';
import spotifyService from '../services';
import './LoginScreen.css';

interface LoginScreenProps {
  onLogin: (token: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSpotifyLogin = async () => {
    setIsLoading(true);
    try {
      const loginUrl = await spotifyService.getLoginUrl();
      
      // Create a popup window for OAuth
      const popup = window.open(
        loginUrl,
        'spotify-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        alert('Popup blocked! Please allow popups for this site.');
        setIsLoading(false);
        return;
      }

      // Listen for messages from the popup
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'spotify_auth_success') {
          const token = event.data.access_token;
          if (token) {
            spotifyService.setAccessToken(token);
            onLogin(token);
          }
          popup.close();
          setIsLoading(false);
          window.removeEventListener('message', messageHandler);
        } else if (event.data.type === 'spotify_auth_error') {
          console.error('Authentication failed:', event.data.error);
          alert(`Authentication failed: ${event.data.error}`);
          popup.close();
          setIsLoading(false);
          window.removeEventListener('message', messageHandler);
        }
      };

      window.addEventListener('message', messageHandler);

      // Handle popup being closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsLoading(false);
          window.removeEventListener('message', messageHandler);
        }
      }, 1000);

    } catch (error) {
      console.error('Failed to initiate Spotify login:', error);
      alert('Failed to connect to Spotify. Please check your backend is running.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-content">
        <div className="logo">
          <h1>DJ Assistant</h1>
          <p>Your AI-powered music companion</p>
        </div>
        
        <div className="login-section">
          <h2>Connect to Spotify</h2>
          <p>Sign in with your Spotify Premium account to get started</p>
          
          <button 
            className="spotify-login-btn"
            onClick={handleSpotifyLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Connecting...</span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Connect with Spotify
              </>
            )}
          </button>
          
          <div className="requirements">
            <small>
              <strong>How it works:</strong>
              <br />• Sign in with your personal Spotify account (Free or Premium)
              <br />• No need to create a developer app - just use your regular Spotify login
              <br />• Your music preferences stay private and secure
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;