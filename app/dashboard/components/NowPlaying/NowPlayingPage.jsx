'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import ArtistInfo from './ArtistInfo';
import QueueItem from './QueueItem';
import { albums } from '../../albums/data/albums';
import { artists } from '../../artists/data/artists';
import RecentlyPlayed from './RecentlyPlayed';

// Helper function to extract primary artist name
function getPrimaryArtist(artistString) {
  return artistString
    .split(',')[0]
    .split(' ft.')[0]
    .split(' feat.')[0]
    .split(' featuring')[0]
    .trim();
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
  const [recentlyPlayedHistory, setRecentlyPlayedHistory] = useState([]);
  const [queue, setQueue] = useState(initialQueue);
  const [currentTrack, setCurrentTrack] = useState(null);
  
  // Get all tracks from albums
  const allTracks = useMemo(() => {
    return albums.flatMap(album => 
      album.tracks.map(track => ({
        ...track,
        artist: album.artist,
        actualDuration: convertDurationToSeconds(track.duration),
        cover: album.cover
      }))
    );
  }, []);

  // Function to play a specific track
  const playTrack = useCallback((track) => {
    // Add current track to history before switching
    if (currentTrack) {
      addToRecentlyPlayed(currentTrack);
      setRecentlyPlayedHistory(prev => [...prev, currentTrack]);
    }
    
    // Ensure we have actualDuration
    const fullTrack = {
      ...track,
      actualDuration: track.actualDuration || convertDurationToSeconds(track.duration)
    };
    
    setCurrentTrack(fullTrack);
    setProgress(0);
    setCurrentTime('0:00');
    setIsPlaying(true);
    
    // Remove the track from queue if it's there
    setQueue(prev => prev.filter(t => t.id !== track.id));
  }, [currentTrack]);

  // Initialize with a random track
  useEffect(() => {
    if (allTracks.length > 0 && !currentTrack) {
      const randomIndex = Math.floor(Math.random() * allTracks.length);
      const firstTrack = allTracks[randomIndex];
      playTrack(firstTrack);
    }
  }, [allTracks, currentTrack, playTrack]);

  // Get artist data for current track
  const artistData = useMemo(() => {
    if (!currentTrack) return null;
    
    const primaryArtistName = getPrimaryArtist(currentTrack.artist);
    const artist = artists.find(a => a.name === primaryArtistName);
    
    return artist ? {
      image: artist.image,
      name: artist.name,
      followers: `${artist.followers} followers`,
      bio: artist.description
    } : {
      image: currentTrack.cover,
      name: currentTrack.artist,
      followers: '',
      bio: 'Artist information not available'
    };
  }, [currentTrack]);

  // Get random tracks from albums
  const getRandomTracks = useCallback((count = 3) => {
    // Filter out current track and recently played
    const availableTracks = allTracks.filter(
      track => (!currentTrack || track.id !== currentTrack.id) && 
              !recentlyPlayed.some(t => t.id === track.id)
    );
    
    // Shuffle and pick random tracks
    const shuffled = [...availableTracks].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }, [allTracks, currentTrack, recentlyPlayed]);

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
        album: track.album,
        features: track.features
      };
      
      // Remove duplicate if exists and add to beginning
      return [
        normalizedTrack,
        ...prev.filter(t => t.id !== normalizedTrack.id)
      ].slice(0, 8);
    });
  }, []);

  // Play next song
  const playNextSong = useCallback(() => {
    let nextTrack;

    if (queue.length === 0) {
      const randomTracks = getRandomTracks(3);
      setQueue(randomTracks);
      nextTrack = randomTracks[0];
    } else {
      nextTrack = queue[0];
    }

    // Add current track to recently played
    if (currentTrack) {
      addToRecentlyPlayed(currentTrack);
      setRecentlyPlayedHistory(prev => [...prev, currentTrack]);
    }

    // Move to next track
    if (queue.length > 0) {
      setCurrentTrack(queue[0]);
      setQueue(prev => prev.slice(1));
    } else if (nextTrack) {
      setCurrentTrack(nextTrack);
    }
    
    // Reset progress
    setProgress(0);
    setCurrentTime('0:00');
  }, [queue, currentTrack, getRandomTracks, addToRecentlyPlayed]);

  // Play previous song
  const playPrevSong = useCallback(() => {
    if (recentlyPlayedHistory.length === 0) return;
    
    // Add current track to recently played
    if (currentTrack) {
      addToRecentlyPlayed(currentTrack);
    }
    
    // Get last played track from history
    const prevTrack = recentlyPlayedHistory[recentlyPlayedHistory.length - 1];
    setCurrentTrack(prevTrack);
    
    // Update history
    setRecentlyPlayedHistory(prev => prev.slice(0, -1));
    
    // Reset progress
    setProgress(0);
    setCurrentTime('0:00');
  }, [recentlyPlayedHistory, currentTrack, addToRecentlyPlayed]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Handle click on recently played track
  const handleRecentlyPlayedClick = useCallback((track) => {
    playTrack(track);
  }, [playTrack]);

  // Simulate progress when playing
  useEffect(() => {
    let interval;
    
    if (isPlaying && currentTrack && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          // Ensure actualDuration exists
          const durationValue = currentTrack.actualDuration || 
                              convertDurationToSeconds(currentTrack.duration);
          
          const newProgress = prev + 0.5;
          const currentSeconds = Math.floor((newProgress / 100) * durationValue);
          
          setCurrentTime(formatTime(currentSeconds));
          
          if (newProgress >= 100) {
            playNextSong();
            return 0;
          }
          
          return newProgress;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, progress, currentTrack, playNextSong]);

  // Reset track progress when track changes
  useEffect(() => {
    if (currentTrack) {
      setDuration(currentTrack.duration);
      setProgress(0);
      setCurrentTime('0:00');
    }
  }, [currentTrack]);

  // Load initial random tracks
  useEffect(() => {
    if (allTracks.length > 0 && queue.length === 0 && currentTrack) {
      const randomTracks = getRandomTracks(3);
      setQueue(randomTracks);
    }
  }, [allTracks, queue.length, currentTrack, getRandomTracks]);

  // Handle playTrack events from other components
  useEffect(() => {
    const handlePlayTrack = (e) => {
      playTrack(e.detail);
    };

    window.addEventListener('playTrack', handlePlayTrack);
    
    return () => {
      window.removeEventListener('playTrack', handlePlayTrack);
    };
  }, [playTrack]);

  if (!currentTrack) {
    return (
      <section className="now-playing-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your music...</p>
        </div>
      </section>
    );
  }

  return (
    <div className="now-playing-container">
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
            {currentTrack.features && (
              <p className="credits">Featuring: {currentTrack.features.join(', ')}</p>
            )}
            {currentTrack.album && (
              <p className="credits">Album: {currentTrack.album}</p>
            )}
          
            <div className="sidebar-controls">
              <button onClick={playPrevSong}>⏮</button>
              <button 
                className="play-pause"
                onClick={togglePlayPause}
              >
                {isPlaying ? '⏸' : '⏯'}
              </button>
              <button onClick={playNextSong}>⏭</button>
            </div>
          </div>

          {artistData && <ArtistInfo artist={artistData} />}
        
          <div className="queue-section">
            <h3>Next in Queue</h3>
            <ul className="queue-list">
              {queue.map((track) => (
                <QueueItem key={`${track.id}-${Math.random()}`} track={track} />
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
              <button onClick={playPrevSong}><i className="fa-solid fa-backward" /></button>
              <button className="play-pause" onClick={togglePlayPause}>
                <i className={`fa-solid fa-${isPlaying ? 'pause' : 'play'}`} />
              </button>
              <button onClick={playNextSong}><i className="fa-solid fa-forward" /></button>
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
            <button>🔊</button>
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