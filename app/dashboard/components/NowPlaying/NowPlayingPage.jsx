'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import ArtistInfo from './ArtistInfo';
import QueueItem from './QueueItem';

export default function NowPlayingPage({ addToRecentlyPlayed }) {
  console.log('🎵 CHILD: NowPlayingPage received addToRecentlyPlayed:', typeof addToRecentlyPlayed);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  
  // Initial track data
  const initialTracks = [
    {
      id: 1,
      cover: 'https://i.scdn.co/image/ab67616d0000b273e6f407c7f3a0ec98845e4431',
      title: 'Peaches',
      artist: 'Justin Bieber',
      duration: '3:21',
      actualDuration: 201,
    },
    {
      id: 6,
      cover: 'https://i.scdn.co/image/ab67616d0000b27341e31d6ea1d493dd77933ee5',
      title: 'Stay',
      artist: 'The Kid LAROI, Justin Bieber',
      duration: '2:21',
      actualDuration: 141,
    },
    {
      id: 7,
      cover: 'https://i.scdn.co/image/ab67616d0000b2736036cfd2a718036fc523855f',
      title: 'Ghost',
      artist: 'Justin Bieber',
      duration: '2:33',
      actualDuration: 153,
    },
    {
      id: 8,
      cover: 'https://i.scdn.co/image/ab67616d0000b27308e30ab6a058429303d75876',
      title: 'Intentions',
      artist: 'Justin Bieber ft. Quavo',
      duration: '3:32',
      actualDuration: 212,
    }
  ];

  const [recentlyPlayedHistory, setRecentlyPlayedHistory] = useState([]);
  const [queue, setQueue] = useState(initialTracks.slice(1));
  const [currentTrack, setCurrentTrack] = useState(initialTracks[0]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Artist data
  const artistData = {
    image: 'https://i.scdn.co/image/ab6761610000e5eb8ae7f2aaa9817a704a87ea36',
    name: 'Justin Bieber',
    listeners: '75.4M monthly listeners',
    followers: '57.5M followers',
    bio: `Justin Drew Bieber is a Canadian singer, songwriter and multi-instrumentalist. 
          Discovered at age 13 by talent manager Scooter Braun after he had seen his 
          YouTube cover song videos. Bieber quickly rose to fame with his debut EP 
          "My World" in 2009, and has since become one of the world's best-selling 
          music artists.`
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const playNextSong = useCallback(() => {
    console.log('🎵 CHILD: playNextSong called, queue length:', queue.length);
    if (queue.length === 0) return;

    // Add current track to recently played BEFORE changing it
    if (addToRecentlyPlayed && currentTrack) {
      console.log('🎵 CHILD: Adding current track to recently played (next):', currentTrack.title);
      addToRecentlyPlayed(currentTrack);
    } else {
      console.log('🎵 CHILD: NOT adding to recently played. addToRecentlyPlayed:', typeof addToRecentlyPlayed, 'currentTrack:', currentTrack?.title);
    }

    setRecentlyPlayedHistory(prev => [...prev, currentTrack]);
    setCurrentTrack(queue[0]);
    setQueue(prev => prev.slice(1));
    setProgress(0);
    setCurrentTime('0:00');
  }, [queue, currentTrack, addToRecentlyPlayed]);

  // Play previous song
  const playPrevSong = () => {
    if (recentlyPlayedHistory.length === 0) return;
    
    // Add current track to recently played BEFORE changing it
    if (addToRecentlyPlayed && currentTrack) {
      console.log('Adding current track to recently played (prev):', currentTrack.title);
      addToRecentlyPlayed(currentTrack);
    }
    
    // Set last played track as current
    const prevTrack = recentlyPlayedHistory[recentlyPlayedHistory.length - 1];
    setCurrentTrack(prevTrack);
    
    // Remove from history
    setRecentlyPlayedHistory(prev => prev.slice(0, -1));
    
    // Reset progress
    setProgress(0);
    setCurrentTime('0:00');
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Simulate progress when playing
  useEffect(() => {
    let interval;
    
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 0.5;
          
          // Calculate current time based on track duration
          const currentSeconds = Math.floor((newProgress / 100) * currentTrack.actualDuration);
          setCurrentTime(formatTime(currentSeconds));
          
          // Update duration
          setDuration(currentTrack.duration);
          
          // Automatically play next song when track ends
          if (newProgress >= 100) {
            playNextSong();
          }
          
          return newProgress;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, progress, currentTrack, playNextSong]);

  // Update duration when track changes - but don't add to recently played here
  useEffect(() => {
    setDuration(currentTrack.duration);
    setProgress(0);
    setCurrentTime('0:00');
    
    // Only skip adding to recently played on the very first load
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [currentTrack]);

  // Don't add initial track to recently played since it's already there

  return (
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
          <p className="artist-name">{currentTrack.artist}</p>
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

        <ArtistInfo artist={artistData} />
      
        <div className="queue-section">
          <h3>Next in Queue</h3>
          <ul className="queue-list">
            {queue.map((track) => (
              <QueueItem key={track.id} track={track} />
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
            <button className="play-pause"
              onClick={togglePlayPause}>
              <i className={`fa-solid fa-${isPlaying ? 'pause' : 'play'}`} />
            </button>
            <button onClick={playNextSong}><i className="fa-solid fa-forward" /></button>
          </div>
          <div className="progress-bar">
            <span>{currentTime}</span>
            <div className="bar">
              <div className="fill" style={{ width: `${progress}%` }} />
            </div>
            <span>{duration}</span>
          </div>
        </div>

        <div className="now-playing-right">
          <button>🔊</button>
        </div>
      </div>
    </section>
  );
}