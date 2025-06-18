// app/api/artists/route.js
import dbConnect from '../../lib/dbConnect';
import Artist from '../../models/Artist';
import Albums from '../../models/Album'
export async function GET() {
  try {
    await dbConnect();

    const artists = await Artist.find().populate('albums');

    return Response.json(artists);
  } catch (err) {
    console.error('Error fetching artists:', err);
    return new Response('Failed to fetch artists', { status: 500 });
  }
}
