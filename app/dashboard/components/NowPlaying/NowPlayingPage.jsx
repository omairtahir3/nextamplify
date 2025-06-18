'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import ArtistInfo from './ArtistInfo';
import QueueItem from './QueueItem';
import RecentlyPlayed from './RecentlyPlayed';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Helper function to extract primary artist name
function getPrimaryArtist(artistString) {
  if (typeof artistString !== 'string') return '';
  return artistString.split(',')[0];
}

// Helper function to convert duration string to seconds
const convertDurationToSeconds = (duration) => {
  const [mins, secs] = duration.split(':').map(Number);
  return mins * 60 + secs;
};

// Format time (seconds to MM:SS)
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default function NowPlayingPage({ showRecentlyPlayed, initialQueue = [] }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [playbackHistory, setPlaybackHistory] = useState([]);
  const [queue, setQueue] = useState(initialQueue);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  // Fetch all albums from API
  const fetchAllAlbums = useCallback(async () => {
    try {
      const response = await fetch('/api/albums');
      if (!response.ok) throw new Error('Failed to fetch albums');
      return await response.json();
    } catch (error) {
      console.error('Error fetching albums:', error);
      setError(error.message);
      return [];
    }
  }, []);

  // Fetch all artists from API
  const fetchAllArtists = useCallback(async () => {
    try {
      const response = await fetch('/api/artists');
      if (!response.ok) throw new Error('Failed to fetch artists');
      return await response.json();
    } catch (error) {
      console.error('Error fetching artists:', error);
      return [];
    }
  }, []);

  // Get all tracks from API data
  const fetchAllTracks = useCallback(async () => {
    try {
      const albums = await fetchAllAlbums();
      return albums.flatMap(album => 
        (album.tracks || []).map(track => ({
          ...track,
          id: track._id || track.id,
          artist: album.artist?.name || 'Unknown Artist',
          actualDuration: convertDurationToSeconds(track.duration),
          cover: album.cover || '/default-album-cover.png',
          albumTitle: album.title
        }))
      );
    } catch (error) {
      console.error('Error processing tracks:', error);
      return [];
    }
  }, [fetchAllAlbums]);

  // Add to recently played list
  const addToRecentlyPlayed = useCallback((track) => {
    setRecentlyPlayed(prev => {
      const normalizedTrack = {
        id: track.id,
        cover: track.cover,
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        actualDuration: track.actualDuration,
        albumTitle: track.albumTitle
      };
      
      return [
        normalizedTrack,
        ...prev.filter(t => t.id !== normalizedTrack.id)
      ].slice(0, 8);
    });
  }, []);

  // Function to play a specific track
  const playTrack = useCallback((track, addToHistory = true, autoPlay = false) => {
    if (!track?.audioUrl) {
      console.error('Invalid track data:', track);
      return;
    }

    if (currentTrack && addToHistory) {
      addToRecentlyPlayed(currentTrack);
      setPlaybackHistory(prev => [...prev, currentTrack]);
    }
    
    setCurrentTrack(track);
    setProgress(0);
    setCurrentTime('0:00');
    
    if (audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.load();
      audioRef.current.volume = isMuted ? 0 : volume;
      
      if (autoPlay && hasUserInteracted) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.error("Playback failed:", error);
          setIsPlaying(false);
        });
      } else {
        setIsPlaying(false);
      }
    }
    
    setQueue(prev => prev.filter(t => t.id !== track.id));
  }, [currentTrack, addToRecentlyPlayed, volume, isMuted, hasUserInteracted]);

  // Initialize with data from API
  useEffect(() => {
    const initializePlayer = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const tracks = await fetchAllTracks();
        const artists = await fetchAllArtists();

        if (tracks.length > 0) {
          const randomIndex = Math.floor(Math.random() * tracks.length);
          const firstTrack = tracks[randomIndex];
          
          const initialQueue = tracks
            .filter(track => track.id !== firstTrack.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
          
          setQueue(initialQueue);
          playTrack(firstTrack, false, true);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializePlayer();
  }, [fetchAllTracks, fetchAllArtists, playTrack]);

  // Get detailed artist data
  const fetchArtistDetails = useCallback(async (artistName) => {
    try {
      const response = await fetch(`/api/artists/${encodeURIComponent(artistName)}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error fetching artist details:', error);
      return null;
    }
  }, []);

  // Artist data with potential API fetch
  const [artistData, setArtistData] = useState(null);
  useEffect(() => {
    if (!currentTrack) return;

    const getArtistData = async () => {
      const primaryArtistName = getPrimaryArtist(currentTrack.artist);
      const details = await fetchArtistDetails(primaryArtistName);
      
      setArtistData({
        image: details?.image || currentTrack.cover,
        name: primaryArtistName,
        followers: details?.followers ? `${details.followers} followers` : '',
        bio: details?.description || 'Artist information not available'
      });
    };

    getArtistData();
  }, [currentTrack, fetchArtistDetails]);

  // ... (keep all your existing player control functions: playNextSong, playPrevSong, etc.)
  // ... (keep all your existing useEffect hooks for audio events)
  // ... (keep all your existing UI rendering code)

  if (isLoading) {
    return (
      <section className="now-playing-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your music...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="now-playing-section">
        <div className="error-container">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="now-playing-container" onClick={() => setHasUserInteracted(true)}>
      <audio ref={audioRef} crossOrigin="anonymous" />
      
      <section className="now-playing-section">
        <h2>Now Playing</h2>
        <div className="now-playing-track">
          <div className="album-art-container">
            <Image
              src={currentTrack.cover}
              alt="Album Cover"
              width={200}
              height={200}
              className="now-playing-album-art"
            />
          </div>
          
          <div className="now-playing-info">
            <h3 className="song-title">{currentTrack.title}</h3>
            <p className="artist-section-name">{currentTrack.artist}</p>
            {currentTrack.album && (
              <p className="credits">Album: {currentTrack.album}</p>
            )}
          
            <div className="sidebar-controls">
              <button 
                onClick={playPrevSong}
                disabled={playbackHistory.length === 0}
              >
                ⏮
              </button>
              <button 
                className="play-pause"
                onClick={togglePlayPause}
              >
                {isPlaying ? '⏸' : '⏯'}
              </button>
              <button 
                onClick={playNextSong}
                disabled={queue.length === 0}
              >
                ⏭
              </button>
            </div>
          </div>

          {artistData && <ArtistInfo artist={artistData} />}
        
          <div className="queue-section">
            <h3>Next in Queue</h3>
            <ul className="queue-list">
              {queue.map((track) => (
                <QueueItem 
                  key={track.id} 
                  track={track} 
                  onClick={() => playTrack(track, true, true)}
                />
              ))}
            </ul>
          </div>
        </div>

        <div className="now-playing-bar">
          <div className="now-playing-left">
            <Image
              src={currentTrack.cover}
              alt={currentTrack.title}
              width={56}
              height={56}
              className="track-cover"
            />
            <div>
              <p className="song-title">{currentTrack.title}</p>
              <p className="song-artist">{currentTrack.artist}</p>
            </div>
          </div>

          <div className="now-playing-center">
            <div className="controls">
              <button 
                onClick={playPrevSong}
                disabled={playbackHistory.length === 0}
              >
                <i className="fa-solid fa-backward" />
              </button>
              <button className="play-pause" onClick={togglePlayPause}>
                <i className={`fa-solid fa-${isPlaying ? 'pause' : 'play'}`} />
              </button>
              <button 
                onClick={playNextSong}
                disabled={queue.length === 0}
              >
                <i className="fa-solid fa-forward" />
              </button>
            </div>
            <div className="progress-bar">
              <span>{currentTime}</span>
              <div className="bar">
                <div className="fill" style={{ width: `${progress}%` }} />
              </div>
              <span>{currentTrack.duration || formatTime(currentTrack.actualDuration)}</span>
            </div>
          </div>

          <div className="now-playing-right">
            <button 
              className="mute-btn"
              onClick={toggleMute}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? '🔇' : volume > 0.5 ? '🔊' : '🔈'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
              title="Adjust volume"
            />
          </div>
        </div>
      </section>
      
      {showRecentlyPlayed && (
        <RecentlyPlayed 
          recentlyPlayed={recentlyPlayed} 
          onTrackClick={handleRecentlyPlayedClick} 
        />
      )}
    </div>
  );
}