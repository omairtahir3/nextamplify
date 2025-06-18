'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import NowPlayingPage from '../components/NowPlaying/NowPlayingPage';
import Sidebar from '../components/Sidebar';

export default function AlbumsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredAlbum, setHoveredAlbum] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await fetch('/api/albums');
        if (!res.ok) throw new Error('Failed to fetch albums');
        const data = await res.json();
        setAlbums(data);
      } catch (error) {
        console.error('Error fetching albums:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  const filteredAlbums = albums.filter(album =>
    album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (album.artist?.name || album.artist || '').toLowerCase().includes(searchQuery.toLowerCase())
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

        {loading ? (
          <p>Loading albums...</p>
        ) : (
          <div className="albums-grid">
            {filteredAlbums.map((album) => (
              <Link
                key={album._id}
                href={`/dashboard/albums/${album._id}`}
                className="album-card"
                onMouseEnter={() => setHoveredAlbum(album._id)}
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
                  {hoveredAlbum === album._id && (
                    <div
                      className="play-button"
                      onClick={(e) => {
                        console.log('Play album:', album.title);
                      }}
                    >
                      <svg className="album-detail-playbtn" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="11" strokeWidth="1" />
                        <path d="M9 7L17 12L9 17V7Z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="album-info">
                  <h3 className="album-title">{album.title}</h3>
                  <p className="album-artist">{album.artist?.name || album.artist}</p>
                  <div className="album-meta">
                    <span>{album.year}</span>
                    <span>•</span>
                    <span>{album.tracks?.length || 0} songs</span>
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
