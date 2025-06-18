'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import NowPlayingPage from './components/NowPlaying/NowPlayingPage';
import Sidebar from './components/Sidebar';

// Helper function to safely get artist name
function getArtistName(artist) {
  if (!artist) return 'Unknown Artist';
  if (typeof artist === 'string') return artist;
  if (typeof artist === 'object' && artist.name) return artist.name;
  return 'Unknown Artist';
}

export default function DashboardPage() {
  const [randomAlbums, setRandomAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/albums');
        if (!response.ok) throw new Error('Failed to fetch albums');
        
        const albumsData = await response.json();
        
        // Process albums to ensure artist is always a string
        const processedAlbums = albumsData.map(album => ({
          ...album,
          artist: getArtistName(album.artist)
        }));

        // Get 5 random albums
        const getRandomAlbums = (albums, count = 5) => {
          const shuffled = [...albums].sort(() => 0.5 - Math.random());
          return shuffled.slice(0, count);
        };
        
        setRandomAlbums(getRandomAlbums(processedAlbums));
      } catch (err) {
        console.error('Error fetching albums:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  const handleAlbumClick = (albumId) => {
    router.push(`/dashboard/albums/${albumId}`);
  };

  if (isLoading) {
    return (
      <div className="main-wrapper">
        <Sidebar />
        <main className="main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading albums...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-wrapper">
        <Sidebar />
        <main className="main">
          <div className="error-container">
            <h3>Error loading albums</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="main-wrapper">
      <Sidebar />
      <main className="main">
        <h1 className="welcome-heading">Welcome!</h1>
        
        <NowPlayingPage showRecentlyPlayed={true} />
      
        <section className="section">
          <h2 className="section-heading">More Albums</h2>
          <div className="card-grid small-cards">
            {randomAlbums.map((album) => (
              <div 
                key={album._id || album.id} 
                className="music-card clickable-card"
                onClick={() => handleAlbumClick(album._id || album.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAlbumClick(album._id || album.id);
                  }
                }}
              >
                <Image
                  src={album.cover || '/default-album.jpg'}
                  alt={album.title || 'Album cover'}
                  width={150}
                  height={150}
                  className="album-cover"
                  onError={(e) => {
                    e.target.src = '/default-album.jpg';
                  }}
                />
                <div className="album-info">
                  <p className="album-title">{album.title || 'Untitled Album'}</p>
                  <p className="album-artist">{album.artist}</p>
                  <p className="album-tracks">
                    {album.tracks?.length || 0} {album.tracks?.length === 1 ? 'track' : 'tracks'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}