// app/dashboard/albums/[albumId]/page.js
'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { albums } from '../data/albums';

// Helper function to convert duration string to seconds
const durationToSeconds = (duration) => {
  const [minutes, seconds] = duration.split(':').map(Number);
  return minutes * 60 + seconds;
};

// Helper function to format total duration for display
const formatTotalDuration = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  } else if (minutes > 0) {
    return `${minutes} min ${seconds} sec`;
  }
  return `${seconds} sec`;
};

export default function AlbumPage({ params }) {
  const router = useRouter();
  const [currentTrack, setCurrentTrack] = useState(null);
  const album = albums.find(a => a.id === parseInt(params.albumId));

  // Calculate total album duration
  const totalDuration = useMemo(() => {
    if (!album) return '0:00';
    
    const totalSeconds = album.tracks.reduce((total, track) => {
      return total + durationToSeconds(track.duration);
    }, 0);
    
    return formatTotalDuration(totalSeconds);
  }, [album]);

  if (!album) {
    router.push('/dashboard/albums');
    return null;
  }

  const handleTrackSelect = (track) => {
    setCurrentTrack(track);
  };

  return (
    <div className="album-content">
      <div className="album-header">
        <div className="album-art">
          <Image
            src={album.cover}
            alt={album.title}
            width={300}
            height={300}
            className="album-cover"
          />
        </div>
        <div className="album-info">
          <h1 className="album-title">{album.title}</h1>
          <p className="album-artist">{album.artist}</p>
          <div className="album-meta">
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
        
        {album.tracks.map((track) => (
          <div 
            key={track.id} 
            className={`track-item ${currentTrack?.id === track.id ? 'active' : ''}`}
            onClick={() => handleTrackSelect(track)}
          >
            <div className="track-number">{track.id}</div>
            <div className="track-title">{track.title}</div>
            <div className="track-duration">{track.duration}</div>
            <i className="fas fa-play track-play-icon"></i>
          </div>
        ))}
      </div>
    </div>
  );
}