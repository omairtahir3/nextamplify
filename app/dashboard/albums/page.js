'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { albums } from './data/albums';
import NowPlayingPage from '../components/NowPlaying/NowPlayingPage';
import Sidebar  from '../components/Sidebar';
export default function AlbumsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredAlbum, setHoveredAlbum] = useState(null);
  
  const filteredAlbums = albums.filter(album => 
    album.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    album.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="albums-container">
        <div className="albums-header">
          <h1 className="text-3xl font-bold">Albums</h1>
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search albums"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-icon">
              <i className="fa-solid fa-magnifying-glass search-icon"></i>
            </span>
          </div>
        </div>
        
        <div className="albums-grid">
          {filteredAlbums.map((album) => (
            <Link 
              key={album.id} 
              href={`/dashboard/albums/${album.id}`}
              className="album-card"
              onMouseEnter={() => setHoveredAlbum(album.id)}
              onMouseLeave={() => setHoveredAlbum(null)}
            >
              <div className="album-image-container">
                <Image
                  src={album.cover}
                  alt={album.title}
                  width={200}
                  height={200}
                  className="album-cover"
                />
                
                {/* Play button appears only on hover */}
                {hoveredAlbum === album.id && (
                  <div 
                    className="play-button"
                    onClick={(e) => {
                      // Removed preventDefault to allow navigation
                      console.log('Play album:', album.title);
                    }}
                  >
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="11" strokeWidth="1"/>
                      <path d="M9 7L17 12L9 17V7Z"/>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="album-info">
                <h3 className="album-title">{album.title}</h3>
                <p className="album-artist">{album.artist}</p>
                <div className="album-meta">
                  <span>{album.year}</span>
                  <span>•</span>
                  <span>{album.tracks.length} songs</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <NowPlayingPage showRecentlyPlayed={false} />
    </div>
  );
}