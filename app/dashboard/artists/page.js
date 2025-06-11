// app/dashboard/artists/page.js
'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { artists } from './data/artists';
import NowPlayingPage from '../components/NowPlaying/NowPlayingPage';
import Sidebar  from '../components/Sidebar';
export default function ArtistsPage() {
  const [searchQuery, setSearchQuery] = useState('');
     
  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="artists-container">
        <div className="artists-header">
          <h1 className="text-3xl font-bold">Artists</h1>
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search artists"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-icon">
              <i className="fa-solid fa-magnifying-glass search-icon"></i>
            </span>
          </div>
        </div>
                
        <div className="artists-grid">
          {filteredArtists.map((artist) => (
            <Link 
              key={artist.id}
              href={`/dashboard/artists/${artist.id}`}
              className="artist-card"
            >
              <div className="artist-image-container">
                <Image
                  src={artist.image}
                  alt={artist.name}
                  width={200}
                  height={200}
                  className="artist-image"
                />
              </div>
                            
              <div className="artist-info">
                <h3 className="artist-name">{artist.name}</h3>
                <p className="artist-followers">{artist.followers} followers</p>
                <div className="artist-genres">
                  {artist.genres.join(' • ')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Add NowPlayingPage without RecentlyPlayed section */}
      <NowPlayingPage showRecentlyPlayed={false} />
    </div>
  );
}