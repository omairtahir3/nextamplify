'use client';
import { useRouter } from 'next/navigation';
import { usePlaylists } from '../PlaylistsContext';
import SongItem from '../components/SongItem';
import { use, useEffect, useMemo } from 'react';
import NowPlayingPage from '../../components/NowPlaying/NowPlayingPage';
import { albums } from '../../albums/data/albums';

// Helper function to convert duration string to seconds (moved to top)
const convertDurationToSeconds = (duration) => {
  if (!duration) return 0;
  const [mins, secs] = duration.split(':').map(Number);
  return mins * 60 + secs;
};

export default function PlaylistDetailPage({ params }) {
  const router = useRouter();
  const { getPlaylist, allSongs, addSongToPlaylist, removeSongFromPlaylist } = usePlaylists();
  const { playlistId } = use(params);
  const playlist = getPlaylist(playlistId);

  // Get all tracks from albums - moved BEFORE conditional logic
  const allTracks = useMemo(() => {
    return albums.flatMap(album => 
      album.tracks.map(track => ({
        ...track,
        // Create unique ID by combining album ID and track ID
        uniqueId: `${album.id}-${track.id}`,
        artist: album.artist,
        actualDuration: convertDurationToSeconds(track.duration),
        cover: album.cover,
        albumTitle: album.title
      }))
    );
  }, []);

  // Get songs not in the playlist - also moved before conditional logic
  const availableSongs = useMemo(() => {
    if (!playlist) return [];
    return allTracks.filter(
      song => !playlist.songs.some(s => s.uniqueId === song.uniqueId || s.id === song.id)
    );
  }, [allTracks, playlist]);

  // Handle redirect if playlist is not found
  useEffect(() => {
    if (!playlist) {
      router.push('/dashboard/playlists');
    }
  }, [playlist, router]);

  // Early return AFTER all hooks have been called
  if (!playlist) {
    return null;
  }

  // Handle song click to play in NowPlayingPage
  const handleSongClick = (song) => {
    const track = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      duration: song.duration,
      actualDuration: song.actualDuration || convertDurationToSeconds(song.duration),
      cover: song.cover,
      album: song.album || song.albumTitle,
      features: song.features || [],
      audioUrl: song.audioUrl 
    };
    
    
    const playTrackEvent = new CustomEvent('playTrack', { detail: track });
    window.dispatchEvent(playTrackEvent);
  };

  const plusIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="icon">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );

  const minusIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="icon">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
    </svg>
  );

  return (
    <div className="playlist-detail">
      <div className="playlist-header">
        <h1>{playlist.name}</h1>
        <p>{playlist.songs.length} songs</p>
      </div>

      <div className="playlist-content">
        <div className="playlist-songs">
          <h2>Songs in Playlist</h2>

          {playlist.songs.length === 0 ? (
            <div className="empty-state">
              <p>No songs in this playlist yet.</p>
              <p>Add songs from the available list below.</p>
            </div>
          ) : (
            <div className="songs-list">
              {playlist.songs.map(song => (
                <div 
                  key={song.uniqueId || song.id} 
                  onClick={() => handleSongClick(song)} 
                  className="song-item-clickable"
                  style={{ cursor: 'pointer' }}
                >
                  <SongItem
                    song={song}
                    onAction={(e) => {
                      e.stopPropagation();
                      removeSongFromPlaylist(playlist.id, song.id);
                    }}
                    actionLabel={minusIcon}
                    actionClass="remove-btn"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="available-songs">
          <h2>Available Songs</h2>

          {availableSongs.length === 0 ? (
            <div className="empty-state">
              <p>All songs have been added to this playlist.</p>
            </div>
          ) : (
            <div className="songs-list">
              {availableSongs.map(song => (
                <SongItem
                  key={song.uniqueId || song.id}
                  song={song}
                  onAction={() => addSongToPlaylist(playlist.id, song)}
                  actionLabel={plusIcon}
                  actionClass="add-btn"
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <NowPlayingPage showRecentlyPlayed={false} />
    </div>
  );
}