'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '../../components/Sidebar';
import NowPlayingPage from '../../components/NowPlaying/NowPlayingPage';

// Converts "mm:ss" to total seconds
const durationToSeconds = (duration) => {
  if (!duration || typeof duration !== 'string') return 0;
  const [minutes, seconds] = duration.split(':').map(Number);
  return (minutes || 0) * 60 + (seconds || 0);
};

// Creates unique ID for each track
const createUniqueSongId = (albumId, trackId) => `${albumId}-${trackId}`;

// Format total album duration
function formatTotalDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours} hr ${minutes} min`;
  if (minutes > 0) return `${minutes} min ${seconds} sec`;
  return `${seconds} sec`;
}

export default function AlbumPage({ params }) {
  const router = useRouter();
  const albumId = params.albumId;
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch album data
// In your AlbumPage component
  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        setLoading(true);
        setError(null);
      
        const res = await fetch(`/api/albums/${albumId}`);
      
        if (!res.ok) {
          const errorData = await res.json();
          const errorMessage = errorData.error || 
                              errorData.message || 
                              `Failed to fetch album (${res.status})`;
          throw new Error(errorMessage);
        }
      
        const data = await res.json();
        setAlbum(data);
      } catch (error) {
        console.error('Error loading album:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (albumId) {
      fetchAlbumData();
    } else {
      setError('No album ID provided');
      setLoading(false);
    }
  }, [albumId]);

  // Update tab title
  useEffect(() => {
    document.title = album 
      ? `Amplify - ${album.title || 'Album'}`
      : 'Amplify - Album';
  }, [album]);

  // Play track function
  const playTrack = (track) => {
    window.dispatchEvent(new CustomEvent('playTrack', { 
      detail: {
        ...track,
        artist: album.artist?.name || 'Unknown Artist',
        cover: album.cover
      }
    }));
    setIsPlaying(true);
  };

  // Play all tracks
  const playAllTracks = () => {
    if (!album?.tracks?.length) return;
    
    const fullQueue = album.tracks.map(track => ({
      ...track,
      uniqueId: createUniqueSongId(album._id, track._id),
      artist: album.artist?.name || 'Unknown Artist',
      cover: album.cover,
      actualDuration: durationToSeconds(track.duration),
    }));

    window.dispatchEvent(new CustomEvent('playMultiple', { 
      detail: fullQueue 
    }));
    setIsPlaying(true);
  };

  if (loading) {
    return (
      <div className="album-detail-content">
        <Sidebar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading album details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="album-detail-content">
        <Sidebar />
        <div className="error-container">
          <div className="error-icon">!</div>
          <h3>Couldn't load album</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => router.back()}>
              Go Back
            </button>
            <button onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="album-detail-content">
        <Sidebar />
        <div className="not-found-container">
          <h3>Album Not Found</h3>
          <p>The requested album doesn't exist or was removed</p>
          <button onClick={() => router.push('/dashboard/albums')}>
            Browse Albums
          </button>
        </div>
      </div>
    );
  }

  // Prepare tracks data
  const albumTracks = album.tracks.map((track, index) => ({
    ...track,
    uniqueId: createUniqueSongId(album._id, track._id),
    artist: album.artist?.name || 'Unknown Artist',
    cover: album.cover,
    actualDuration: durationToSeconds(track.duration),
  }));

  const totalDuration = formatTotalDuration(
    albumTracks.reduce((total, track) => total + track.actualDuration, 0)
  );

  return (
    <div className="album-detail-content">
      <Sidebar />
      
      {/* Album Header */}
      <div className="album-detail-header">
        <div className="album-detail-art">
          {album.cover ? (
            <Image
              src={album.cover}
              alt={album.title || 'Album cover'}
              width={300}
              height={300}
              className="album-detail-cover"
              onError={(e) => {
                e.target.src = '/default-album-cover.png';
                e.target.onerror = null;
              }}
            />
          ) : (
            <div className="album-cover-placeholder">
              <span>No Cover</span>
            </div>
          )}
        </div>
        
        <div className="album-detail-info">
          <h1 className="album-detail-title">{album.title || 'Untitled Album'}</h1>
                
          <div className="album-detail-meta">
            {album.year && <span>{album.year}</span>}
            {album.year && <span className="divider"></span>}
            <span>{albumTracks.length} {albumTracks.length === 1 ? 'song' : 'songs'}</span>
            <span className="divider"></span>
            <span>{totalDuration}</span>
          </div>
          
        </div>
      </div>

      {/* Track List */}
      <div className="track-list-container">
        <div className="track-list-header">
          <div className="header-index">#</div>
          <div className="header-title">Title</div>
          <div className="header-duration">
            <i className="far fa-clock"></i>
          </div>
        </div>

        {albumTracks.length > 0 ? (
          albumTracks.map((track, index) => (
            <div 
              key={track.uniqueId} 
              className="track-item"
              onClick={() => playTrack(track)}
            >
              <div className="track-number">
                {isPlaying ? (
                  <i className="fas fa-waveform"></i>
                ) : (
                  index + 1
                )}
              </div>
              <div className="track-info">
                <div className="track-title">
                  {track.title || 'Untitled Track'}
                  {track.explicit && <span className="explicit-badge">E</span>}
                </div>
              </div>
              <div className="track-duration">{track.duration || '0:00'}</div>
              <div className="track-actions">
                <i className="fas fa-play track-play-icon"></i>
              </div>
            </div>
          ))
        ) : (
          <div className="no-tracks-message">
            <p>No tracks available for this album</p>
          </div>
        )}
      </div>

      {/* Album Description */}
      {album.description && (
        <div className="album-description-section">
          <h3>About the Album</h3>
          <p>{album.description}</p>
        </div>
      )}

      <NowPlayingPage showRecentlyPlayed={false} />
    </div>
  );
}