'use client';
import { useState } from 'react';
import { usePlaylists } from './PlaylistsContext';
import PlaylistForm from './components/PlaylistForm';
import PlaylistItem from './components/PlaylistItem';
import './globals.css';


export default function PlaylistsPage() {
  const { playlists, createPlaylist, deletePlaylist } = usePlaylists();
  const [showForm, setShowForm] = useState(false);

  const handleCreatePlaylist = async (name) => {
    try {
      await createPlaylist(name);
      setShowForm(false);
    } catch (err) {
      console.error('Error creating playlist:', err);
      // Let the form handle showing the error
      throw err;
    }
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
            {playlists.map((playlist, index) => (
              <PlaylistItem
                key={playlist._id || playlist.id || `playlist-${index}`}
                playlist={playlist}
                onDelete={deletePlaylist}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}