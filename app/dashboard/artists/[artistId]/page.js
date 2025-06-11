'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { artists } from '../data/artists';
import { albums } from '../../albums/data/albums';
import NowPlayingPage from '../../components/NowPlaying/NowPlayingPage';
import Sidebar  from '../../components/Sidebar';
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
    <div className="artist-content">
      <Sidebar />
      <div className="artist-header">
        <div className="artist-image-container">
          <Image
            src={artist.image}
            alt={artist.name}
            width={300}
            height={300}
            className="artist-image"
          />
        </div>
        <div className="artist-info">
          <h1 className="artist-name">{artist.name}</h1>
          <p className="artist-followers">{artist.followers} followers</p>
          <div className="artist-genres">
            {artist.genres.join(' • ')}
          </div>
          <div className="artist-description">
            <p>{artist.description}</p>
          </div>
        </div>
      </div>

      <div className="artist-albums-section">
        <h2 className="section-title">Albums</h2>
        <div className="artist-albums-grid">
          {artistAlbums.map((album) => (
            <Link 
              key={album.id} 
              href={`/dashboard/albums/${album.id}`}
              className="artist-album-card"
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
                <p className="album-year">{album.year}</p>
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