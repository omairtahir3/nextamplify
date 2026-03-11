'use client';
import { useState } from 'react';

export default function PlaylistForm({ onCreate, onCancel }) {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (name.trim()) {
      try {
        setIsSubmitting(true);
        await onCreate(name.trim());
        setName('');
      } catch (err) {
        setError(err.message || 'You already created a playlist with this name');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <form className="playlist-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Playlist name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (error) setError(null);
        }}
        required
        className="playlist-input"
        disabled={isSubmitting}
      />
      {error && (
        <p className="error-message" style={{ color: '#ff4d4d', fontSize: '0.85rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>
          {error}
        </p>
      )}
      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="create-btn" disabled={isSubmitting || !name.trim()}>
          {isSubmitting ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  );
}