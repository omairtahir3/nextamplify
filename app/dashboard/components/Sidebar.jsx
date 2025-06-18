'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const router = useRouter();

const handleLogout = async () => {
  await fetch('/api/logout');
  if (typeof window !== 'undefined') {
    window.location.replace('/signin');
  }
};

  return (
    <aside className="sidebar">
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
          <li><Link href="/dashboard">Home</Link></li>
          <li><Link href="/dashboard/playlists">Playlists</Link></li>
          <li><Link href="/dashboard/albums">Albums</Link></li>
          <li><Link href="/dashboard/artists">Artists</Link></li>
          <li>
            <a href="#" onClick={handleLogout} className="logout-link">Logout</a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
