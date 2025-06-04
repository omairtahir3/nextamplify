'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { albums } from './data/albums';

export default function AlbumsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredAlbums = albums.filter(album => 
    album.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    album.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-container">
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
            >
              <div className="album-image-container">
                <Image
                  src={album.cover}
                  alt={album.title}
                  width={200}
                  height={200}
                  className="album-cover"
                />
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
    </div>
  );
}