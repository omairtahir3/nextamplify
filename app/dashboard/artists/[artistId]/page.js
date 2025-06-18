'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { artists } from '../data/artists';
import { albums } from '../../albums/data/albums';
import NowPlayingPage from '../../components/NowPlaying/NowPlayingPage';
import Sidebar from '../../components/Sidebar';
import { use } from 'react';

export default function ArtistPage({ params: paramsPromise }) {
  const router = useRouter();
  const params = use(paramsPromise);
  const artist = artists.find(a => a.id === parseInt(params.artistId));
  const artistAlbums = albums.filter(album => artist.albums.includes(album.id));

  // Set document title to artist name
  useEffect(() => {
    if (artist) {
      document.title = `Amplify - ${artist.name}`;
    }
  }, [artist]);

  if (!artist) {
    router.push('/dashboard/artists');
    return null;
  }

  return (
    <div className="artist-detail-content">
      <Sidebar />
      <div className="artist-detail-header">
        <div className="artist-detail-image-container">
          <Image
            src={artist.image}
            alt={artist.name}
            width={300}
            height={300}
            className="artist-detail-image"
          />
        </div>
        <div className="artist-detail-info">
          <h1 className="artist-detail-name">{artist.name}</h1>
          <p className="artist-detail-followers">{artist.followers} followers</p>
          <div className="artist-detail-genres">
            {artist.genres.join(' • ')}
          </div>
          <div className="artist-detail-description">
            <p>{artist.description}</p>
          </div>
        </div>
      </div>

      <div className="artist-detail-albums-section">
        <h2 className="artist-detail-section-title">Albums</h2>
        <div className="artist-detail-albums-grid">
          {artistAlbums.map((album) => (
            <Link 
              key={album.id} 
              href={`/dashboard/albums/${album.id}`}
              className="artist-detail-album-card"
            >
              <div className="artist-detail-album-image-container">
                <Image
                  src={album.cover}
                  alt={album.title}
                  width={200}
                  height={200}
                  className="artist-detail-album-cover"
                />
              </div>
              <div className="artist-detail-album-info">
                <h3 className="artist-detail-album-title">{album.title}</h3>
                <p className="artist-detail-album-year">{album.year}</p>
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