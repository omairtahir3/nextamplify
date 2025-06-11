'use client';
import Image from 'next/image';

export default function SongItem({ song, onAction, actionLabel, actionClass }) {
  return (
    <div className="song-item">
      <div className="song-image">
        <Image
          src={song.cover}
          alt={song.title}
          width={60}
          height={60}
          className="song-cover"
        />
      </div>
      <div className="song-info">
        <div className="song-title">{song.title}</div>
        <div className="song-details">
          <span className="song-artist">{song.artist}</span>
          <span className="song-album">{song.albumTitle}</span>
          <span className="song-duration">{song.duration}</span>
        </div>
      </div>
      <button 
        className={`action-btn ${actionClass}`}
        onClick={onAction}
        aria-label={`${actionLabel} ${song.title}`}
      >
        {actionLabel}
      </button>
    </div>
  );
}