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
  
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { tracks: tracksData, albums: albumsData, artists: artistsData } = await fetchData();
        
        // Process all songs with proper relationships
        const processedSongs = processAllSongs(tracksData, albumsData, artistsData);
        
        // Ensure all songs have unique IDs
        const uniqueSongs = processedSongs.filter((song, index, self) => 
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
        console.error('Error loading data:', error);
        setIsLoaded(true);
      }
    };
    
    loadData();
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
  
  // Refresh data function (can be called manually if needed)
  const refreshData = async () => {
    try {
      const { tracks: tracksData, albums: albumsData, artists: artistsData } = await fetchData();
      const processedSongs = processAllSongs(tracksData, albumsData, artistsData);
      const uniqueSongs = processedSongs.filter((song, index, self) => 
        song && song.id && self.findIndex(s => s.id === song.id) === index
      );
      setAllSongs(uniqueSongs);
      return uniqueSongs;
    } catch (error) {
      console.error('Error refreshing data:', error);
      throw error;
    }
  };
  
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