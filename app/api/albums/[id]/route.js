// app/api/albums/[id]/route.js
import dbConnect from '../../../lib/dbConnect';
import Album from '../../../models/Album';
import Artist from '../../../models/Artist';
import Track from '../../../models/Track';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Validate the ID format
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid album ID format' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await dbConnect();
    
    // Find the album
    const album = await Album.findById(id).lean();
    
    if (!album) {
      return new Response(
        JSON.stringify({ error: 'Album not found' }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch artist details
    let artistDetails = null;
    if (album.artist) {
      artistDetails = await Artist.findById(album.artist)
        .select('name image')
        .lean();
    }

    // Fetch tracks for this album
    let tracks = [];
    if (album.tracks && album.tracks.length > 0) {
      tracks = await Track.find({ _id: { $in: album.tracks } })
        .select('title duration audioUrl explicit')
        .lean();
    }

    // Combine all data
    const albumWithDetails = {
      ...album,
      artist: artistDetails || null,
      tracks: tracks || []
    };

    return new Response(
      JSON.stringify(albumWithDetails), 
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      }
    );
    
  } catch (error) {
    console.error('Error in album API route:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return new Response(
        JSON.stringify({ error: 'Invalid album ID format' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}