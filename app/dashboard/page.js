'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import NowPlayingPage from './components/NowPlaying/NowPlayingPage';
import Sidebar from './components/Sidebar';
import { albums } from './albums/data/albums'; // Import albums data

export default function DashboardPage() {
  const [randomAlbums, setRandomAlbums] = useState([]);
  const router = useRouter();

  // Get 5 random albums
  useEffect(() => {
    const getRandomAlbums = (count = 5) => {
      const shuffled = [...albums].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };
    
    setRandomAlbums(getRandomAlbums());
  }, []);

  // Handle album click
  const handleAlbumClick = (albumId) => {
    router.push(`/dashboard/albums/${albumId}`);
  };

  return (
    <div className="main-wrapper">
      <Sidebar />
      <main className="main">
        <h1 className="welcome-heading">Welcome!</h1>
        
        {/* NowPlayingPage handles its own state */}
        <NowPlayingPage showRecentlyPlayed={true} />
      
        {/* More Albums Section */}
        <section className="section">
          <h2 className="section-heading">More Albums</h2>
          <div className="card-grid small-cards">
            {randomAlbums.map((album) => (
              <div 
                key={album.id} 
                className="music-card clickable-card"
                onClick={() => handleAlbumClick(album.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAlbumClick(album.id);
                  }
                }}
              >
                <Image
                  src={album.cover}
                  alt={album.title}
                  width={150}
                  height={150}
                  className="album-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150';
                  }}
                />
                <div className="album-info">
                  <p className="album-title">{album.title}</p>
                  <p className="album-artist">{album.artist}</p>
                  <p className="album-tracks">{album.tracks.length} tracks</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
};