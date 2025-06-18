'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import NowPlayingPage from '../components/NowPlaying/NowPlayingPage';
import Sidebar from '../components/Sidebar';

export default function ArtistsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const res = await fetch('/api/artists');
        const data = await res.json();
        setArtists(data);
      } catch (error) {
        console.error('Failed to fetch artists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  console.log(artists);
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

        {loading ? (
          <p>Loading artists...</p>
        ) : (
          <div className="artists-grid">
            {filteredArtists.map((artist) => (
              <Link
                key={artist._id}
                href={`/dashboard/artists/${artist._id}`}
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
                  <div className="artist-genres">
                    {artist.genres?.join(' • ')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <NowPlayingPage showRecentlyPlayed={false} />
    </div>
  );
}
