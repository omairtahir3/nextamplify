'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const PlaylistsContext = createContext();

export function usePlaylists() {
  const context = useContext(PlaylistsContext);
  if (!context) {
    throw new Error('usePlaylists must be used within a PlaylistsProvider');
  }
  return context;
}

const convertDurationToSeconds = (duration) => {
  if (!duration) return 0;
  if (typeof duration === 'number') return duration;
  const [mins, secs] = duration.toString().split(':').map(Number);
  return mins * 60 + secs;
};

const generateFallbackId = (prefix = '') => 
  `${prefix}${Math.random().toString(36).substr(2, 9)}`;

export function PlaylistsProvider({ children }) {
  const [playlists, setPlaylists] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/me');
      if (!res.ok) return null;
      const user = await res.json();
      setCurrentUser(user);
      return user;
    } catch (err) {
      console.error('Error fetching current user:', err);
      return null;
    }
  };

  // Fetch data from APIs
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
      
      return { tracks: tracksRes || [], albums: albumsRes || [], artists: artistsRes || [] };
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch playlists from API (per-user)
  const fetchPlaylists = async () => {
    try {
      const res = await fetch('/api/playlists');
      if (!res.ok) {
        if (res.status === 401) {
          console.warn('Not authenticated, no playlists loaded');
          return [];
        }
        throw new Error('Failed to fetch playlists');
      }
      const data = await res.json();
      setPlaylists(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error('Error fetching playlists:', err);
      return [];
    }
  };

  // Process tracks with proper artist and album information
  const processAllSongs = (tracksData, albumsData, artistsData) => {
    return tracksData.map(track => {
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
          album = albumsData.find(a => (a._id === albumId || a.id === albumId));
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
          artist = artistsData.find(a => (a._id === artistId || a.id === artistId));
          if (artist) {
            artistName = artist.name || 'Unknown Artist';
          }
        }
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
  };

  // Helper to process populated playlist songs for display
  const processPlaylistSongs = (playlist, albumsData, artistsData) => {
    if (!playlist || !playlist.songs) return [];
    return playlist.songs.map(song => {
      // song may be a populated Track object or just an ID
      if (typeof song === 'string') return { id: song, title: 'Unknown' };
      
      const trackId = song._id || song.id || generateFallbackId('track-');
      let albumTitle = 'Unknown Album';
      let albumCover = '/default-cover.jpg';
      let artistName = 'Unknown Artist';
      let albumId = null;
      let artistId = null;

      if (song.album) {
        if (typeof song.album === 'object') {
          albumTitle = song.album.title || 'Unknown Album';
          albumCover = song.album.cover || '/default-cover.jpg';
          albumId = song.album._id || song.album.id;
          if (song.album.artist) {
            if (typeof song.album.artist === 'object') {
              artistName = song.album.artist.name || 'Unknown Artist';
              artistId = song.album.artist._id || song.album.artist.id;
            } else {
              artistId = song.album.artist;
              const a = artistsData.find(ar => (ar._id === artistId || ar.id === artistId));
              if (a) artistName = a.name;
            }
          }
        } else {
          albumId = song.album;
          const alb = albumsData.find(a => (a._id === albumId || a.id === albumId));
          if (alb) {
            albumTitle = alb.title || 'Unknown Album';
            albumCover = alb.cover || '/default-cover.jpg';
          }
        }
      }

      return {
        ...song,
        id: trackId,
        uniqueId: trackId,
        artist: artistName,
        artistId,
        albumTitle,
        albumId,
        cover: albumCover,
        title: song.title || 'Unknown Title',
        duration: song.duration || '0:00',
        actualDuration: convertDurationToSeconds(song.duration),
        audioUrl: song.audioUrl || '',
      };
    });
  };
  
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch user, music data, and playlists in parallel
        const [user, musicData] = await Promise.all([
          fetchCurrentUser(),
          fetchData(),
        ]);
        
        const { tracks: tracksData, albums: albumsData, artists: artistsData } = musicData;
        
        // Process all songs with proper relationships
        const processedSongs = processAllSongs(tracksData, albumsData, artistsData);
        
        // Ensure all songs have unique IDs
        const uniqueSongs = processedSongs.filter((song, index, self) => 
          song && song.id && self.findIndex(s => s.id === song.id) === index
        );
        
        setAllSongs(uniqueSongs);
        
        // Fetch user's playlists from the API
        await fetchPlaylists();
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoaded(true);
      }
    };
    
    loadData();
  }, []);
  
  // Refresh data function
  const refreshData = async () => {
    try {
      const { tracks: tracksData, albums: albumsData, artists: artistsData } = await fetchData();
      const processedSongs = processAllSongs(tracksData, albumsData, artistsData);
      const uniqueSongs = processedSongs.filter((song, index, self) => 
        song && song.id && self.findIndex(s => s.id === song.id) === index
      );
      setAllSongs(uniqueSongs);
      await fetchPlaylists();
      return uniqueSongs;
    } catch (error) {
      console.error('Error refreshing data:', error);
      throw error;
    }
  };
  
  // Create a new playlist via API
  const createPlaylist = async (name) => {
    try {
      if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new Error('Playlist name is required');
      }
      
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create playlist');
      }
      
      const newPlaylist = await res.json();
      setPlaylists(prev => [newPlaylist, ...prev]);
      return newPlaylist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  };
  
  // Delete a playlist via API
  const deletePlaylist = async (playlistId) => {
    try {
      if (!playlistId) {
        throw new Error('Playlist ID is required');
      }
      
      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete playlist');
      }
      
      setPlaylists(prev => prev.filter(p => (p._id || p.id) !== playlistId));
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw error;
    }
  };
  
  // Add song to playlist via API
  const addSongToPlaylist = async (playlistId, song) => {
    try {
      if (!playlistId || !song) {
        throw new Error('Invalid playlist ID or song');
      }
      
      const songId = song._id || song.id;
      if (!songId) {
        throw new Error('Song ID is missing');
      }
      
      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addSongId: songId }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add song');
      }
      
      const updatedPlaylist = await res.json();
      setPlaylists(prev =>
        prev.map(p => ((p._id || p.id) === playlistId ? updatedPlaylist : p))
      );
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      throw error;
    }
  };
  
  // Remove song from playlist via API
  const removeSongFromPlaylist = async (playlistId, songId) => {
    try {
      if (!playlistId || !songId) {
        throw new Error('Invalid playlist ID or song ID');
      }
      
      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ removeSongId: songId }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to remove song');
      }
      
      const updatedPlaylist = await res.json();
      setPlaylists(prev =>
        prev.map(p => ((p._id || p.id) === playlistId ? updatedPlaylist : p))
      );
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      throw error;
    }
  };
  
  // Get a specific playlist from local state
  const getPlaylist = (playlistId) => {
    try {
      if (!playlistId) {
        return null;
      }
      const playlist = playlists.find(p => (p._id || p.id) === playlistId) || null;
      if (!playlist) return null;
      
      // Process the songs for display
      const processedSongs = processPlaylistSongs(playlist, albums, artists);
      return {
        ...playlist,
        id: playlist._id || playlist.id,
        songs: processedSongs,
      };
    } catch (error) {
      console.error('Error getting playlist:', error);
      return null;
    }
  };
  
  // Get song by ID from all songs
  const getSongById = (songId) => {
    try {
      if (!songId) {
        return null;
      }
      return allSongs.find(song => song.id === songId || song.uniqueId === songId) || null;
    } catch (error) {
      console.error('Error getting song by ID:', error);
      return null;
    }
  };
  
  const value = {
    playlists,
    allSongs,
    tracks,
    albums,
    artists,
    isLoaded,
    isLoading,
    error,
    currentUser,
    createPlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    getPlaylist,
    getSongById,
    refreshData
  };
  
  return (
    <PlaylistsContext.Provider value={value}>
      {children}
    </PlaylistsContext.Provider>
  );
}