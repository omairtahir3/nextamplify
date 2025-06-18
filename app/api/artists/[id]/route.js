// app/api/artists/[id]/route.js
import dbConnect from '../../../lib/dbConnect';
import Artist from '../../../models/Artist';
import Album from '../../../models/Album'; // Import Album model

export async function GET(request, { params }) {
  try {
    // Handle async params in Next.js 13+
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    // Validate the ID format
    if (!id || typeof id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid artist ID' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await dbConnect();
    
    // Find the artist
    const artist = await Artist.findById(id);
    
    if (!artist) {
      return new Response(
        JSON.stringify({ error: 'Artist not found' }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch albums for this artist
    // This assumes you have an Album model with an artistId field
    const albums = await Album.find({ artist: id }).select('title cover year _id');
    
    // Combine artist data with albums
    const artistWithAlbums = {
      ...artist.toObject(), // Convert mongoose document to plain object
      albums: albums || []
    };

    return new Response(
      JSON.stringify(artistWithAlbums), 
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      }
    );
    
  } catch (error) {
    console.error('Error in artist API route:', error);
    
    if (error.name === 'CastError') {
      return new Response(
        JSON.stringify({ error: 'Invalid artist ID format' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}