'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { albums } from '../albums/data/albums';

const PlaylistsContext = createContext();

export function usePlaylists() {
  const context = useContext(PlaylistsContext);
  if (!context) {
    throw new Error('usePlaylists must be used within a PlaylistsProvider');
  }
  return context;
}

export function PlaylistsProvider({ children }) {
  const [playlists, setPlaylists] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Get all songs from albums
  useEffect(() => {
    try {
      const songs = albums.flatMap(album => 
        album.tracks.map(track => ({
          ...track,
          albumId: album.id,
          albumTitle: album.title,
          artist: album.artist,
          cover: album.cover
        }))
      );
      
      // Ensure all songs have unique IDs
      const uniqueSongs = songs.filter((song, index, self) => 
        song && song.id && self.findIndex(s => s.id === song.id) === index
      );
      
      setAllSongs(uniqueSongs);
      
      // Load playlists from localStorage only on client side
      if (typeof window !== 'undefined') {
        const savedPlaylists = localStorage.getItem('playlists');
        if (savedPlaylists) {
          try {
            const parsedPlaylists = JSON.parse(savedPlaylists);
            setPlaylists(Array.isArray(parsedPlaylists) ? parsedPlaylists : []);
          } catch (error) {
            console.error('Error parsing saved playlists:', error);
            localStorage.removeItem('playlists');
          }
        }
      }
      
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading songs:', error);
      setIsLoaded(true);
    }
  }, []);
  
  // Save playlists to localStorage when they change (only after initial load)
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem('playlists', JSON.stringify(playlists));
      } catch (error) {
        console.error('Error saving playlists:', error);
      }
    }
  }, [playlists, isLoaded]);
  
  // Create a new playlist
  const createPlaylist = (name) => {
    try {
      if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new Error('Playlist name is required');
      }
      
      const newPlaylist = {
        id: `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        songs: [],
        createdAt: new Date().toISOString()
      };
      
      setPlaylists(prevPlaylists => [...prevPlaylists, newPlaylist]);
      return newPlaylist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  };
  
  // Delete a playlist
  const deletePlaylist = (playlistId) => {
    try {
      if (!playlistId) {
        throw new Error('Playlist ID is required');
      }
      
      setPlaylists(prevPlaylists => 
        prevPlaylists.filter(playlist => playlist.id !== playlistId)
      );
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw error;
    }
  };
  
  // Add song to playlist
  const addSongToPlaylist = (playlistId, song) => {
    try {
      if (!playlistId || !song || !song.id) {
        throw new Error('Invalid playlist ID or song');
      }
      
      setPlaylists(prevPlaylists => 
        prevPlaylists.map(playlist => {
          if (playlist.id === playlistId) {
            // Check if song already exists in playlist
            const songExists = playlist.songs.some(s => s && s.id === song.id);
            if (!songExists) {
              return { 
                ...playlist, 
                songs: [...playlist.songs, { ...song }] 
              };
            } else {
              console.log('Song already exists in playlist');
            }
          }
          return playlist;
        })
      );
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      throw error;
    }
  };
  
  // Remove song from playlist
  const removeSongFromPlaylist = (playlistId, songId) => {
    try {
      if (!playlistId || !songId) {
        throw new Error('Invalid playlist ID or song ID');
      }
      
      setPlaylists(prevPlaylists => 
        prevPlaylists.map(playlist => {
          if (playlist.id === playlistId) {
            return { 
              ...playlist, 
              songs: playlist.songs.filter(song => song.id !== songId) 
            };
          }
          return playlist;
        })
      );
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      throw error;
    }
  };
  
  // Get a specific playlist
  const getPlaylist = (playlistId) => {
    try {
      if (!playlistId) {
        return null;
      }
      return playlists.find(playlist => playlist.id === playlistId) || null;
    } catch (error) {
      console.error('Error getting playlist:', error);
      return null;
    }
  };
  
  const value = {
    playlists,
    allSongs,
    isLoaded,
    createPlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    getPlaylist
  };
  
  return (
    <PlaylistsContext.Provider value={value}>
      {children}
    </PlaylistsContext.Provider>
  );
}