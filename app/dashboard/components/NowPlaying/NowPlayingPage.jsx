'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import ArtistInfo from './ArtistInfo';
import QueueItem from './QueueItem';
import { albums } from '../../albums/data/albums';
import { artists } from '../../artists/data/artists';
import RecentlyPlayed from './RecentlyPlayed';
import '@fortawesome/fontawesome-free/css/all.min.css';

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
  const [playbackHistory, setPlaybackHistory] = useState([]);
  const [queue, setQueue] = useState(initialQueue);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(0.7); // Default volume (70%)
  const [isMuted, setIsMuted] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false); // Track user interaction
  const audioRef = useRef(null);
  
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
        audioUrl: track.audioUrl,
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

  // Function to play a specific track
  const playTrack = useCallback((track, addToHistory, autoPlay = false) => {
    // Add current track to history and recently played before switching
    if (currentTrack && addToHistory) {
      addToRecentlyPlayed(currentTrack);
      setPlaybackHistory(prev => [...prev, currentTrack]);
    }
    
    setCurrentTrack(track);
    setProgress(0);
    setCurrentTime('0:00');
    
    // Load new audio source
    if (audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.load();
      audioRef.current.volume = isMuted ? 0 : volume;
      
      // Only autoplay if allowed by browser policy
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
    
    // Remove the track from queue if it's there
    setQueue(prev => prev.filter(t => t.id !== track.id));
  }, [currentTrack, addToRecentlyPlayed, volume, isMuted, hasUserInteracted]);

  // Initialize with a random track
  useEffect(() => {
    if (allTracks.length > 0 && !currentTrack) {
      const randomIndex = Math.floor(Math.random() * allTracks.length);
      const firstTrack = allTracks[randomIndex];
      
      // Set initial queue (3 random tracks excluding the first track)
      const exclude = [firstTrack];
      const initialQueue = allTracks
        .filter(track => !exclude.some(e => e.id === track.id))
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      setQueue(initialQueue);
      playTrack(firstTrack, false, true); // Attempt to autoplay on initial load
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

  // Add new track to queue when a track is removed
  useEffect(() => {
    if (queue.length < 3 && currentTrack) {
      // Create exclusion list (current track + existing queue + recently played)
      const exclude = [
        currentTrack,
        ...queue,
        ...recentlyPlayed.slice(0, 5) // Only consider recent tracks
      ];
      
      const availableTracks = allTracks.filter(
        track => !exclude.some(e => e.id === track.id)
      );
      
      if (availableTracks.length > 0) {
        const newTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
        setQueue(prev => [...prev, newTrack]);
      }
    }
  }, [queue, currentTrack, recentlyPlayed, allTracks]);

  // Play next song
  const playNextSong = useCallback(() => {
    if (queue.length === 0) return;
    
    // Play the first track in the queue
    playTrack(queue[0], true, true); // Add current track to history and autoplay
  }, [queue, playTrack]);

  // Play previous song
  const playPrevSong = useCallback(() => {
    if (playbackHistory.length === 0) return;
    
    // Get last played track from history
    const prevTrack = playbackHistory[playbackHistory.length - 1];
    
    // Add current track to recently played but not to playback history (since we're going back)
    if (currentTrack) {
      addToRecentlyPlayed(currentTrack);
    }
    
    // Play previous track without adding to history
    playTrack(prevTrack, false, true);
    
    // Update history (remove the track we just played)
    setPlaybackHistory(prev => prev.slice(0, -1));
  }, [playbackHistory, currentTrack, playTrack, addToRecentlyPlayed]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.error("Playback failed:", error);
          setIsPlaying(false);
        });
      }
    }
  }, [isPlaying, hasUserInteracted]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    if (audioRef.current) {
      audioRef.current.volume = newMuteState ? 0 : volume;
    }
  }, [isMuted, volume]);

  // Handle volume change
  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      
      // Unmute if we're changing volume from 0
      if (isMuted && newVolume > 0) {
        setIsMuted(false);
      }
    }
  }, [isMuted]);

  // Handle click on recently played track
  const handleRecentlyPlayedClick = useCallback((track) => {
    playTrack(track, true, true); // Add current track to history and autoplay
  }, [playTrack]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const current = audio.currentTime;
      const duration = audio.duration || currentTrack?.actualDuration || 0;
      
      setCurrentTime(formatTime(current));
      setProgress((current / duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(formatTime(audio.duration));
    };

    const handleEnded = () => {
      // When a track ends naturally, it should be added to recently played
      if (currentTrack) {
        addToRecentlyPlayed(currentTrack);
      }
      playNextSong();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, playNextSong, addToRecentlyPlayed]);

  // Reset track progress when track changes
  useEffect(() => {
    if (currentTrack) {
      setDuration(currentTrack.duration);
      setProgress(0);
      setCurrentTime('0:00');
    }
  }, [currentTrack]);

  // Handle playTrack events from other components
  useEffect(() => {
    const handlePlayTrack = (e) => {
      playTrack(e.detail, true, true); // Add current track to history and autoplay
    };

    window.addEventListener('playTrack', handlePlayTrack);
    
    return () => {
      window.removeEventListener('playTrack', handlePlayTrack);
    };
  }, [playTrack]);

  // Handle initial user interaction
  const handleInitialInteraction = useCallback(() => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      
      // Try to play current track if it's not playing
      if (audioRef.current && !isPlaying && currentTrack) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.error("Autoplay failed:", error);
        });
      }
    }
  }, [hasUserInteracted, isPlaying, currentTrack]);

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
    <div className="now-playing-container" onClick={handleInitialInteraction}>
      {/* Hidden audio element */}
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