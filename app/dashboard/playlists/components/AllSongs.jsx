'use client';
import { usePlaylists } from '../PlaylistsContext';
import SongItem from './SongItem';
import { useState, useMemo } from 'react';

export default function AllSongsDisplay({ onAddToPlaylist, selectedPlaylistId }) {
  const { allSongs, playlists } = usePlaylists();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [filterBy, setFilterBy] = useState('all');

  // Get unique artists and albums for filtering
  const uniqueArtists = useMemo(() => {
    const artists = [...new Set(allSongs.map(song => song.artist))].filter(Boolean);
    return artists.sort();
  }, [allSongs]);

  const uniqueAlbums = useMemo(() => {
    const albums = [...new Set(allSongs.map(song => song.albumTitle))].filter(Boolean);
    return albums.sort();
  }, [allSongs]);

  // Filter and sort songs
  const filteredAndSortedSongs = useMemo(() => {
    let filtered = allSongs.filter(song => {
      if (!song) return false;
      
      // Search filter
      const matchesSearch = searchTerm === '' || 
        song.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.albumTitle?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      let matchesFilter = true;
      if (filterBy !== 'all') {
        if (filterBy.startsWith('artist:')) {
          const artist = filterBy.replace('artist:', '');
          matchesFilter = song.artist === artist;
        } else if (filterBy.startsWith('album:')) {
          const album = filterBy.replace('album:', '');
          matchesFilter = song.albumTitle === album;
        }
      }

      return matchesSearch && matchesFilter;
    });

    // Sort songs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'artist':
          return (a.artist || '').localeCompare(b.artist || '');
        case 'album':
          return (a.albumTitle || '').localeCompare(b.albumTitle || '');
        case 'duration':
          // Convert duration to seconds for proper sorting
          const aDuration = convertDurationToSeconds(a.duration || '0:00');
          const bDuration = convertDurationToSeconds(b.duration || '0:00');
          return aDuration - bDuration;
        default:
          return 0;
      }
    });

    return filtered;
  }, [allSongs, searchTerm, sortBy, filterBy]);

  const convertDurationToSeconds = (duration) => {
    const parts = duration.split(':').map(Number);
    return parts.length === 2 ? parts[0] * 60 + parts[1] : 0;
  };

  const handleAddToPlaylist = (song) => {
    if (selectedPlaylistId && onAddToPlaylist) {
      onAddToPlaylist(selectedPlaylistId, song);
    }
  };

  return (
    <div className="all-songs-display">
      <div className="songs-header">
        <h2>All Songs ({allSongs.length})</h2>
        
        <div className="songs-controls">
          {/* Search */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Search songs, artists, or albums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Sort */}
          <div className="sort-controls">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="title">Title</option>
              <option value="artist">Artist</option>
              <option value="album">Album</option>
              <option value="duration">Duration</option>
            </select>
          </div>

          {/* Filter */}
          <div className="filter-controls">
            <label htmlFor="filter-select">Filter by:</label>
            <select
              id="filter-select"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Songs</option>
              <optgroup label="Artists">
                {uniqueArtists.map(artist => (
                  <option key={artist} value={`artist:${artist}`}>
                    {artist}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Albums">
                {uniqueAlbums.map(album => (
                  <option key={album} value={`album:${album}`}>
                    {album}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      <div className="songs-stats">
        <p>
          Showing {filteredAndSortedSongs.length} of {allSongs.length} songs
          {searchTerm && ` matching "${searchTerm}"`}
          {filterBy !== 'all' && ` filtered by ${filterBy.replace(':', ': ')}`}
        </p>
      </div>

      {filteredAndSortedSongs.length === 0 ? (
        <div className="empty-state">
          {allSongs.length === 0 ? (
            <p>No songs found. Make sure your albums data is loaded correctly.</p>
          ) : (
            <p>No songs match your current search or filter criteria.</p>
          )}
        </div>
      ) : (
        <div className="songs-list">
          {filteredAndSortedSongs.map((song, index) => (
            <SongItem
              key={`all-songs-${song.id}-${index}`}
              song={song}
              onAction={selectedPlaylistId ? () => handleAddToPlaylist(song) : undefined}
              actionLabel={selectedPlaylistId ? "Add to Playlist" : ""}
              actionClass={selectedPlaylistId ? "add-btn" : ""}
              showAlbumInfo={true}
            />
          ))}
        </div>
      )}

      {/* Debug info - remove in production */}
      <div className="debug-info" style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', fontSize: '12px' }}>
        <details>
          <summary>Debug Information</summary>
          <p>Total songs loaded: {allSongs.length}</p>
          <p>Unique artists: {uniqueArtists.length}</p>
          <p>Unique albums: {uniqueAlbums.length}</p>
          <p>Current search: "{searchTerm}"</p>
          <p>Current sort: {sortBy}</p>
          <p>Current filter: {filterBy}</p>
          {allSongs.length > 0 && (
            <div>
              <p>Sample song data:</p>
              <pre>{JSON.stringify(allSongs[0], null, 2)}</pre>
            </div>
          )}
        </details>
      </div>
    </div>
  );
}