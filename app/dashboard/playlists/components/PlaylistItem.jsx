'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function PlaylistItem({ playlist, onDelete }) {
  return (
    <div className="playlist-card">
      <Link href={`/dashboard/playlists/${playlist.id}`}>
        <div className="playlist-image">
          {playlist.songs.length > 0 ? (
            <Image
              src={playlist.songs[0].cover}
              alt={playlist.name}
              width={200}
              height={200}
              className="playlist-cover"
            />
          ) : (
            <div className="empty-playlist">
              <i className="fas fa-music"></i>
            </div>
          )}
        </div>
        <div className="playlist-info">
          <h3>{playlist.name}</h3>
          <p>{playlist.songs.length} songs</p>
        </div>
      </Link>
      <button 
        className="delete-playlist-btn"
        onClick={() => onDelete(playlist.id)}
        aria-label={`Delete playlist ${playlist.name}`}
      >
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );
}