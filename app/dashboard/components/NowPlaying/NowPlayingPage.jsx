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
  if (!duration) return 0; 
  
  if (typeof duration === 'number') return duration;
  
  // Handle string format (MM:SS)
  const parts = duration.toString().split(':');
  if (parts.length === 2) {
    const [mins, secs] = parts.map(Number);
    return mins * 60 + secs;
  }
  
  return 0; 
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
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  
  // Fetch albums, artists, and tracks data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // First, fetch albums and artists
        const [albumsRes, artistsRes] = await Promise.all([
          fetch('/api/albums').then(res => {
            if (!res.ok) throw new Error(`Albums API error: ${res.status}`);
            return res.json();
          }),
          fetch('/api/artists').then(res => {
            if (!res.ok) throw new Error(`Artists API error: ${res.status}`);
            return res.json();
          })
        ]);
        
        console.log('Fetched albums:', albumsRes);
        console.log('Fetched artists:', artistsRes);
        
        setAlbums(albumsRes || []);
        setArtists(artistsRes || []);
        
        // Now fetch tracks for each album
        const allTracks = [];
        
        if (albumsRes && albumsRes.length > 0) {
          for (const album of albumsRes) {
            try {
              const tracksRes = await fetch(`/api/tracks?albumId=${album._id}`);
              if (tracksRes.ok) {
                const albumTracks = await tracksRes.json();
                
                // Debug: Check album data
                console.log('Album data:', album);
                // Enhance tracks with album and artist information
                const enhancedTracks = albumTracks.map(track => {
                  // Handle case where album.artist might be an object instead of a string
                  let artistName = 'Unknown Artist';
                  if (typeof album.artist === 'string') {
                    artistName = album.artist;
                  } else if (typeof album.artist === 'object' && album.artist && album.artist.name) {
                    artistName = album.artist.name;
                  } else if (typeof track.artist === 'string') {
                    artistName = track.artist;
                  } else if (typeof track.artist === 'object' && track.artist && track.artist.name) {
                    artistName = track.artist.name;
                  }
                  
                  const enhancedTrack = {
                    ...track,
                    artist: String(artistName),
                    actualDuration: convertDurationToSeconds(track.duration),
                    cover: album.cover || track.cover || '/default-cover.jpg',
                    album: String(album.title || album.name || 'Unknown Album'),
                    albumId: album._id
                  };
                  
                  return enhancedTrack;
                });
                
                allTracks.push(...enhancedTracks);
              }
            } catch (trackError) {
              console.error(`Error fetching tracks for album ${album._id}:`, trackError);
            }
          }
        }
        
        console.log('All tracks fetched:', allTracks);
        setTracks(allTracks);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Get all playable tracks
  const allTracks = useMemo(() => {
    // Filter tracks that have audioUrl
    const playableTracks = tracks.filter(track => track.audioUrl);
    console.log('Playable tracks:', playableTracks);
    return playableTracks;
  }, [tracks]);

  // Add to recently played list
  const addToRecentlyPlayed = useCallback((track) => {
    setRecentlyPlayed(prev => {
      const normalizedTrack = {
        id: track._id || track.id,
        cover: track.cover,
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        actualDuration: track.actualDuration,
        audioUrl: track.audioUrl,
        album: track.album,
        albumId: track.albumId
      };
      
      // Remove duplicate if exists and add to beginning
      return [
        normalizedTrack,
        ...prev.filter(t => (t.id || t._id) !== (normalizedTrack.id || normalizedTrack._id))
      ].slice(0, 8);
    });
  }, []);

  // Function to play a specific track
  const playTrack = useCallback((track, addToHistory, autoPlay = false) => {
    if (!track || !track.audioUrl) {
      console.error('Cannot play track: missing audioUrl', track);
      return;
    }

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
    setQueue(prev => prev.filter(t => (t._id || t.id) !== (track._id || track.id)));
  }, [currentTrack, addToRecentlyPlayed, volume, isMuted, hasUserInteracted]);

  // Initialize with a random track when data is loaded
  useEffect(() => {
    if (allTracks.length > 0 && !currentTrack && !isLoading) {
      console.log('Initializing with random track from:', allTracks.length, 'tracks');
      
      if (allTracks.length === 0) {
        console.error('No playable tracks found (missing audioUrl)');
        setError('No playable tracks found. Please check that tracks have valid audio URLs.');
        return;
      }
      
      const randomIndex = Math.floor(Math.random() * allTracks.length);
      const firstTrack = allTracks[randomIndex];
      
      // Set initial queue (3 random tracks excluding the first track)
      const exclude = [firstTrack];
      const initialQueue = allTracks
        .filter(track => !exclude.some(e => (e._id || e.id) === (track._id || track.id)))
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      setQueue(initialQueue);
      playTrack(firstTrack, false, true);
    }
  }, [allTracks, currentTrack, playTrack, isLoading]);

  // Get artist data for current track
  const artistData = useMemo(() => {
    if (!currentTrack) return null;
    
    const primaryArtistName = getPrimaryArtist(currentTrack.artist);
    const artist = artists.find(a => a.name === primaryArtistName);
    
    return artist ? {
      id: artist._id,
      image: artist.image || currentTrack.cover || '/default-cover.jpg',
      name: String(artist.name || 'Unknown Artist'),
      followers: artist.followers ? `${artist.followers} followers` : '',
      bio: String(artist.description || artist.bio || 'Artist information not available')
    } : {
      image: currentTrack.cover || '/default-cover.jpg',
      name: String(currentTrack.artist || 'Unknown Artist'),
      followers: '',
      bio: 'Artist information not available'
    };
  }, [currentTrack, artists]);

  // Add new track to queue when a track is removed
  useEffect(() => {
    if (queue.length < 3 && currentTrack && allTracks.length > 0) {
      // Create exclusion list (current track + existing queue + recently played)
      const exclude = [
        currentTrack,
        ...queue,
        ...recentlyPlayed.slice(0, 5)
      ];
      
      const availableTracks = allTracks.filter(
        track => track.audioUrl && !exclude.some(e => (e._id || e.id) === (track._id || track.id))
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
    playTrack(queue[0], true, true);
  }, [queue, playTrack]);

  // Play previous song
  const playPrevSong = useCallback(() => {
    if (playbackHistory.length === 0) return;
    
    // Get last played track from history
    const prevTrack = playbackHistory[playbackHistory.length - 1];
    
    // Add current track to recently played but not to history (since we're going back)
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
    playTrack(track, true, true);
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

    const handleError = (e) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
      // Try to play next song on error
      if (queue.length > 0) {
        playNextSong();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrack, playNextSong, addToRecentlyPlayed, queue]);

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
      playTrack(e.detail, true, true);
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

  // Loading state
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

  // Error state
  if (error) {
    return (
      <section className="now-playing-section">
        <div className="error-container">
          <h3>Unable to load music</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </section>
    );
  }

  // No tracks available
  if (!currentTrack && allTracks.length === 0) {
    return (
      <section className="now-playing-section">
        <div className="empty-container">
          <h3>No tracks available</h3>
          <p>Add some music to your library to start playing.</p>
        </div>
      </section>
    );
  }

  // No current track but tracks are available
  if (!currentTrack) {
    return (
      <section className="now-playing-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Preparing your music...</p>
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
            <h3 className="song-title">{String(currentTrack.title || 'Unknown Title')}</h3>
            <p className="artist-section-name">{String(currentTrack.artist || 'Unknown Artist')}</p>
            {currentTrack.album && (
              <p className="credits">Album: {String(currentTrack.album)}</p>
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
              {queue.map((track) => {
                
                // Ensure we have valid track data
                if (!track || typeof track !== 'object') {
                  return null;
                }
                
                // Create a safe track object with only the needed properties
                const safeTrack = {
                  _id: track._id || track.id,
                  id: track.id || track._id,
                  title: String(track.title || 'Unknown Title'),
                  artist: String(track.artist || 'Unknown Artist'),
                  album: track.album ? String(track.album) : undefined,
                  cover: track.cover || '/default-cover.jpg',
                  duration: track.duration,
                  actualDuration: track.actualDuration,
                  audioUrl: track.audioUrl,
                  albumId: track.albumId
                };
                
                return (
                  <QueueItem 
                    key={safeTrack._id || safeTrack.id} 
                    track={safeTrack} 
                    onClick={() => playTrack(track, true, true)}
                  />
                );
              })}
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
              <p className="song-title">{String(currentTrack.title || 'Unknown Title')}</p>
              <p className="song-artist">{String(currentTrack.artist || 'Unknown Artist')}</p>
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