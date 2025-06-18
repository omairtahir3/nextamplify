'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NowPlayingPage from '../../components/NowPlaying/NowPlayingPage';
import Sidebar from '../../components/Sidebar';

export default function ArtistPage({ params }) {
  const router = useRouter();
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchArtistAndAlbums() {
      try {
        const artistId = params?.artistId;
        
        if (!artistId) {
          setError('No artist ID provided');
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        
        const res = await fetch(`/api/artists/${artistId}`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch artist: ${res.status} ${res.statusText}`);
        }
        
        const artistData = await res.json();
        
        if (!artistData) {
          throw new Error('No artist data received');
        }

        setArtist(artistData);
        setAlbums(artistData.albums || []);
        
        if (typeof document !== 'undefined' && artistData.name) {
          document.title = `Amplify - ${artistData.name}`;
        }
      } catch (error) {
        console.error('Error loading artist:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchArtistAndAlbums();
  }, [params, router]);

  // Handle loading state
  if (loading) {
    return (
      <div className="artist-detail-content">
        <Sidebar />
        <div className="loading-container">
          <p>Loading artist...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="artist-detail-content">
        <Sidebar />
        <div className="error-container">
          <p>Error: {error}</p>
          <button onClick={() => router.push('/dashboard/artists')}>
            Back to Artists
          </button>
        </div>
      </div>
    );
  }

  // Handle no artist found
  if (!artist) {
    return (
      <div className="artist-detail-content">
        <Sidebar />
        <div className="not-found-container">
          <p>Artist not found</p>
          <button onClick={() => router.push('/dashboard/artists')}>
            Back to Artists
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="artist-detail-content">
      <Sidebar />

      <div className="artist-detail-header">
        <div className="artist-detail-image-container">
          {artist.image ? (
            <Image
              src={artist.image}
              alt={artist.name || 'Artist'}
              width={300}
              height={300}
              className="artist-detail-image"
              onError={(e) => {
                console.error('Error loading artist image:', e);
                // Optionally set a fallback image
                // e.target.src = '/fallback-artist-image.jpg';
              }}
            />
          ) : (
            <div className="artist-detail-image-placeholder">
              No Image Available
            </div>
          )}
        </div>
        
        <div className="artist-detail-info">
          <h1 className="artist-detail-name">{artist.name || 'Unknown Artist'}</h1>
          
          
          {artist.genres && artist.genres.length > 0 && (
            <div className="artist-detail-genres">
              {artist.genres.join(' • ')}
            </div>
          )}
          
          {artist.description && (
            <div className="artist-detail-description">
              <p>{artist.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="artist-detail-albums-section">
        <h2 className="artist-detail-section-title">Albums</h2>
        
        {albums && albums.length > 0 ? (
          <div className="artist-detail-albums-grid">
            {albums.map((album) => (
              <Link
                key={album._id || album.id || Math.random()}
                href={`/dashboard/albums/${album._id || album.id}`}
                className="artist-detail-album-card"
              >
                <div className="artist-detail-album-image-container">
                  {album.cover ? (
                    <Image
                      src={album.cover}
                      alt={album.title || 'Album'}
                      width={200}
                      height={200}
                      className="artist-detail-album-cover"
                      onError={(e) => {
                        console.error('Error loading album cover:', e);
                      }}
                    />
                  ) : (
                    <div className="album-cover-placeholder">
                      No Cover
                    </div>
                  )}
                </div>
                
                <div className="artist-detail-album-info">
                  <h3 className="artist-detail-album-title">
                    {album.title || 'Untitled Album'}
                  </h3>
                  {album.year && (
                    <p className="artist-detail-album-year">{album.year}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-albums-message">
            <p>No albums available for this artist.</p>
          </div>
        )}
      </div>

      <NowPlayingPage showRecentlyPlayed={false} />
    </div>
  );
}