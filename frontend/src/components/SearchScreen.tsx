import React, { useState } from 'react';
import PlaylistCard from './PlaylistCard';
import './SearchScreen.css';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const mockResults = [
    { title: 'Indie Rock Essentials', description: 'The best of indie rock', imageUrl: 'https://via.placeholder.com/150' },
    { title: 'Electronic Vibes', description: 'Electronic music for focus', imageUrl: 'https://via.placeholder.com/150' },
    { title: 'Jazz Classics', description: 'Timeless jazz standards', imageUrl: 'https://via.placeholder.com/150' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Mock search results
      setSearchResults(mockResults);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="search-screen">
      <div className="search-header">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="search-icon">
              <path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.353-4.353c1.289-1.618 2.058-3.674 2.058-5.908 0-5.138-4.229-9.278-9.379-9.278zm-7.407 9.279c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.279-7.407 7.279-7.407-3.273-7.407-7.28z"/>
            </svg>
            <input
              type="text"
              placeholder="What do you want to listen to?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </form>
      </div>
      
      {searchResults.length > 0 ? (
        <div className="search-results">
          <h2>Search Results</h2>
          <div className="playlist-grid">
            {searchResults.map((result, index) => (
              <PlaylistCard key={index} {...result} />
            ))}
          </div>
        </div>
      ) : (
        <div className="search-empty">
          <h2>Browse All</h2>
          <div className="browse-categories">
            <div className="category-card" style={{backgroundColor: '#8400e7'}}>
              <h3>Pop</h3>
            </div>
            <div className="category-card" style={{backgroundColor: '#e8115b'}}>
              <h3>Rock</h3>
            </div>
            <div className="category-card" style={{backgroundColor: '#1e3264'}}>
              <h3>Jazz</h3>
            </div>
            <div className="category-card" style={{backgroundColor: '#148a08'}}>
              <h3>Electronic</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchScreen;