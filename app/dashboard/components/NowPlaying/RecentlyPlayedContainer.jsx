'use client';
import { useState, useEffect } from 'react';
import RecentlyPlayed from './RecentlyPlayed';

export default function RecentlyPlayedContainer() {
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail) {
        setRecentlyPlayed(e.detail);
      }
    };
    
    window.addEventListener('recentlyPlayedUpdated', handleUpdate);
    
    // Request current state on mount
    window.dispatchEvent(new CustomEvent('requestRecentlyPlayed'));
    
    return () => window.removeEventListener('recentlyPlayedUpdated', handleUpdate);
  }, []);

  if (!recentlyPlayed || recentlyPlayed.length === 0) return null;

  return (
    <RecentlyPlayed 
      recentlyPlayed={recentlyPlayed} 
      onTrackClick={(track) => {
        window.dispatchEvent(new CustomEvent('playTrack', { detail: track }));
      }} 
    />
  );
}
