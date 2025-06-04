'use client'
import Image from 'next/image';
import { useState, useCallback } from 'react';
// Corrected import path - make sure this matches your actual file structure
import NowPlayingPage from './components/NowPlaying/NowPlayingPage';
import RecentlyPlayed from './components/NowPlaying/RecentlyPlayed';

const initialRecentlyPlayed = [
  {
    id: 1,
    cover: 'https://i.scdn.co/image/ab67616d0000b273e6f407c7f3a0ec98845e4431',
    title: 'Peaches',
    artist: 'Justin Bieber'
  },
  {
    id: 2,
    cover: 'https://i.scdn.co/image/ab67616d0000b273e0450ba3fd83cf9048446477',
    title: 'Starboy',
    artist: 'The Weeknd'
  },
  {
    id: 3,
    cover: 'https://i.scdn.co/image/ab67616d0000b273d28d2ebdedb220e479743797',
    title: 'Money Trees',
    artist: 'Kendrick Lamar'
  },
  {
    id: 4,
    cover: 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5',
    title: 'Midnights',
    artist: 'Taylor Swift'
  },
  {
    id: 5,
    cover: 'https://i.scdn.co/image/ab67616d0000b2732a038d3bf875d23e4aeaa84e',
    title: 'Getting Older',
    artist: 'Billie Eilish'
  }
];

const MoreSongs = [
  {
    id: 1,
    cover: 'https://pickasso.spotifycdn.com/image/ab67c0de0000deef/dt/v1/img/daily/1/ab6761610000e5ebb99cacf8acd5378206767261/en',
    title: 'Lana Del Rey Mix',
    description: 'Your daily mix'
  },
  {
    id: 2,
    cover: 'https://pickasso.spotifycdn.com/image/ab67c0de0000deef/dt/v1/img/daily/2/ab6761610000e5ebc36dd9eb55fb0db4911f25dd/en',
    title: 'Bruno Mars Mix',
    description: 'Your daily mix'
  },
  {
    id: 3,
    cover: 'https://pickasso.spotifycdn.com/image/ab67c0de0000deef/dt/v1/img/daily/3/ab6761610000e5ebe672b5f553298dcdccb0e676/en',
    title: 'Taylor Swift Mix',
    description: 'Your daily mix'
  },
  {
    id: 4,
    cover: 'https://pickasso.spotifycdn.com/image/ab67c0de0000deef/dt/v1/img/daily/4/ab6761610000e5eb8ae7f2aaa9817a704a87ea36/en',
    title: 'Sabrina Carpenter Mix',
    description: 'Your daily mix'
  },
  {
    id: 5,
    cover: 'https://pickasso.spotifycdn.com/image/ab67c0de0000deef/dt/v1/img/daily/5/ab6761610000e5eb17af45f97f547e588f3903f6/en',
    title: 'PEDRO SAMPAIO Mix',
    description: 'Your daily mix'
  }
];

export default function DashboardPage() {
  const [recentlyPlayed, setRecentlyPlayed] = useState(initialRecentlyPlayed);
  
  const addToRecentlyPlayed = useCallback((track) => {
    setRecentlyPlayed(prev => {
      const normalizedTrack = {
        id: track.id,
        cover: track.cover,
        title: track.title,
        artist: track.artist
      };
    
      // Create new array without duplicates
      const filtered = prev.filter(t => t.id !== normalizedTrack.id);
      const newList = [normalizedTrack, ...filtered].slice(0, 8);
      return newList;
    });
  }, []);

  console.log('🎵 PARENT: Rendering DashboardPage, addToRecentlyPlayed function:', typeof addToRecentlyPlayed); // Debug log

  return (
    <div className="main-wrapper">
      <main className="main">
        <h1 className="welcome-heading">Welcome!</h1>

        {/* Pass the addToRecentlyPlayed function to NowPlayingPage */}
        <NowPlayingPage addToRecentlyPlayed={addToRecentlyPlayed} />
        <RecentlyPlayed recentlyPlayed={recentlyPlayed} />

        {/* More Songs Section */}
        <section className="section">
          <h2 className="section-heading">More Songs</h2>
          <div className="card-grid small-cards">
            {MoreSongs.map((mix) => (
              <div key={mix.id} className="music-card">
                <Image
                  src={mix.cover}
                  alt={mix.title}
                  width={150}
                  height={150}
                  className="mix-cover"
                />
                <p className="mix-title">{mix.title}</p>
                <p className="mix-description">{mix.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}