'use client';
import { useRouter } from 'next/navigation';
import { usePlaylists } from '../PlaylistsContext';
import SongItem from '../components/SongItem';
import { useEffect, useMemo, useState, use } from 'react';
import NowPlayingPage from '../../components/NowPlaying/NowPlayingPage';

const convertDurationToSeconds = (duration) => {
  if (!duration) return 0;
  if (typeof duration === 'number') return duration;
  const [mins, secs] = duration.toString().split(':').map(Number);
  return mins * 60 + secs;
};

const generateFallbackId = (prefix = '') => 
  `${prefix}${Math.random().toString(36).substr(2, 9)}`;

export default function PlaylistDetailPage({ params }) {
  const router = useRouter();
  const { playlistId } = use(params);
  const { getPlaylist, addSongToPlaylist, removeSongFromPlaylist } = usePlaylists();
  const playlist = getPlaylist(playlistId);
  
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tracks, albums and artists data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [tracksRes, albumsRes, artistsRes] = await Promise.all([
          fetch('/api/tracks').then(res => {
            if (!res.ok) throw new Error('Failed to fetch tracks');
            return res.json();
          }),
          fetch('/api/albums').then(res => {
            if (!res.ok) throw new Error('Failed to fetch albums');
            return res.json();
          }),
          fetch('/api/artists').then(res => {
            if (!res.ok) throw new Error('Failed to fetch artists');
            return res.json();
          })
        ]);
        
        setTracks(tracksRes || []);
        setAlbums(albumsRes || []);
        setArtists(artistsRes || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Process all tracks with proper artist and album information
  const allTracks = useMemo(() => {
    // Debug: Log the first track to see the structure
    if (tracks.length > 0) {
      console.log('First track structure:', tracks[0]);
      console.log('First album structure:', albums.length > 0 ? albums[0] : 'No albums');
      console.log('First artist structure:', artists.length > 0 ? artists[0] : 'No artists');
    }
    
    return tracks.map(track => {
      // Create a guaranteed unique ID
      const trackId = track._id || track.id || generateFallbackId(`track-`);
      
      // Handle album data - could be populated object or just ID
      let album = null;
      let albumId = null;
      let albumTitle = 'Unknown Album';
      let albumCover = '/default-cover.jpg';
      
      if (track.album) {
        if (typeof track.album === 'object') {
          // Album is populated
          album = track.album;
          albumId = album._id || album.id;
          albumTitle = album.title || 'Unknown Album';
          albumCover = album.cover || '/default-cover.jpg';
        } else {
          // Album is just an ID, find it in albums array
          albumId = track.album;
          album = albums.find(a => (a._id === albumId || a.id === albumId));
          if (album) {
            albumTitle = album.title || 'Unknown Album';
            albumCover = album.cover || '/default-cover.jpg';
          }
        }
      }
      
      // Handle artist data - could be populated through album or need to be found
      let artist = null;
      let artistId = null;
      let artistName = 'Unknown Artist';
      
      if (album) {
        if (typeof album.artist === 'object') {
          // Artist is populated in the album
          artist = album.artist;
          artistId = artist._id || artist.id;
          artistName = artist.name || 'Unknown Artist';
        } else if (album.artist) {
          // Artist is just an ID, find it in artists array
          artistId = album.artist;
          artist = artists.find(a => (a._id === artistId || a.id === artistId));
          if (artist) {
            artistName = artist.name || 'Unknown Artist';
          }
        }
      }
      
      // Debug: Log processed track info for first few tracks
      if (tracks.indexOf(track) < 2) {
        console.log(`Processed track ${tracks.indexOf(track)}:`, {
          title: track.title,
          albumTitle,
          artistName,
          cover: albumCover
        });
      }
      
      return {
        ...track,
        id: trackId,
        uniqueId: trackId,
        // Artist information
        artist: artistName,
        artistId: artistId,
        // Album information
        albumTitle: albumTitle,
        albumId: albumId,
        cover: albumCover,
        // Ensure required fields
        title: track.title || 'Unknown Title',
        duration: track.duration || '0:00',
        actualDuration: convertDurationToSeconds(track.duration),
        audioUrl: track.audioUrl || ''
      };
    });
  }, [tracks, albums, artists]);

  // Get songs not in the playlist
  const availableSongs = useMemo(() => {
    if (!playlist || isLoading) return [];
    return allTracks.filter(
      song => !playlist.songs.some(s => s.id === song.id || s.uniqueId === song.uniqueId)
    );
  }, [allTracks, playlist, isLoading]);

  useEffect(() => {
    if (!isLoading && !playlist && !error) {
      router.push('/dashboard/playlists');
    }
  }, [playlist, isLoading, router, error]);

  const handleSongClick = (song) => {
    const track = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      duration: song.duration,
      actualDuration: song.actualDuration,
      cover: song.cover,
      album: song.album || song.albumTitle,
      audioUrl: song.audioUrl,
      albumId: song.albumId
    };
    
    window.dispatchEvent(new CustomEvent('playTrack', { detail: track }));
  };

  // Handle adding song to playlist with better error handling
  const handleAddSongToPlaylist = async (song) => {
    try {
      // For localStorage playlists, use playlist.id (not _id)
      if (!playlist?.id) {
        console.error('Playlist object:', playlist);
        throw new Error('Playlist ID is missing');
      }
      
      if (!song?.id) {
        throw new Error('Song ID is missing');
      }

      // Create a clean song object with all required fields
      const songToAdd = {
        id: song.id,
        uniqueId: song.uniqueId || song.id,
        title: song.title || 'Unknown Title',
        artist: song.artist || 'Unknown Artist',
        artistId: song.artistId, // Include artist ID if available
        duration: song.duration || '0:00',
        actualDuration: song.actualDuration || 0,
        cover: song.cover || '/default-cover.jpg',
        album: song.albumTitle || song.album || 'Unknown Album',
        albumId: song.albumId,
        audioUrl: song.audioUrl
      };

      console.log('Adding song to playlist:', {
        playlistId: playlist.id,
        song: songToAdd
      });

      addSongToPlaylist(playlist.id, songToAdd);
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      alert(`Failed to add song: ${error.message}`);
    }
  };

  // Memoized icons to prevent unnecessary re-renders
  const plusIcon = useMemo(() => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="icon">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ), []);

  const minusIcon = useMemo(() => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="icon">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
    </svg>
  ), []);

  if (isLoading) {
    return (
      <div className="loading-state">
        <p>Loading playlist data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>Error loading playlist: {error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!playlist) {
    return null;
  }

  return (
    <div className="playlist-detail">
      <div className="playlist-header">
        <h1>{playlist.name}</h1>
        <p>{playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}</p>
      </div>

      <div className="playlist-content">
        <div className="playlist-songs">
          <h2>Songs in Playlist</h2>
          {playlist.songs.length === 0 ? (
            <div className="empty-state">
              <p>No songs in this playlist yet.</p>
            </div>
          ) : (
            <div className="songs-list">
              {playlist.songs.map(song => {
                const songKey = song.id || song.uniqueId || generateFallbackId('playlist-song-');
                
                return (
                  <div 
                    key={songKey}
                    onClick={() => handleSongClick(song)}
                    className="song-item-clickable"
                  >
                    <SongItem
                      song={{
                        ...song,
                        cover: song.cover || '/default-cover.jpg',
                        artist: song.artist || 'Unknown Artist'
                      }}
                      onAction={(e) => {
                        e.stopPropagation();
                        removeSongFromPlaylist(playlist.id, song.id);
                      }}
                      actionLabel={minusIcon}
                      actionClass="remove-btn"
                    />
                  </div>
                );
              })}
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
              {availableSongs.map(song => {
                const songKey = song.id || song.uniqueId || generateFallbackId('available-song-');
                
                return (
                  <SongItem
                    key={songKey}
                    song={song}
                    onAction={() => handleAddSongToPlaylist(song)}
                    actionLabel={plusIcon}
                    actionClass="add-btn"
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
      <NowPlayingPage showRecentlyPlayed={false} />
    </div>
  );
}