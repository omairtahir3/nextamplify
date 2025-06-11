'use client'
import { useState } from 'react';
import Image from 'next/image';
import NowPlayingPage from './components/NowPlaying/NowPlayingPage';
import Sidebar from './components/Sidebar';
// More Songs data
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
  return (
    <div className="main-wrapper">
      <Sidebar />
      <main className="main">
        <h1 className="welcome-heading">Welcome!</h1>
        
        {/* NowPlayingPage handles its own state */}
        <NowPlayingPage showRecentlyPlayed= {true} />
      
        {/* More Songs Section */}
        <section className="section">
          <h2 className="section-heading">More Albums</h2>
          <div className="card-grid small-cards">
            {MoreSongs.map((mix) => (
              <div key={mix.id} className="music-card">
                <Image
                  src={mix.cover}
                  alt={mix.title}
                  width={150}
                  height={150}
                  className="mix-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150';
                  }}
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