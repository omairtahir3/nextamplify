'use client';
import { PlaylistsProvider } from './PlaylistsContext';
import './globals.css';
export default function PlaylistsLayout({ children }) {
  return (
    <PlaylistsProvider>
      <main className="playlists-content">
        {children}
      </main>
    </PlaylistsProvider>
  );
}