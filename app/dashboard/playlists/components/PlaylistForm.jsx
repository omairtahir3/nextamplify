'use client';
import { useState } from 'react';

export default function PlaylistForm({ onCreate, onCancel }) {
  const [name, setName] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
      setName('');
    }
  };
  
  return (
    <form className="playlist-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Playlist name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="playlist-input"
      />
      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="create-btn">
          Create
        </button>
      </div>
    </form>
  );
}