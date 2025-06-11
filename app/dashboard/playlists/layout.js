'use client';
import { PlaylistsProvider } from './PlaylistsContext';
import Sidebar from '../components/Sidebar';
import './globals.css';
export default function PlaylistsLayout({ children }) {
  return (
    <PlaylistsProvider>
      <div className="playlists-layout">
        <Sidebar />
        <main className="playlists-content">
          {children}
        </main>
      </div>
    </PlaylistsProvider>
  );
}