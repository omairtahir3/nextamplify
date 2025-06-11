'use client';
import { useState } from 'react';
import { usePlaylists } from './PlaylistsContext';
import PlaylistForm from './components/PlaylistForm';
import PlaylistItem from './components/PlaylistItem';
import NowPlayingPage from '../components/NowPlaying/NowPlayingPage'; // Adjust path as needed

export default function PlaylistsPage() {
  const { playlists, createPlaylist, deletePlaylist } = usePlaylists();
  const [showForm, setShowForm] = useState(false);

  const handleCreatePlaylist = (name) => {
    createPlaylist(name);
    setShowForm(false);
  };

  return (
    <div className="playlists-page-container">
      <div className="playlists-container">
        <div className="playlists-header">
          <h1>Your Playlists</h1>
          <button
            className="create-playlist-btn"
            onClick={() => setShowForm(true)}
          >
            +
          </button>
        </div>

        {showForm && (
          <PlaylistForm
            onCreate={handleCreatePlaylist}
            onCancel={() => setShowForm(false)}
          />
        )}

        {playlists.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created any playlists yet.</p>
            <button
              className="create-playlist-btn"
              onClick={() => setShowForm(true)}
            >
              +
            </button>
          </div>
        ) : (
          <div className="playlists-grid">
            {playlists.map(playlist => (
              <PlaylistItem
                key={playlist.id}
                playlist={playlist}
                onDelete={deletePlaylist}
              />
            ))}
          </div>
        )}
      </div>
        <NowPlayingPage showRecentlyPlayed={false} />
    </div>
  );
}