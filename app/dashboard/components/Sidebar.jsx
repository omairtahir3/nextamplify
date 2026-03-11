'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/logout');
    if (typeof window !== 'undefined') {
      window.location.replace('/signin');
    }
  };

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <button 
        className={`mobile-menu-btn ${isOpen ? 'active' : ''}`} 
        onClick={toggleSidebar}
        aria-label="Toggle Menu"
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>
      
      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="logo-container">
          <Image
            src="https://cdn.pixabay.com/photo/2022/09/25/03/20/music-7477530_1280.png"
            alt="Amplify Logo"
            width={50}
            height={50}
            className="amplify-logo"
          />
          <h2>Amplify</h2>
        </div>
        <nav>
          <ul className="menu">
            <li><Link href="/dashboard" onClick={closeSidebar}>Home</Link></li>
            <li><Link href="/dashboard/playlists" onClick={closeSidebar}>Playlists</Link></li>
            <li><Link href="/dashboard/albums" onClick={closeSidebar}>Albums</Link></li>
            <li><Link href="/dashboard/artists" onClick={closeSidebar}>Artists</Link></li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="logout-link">Logout</a>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
