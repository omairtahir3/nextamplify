'use client';
import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { albums } from '../data/albums';
import NowPlayingPage from '../../components/NowPlaying/NowPlayingPage';
import Sidebar from '../../components/Sidebar';
// Helper to convert duration string to seconds
const durationToSeconds = (duration) => {
  const [minutes, seconds] = duration.split(':').map(Number);
  return minutes * 60 + seconds;
};

// Helper to create unique song IDs
const createUniqueSongId = (albumId, trackId) => `${albumId}-${trackId}`;

export default function AlbumPage({ params }) {
  // Unwrap the params promise using use()
  const resolvedParams = use(params);
  const albumId = resolvedParams.albumId;
  
  const album = albums.find(a => a.id === parseInt(albumId));
  const [queue, setQueue] = useState([]);
  
  // Set document title to album name
  useEffect(() => {
    if (album) {
      document.title = `Amplify - ${album.title}`;
    } else {
      document.title = 'Amplify - Album';
    }
  }, [album]);

  // Prepare tracks with actualDuration and uniqueId
  const albumTracks = album ? album.tracks.map(track => ({
    ...track,
    uniqueId: createUniqueSongId(album.id, track.id),
    artist: album.artist,
    cover: album.cover,
    actualDuration: durationToSeconds(track.duration)
  })) : [];

  // Calculate total album duration
  const totalDuration = album ? formatTotalDuration(
    albumTracks.reduce((total, track) => 
      total + track.actualDuration, 0)
  ) : '0:00';

  // Play track immediately
  const playTrack = (track) => {
    window.dispatchEvent(new CustomEvent('playTrack', { detail: track }));
  };

  if (!album) return <div className="loading">Loading album...</div>;

  return (
    <div className="album-detail-content">
      <Sidebar />
      <div className="album-detail-header">
        <div className="album-detail-art">
          <Image
            src={album.cover}
            alt={album.title}
            width={300}
            height={300}
            className="album-detail-cover"
          />
        </div>
        <div className="album-detail-info">
          <h1 className="album-detail-title">{album.title}</h1>
          <p className="album-detail-artist">{album.artist}</p>
          <div className="album-detail-meta">
            <span>{album.year}</span>
            <span className="divider"></span>
            <span>{album.tracks.length} songs</span>
            <span className="divider"></span>
            <span>{totalDuration}</span>
          </div>
        </div>
      </div>

      <div className="track-list-container">
        <div className="track-list-header">
          <div>#</div>
          <div>Title</div>
          <div>Duration</div>
        </div>
        
        {albumTracks.map((track) => (
          <div 
            key={track.uniqueId} 
            className="track-item"
          >
            <div className="track-number">{track.id}</div>
            <div className="track-title">{track.title}</div>
            <div className="track-duration">{track.duration}</div>
            <div className="track-actions">
              <i className="fas fa-play track-play-icon" onClick={() => playTrack(track)}></i>
            </div>
          </div>
        ))}
      </div>
      
      <NowPlayingPage 
        showRecentlyPlayed={false}
        initialQueue={queue}
      />
    </div>
  );
}

// Format total duration
function formatTotalDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  } else if (minutes > 0) {
    return `${minutes} min ${seconds} sec`;
  }
  return `${seconds} sec`;
}