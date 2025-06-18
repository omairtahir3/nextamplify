// app/api/albums/route.js
import dbConnect from '../../lib/dbConnect';
import Album from '../../models/Album';
import Artist from '../../models/Artist';
export async function GET() {
  try {
    await dbConnect();

    const albums = await Album.find().populate('artist');

    return Response.json(albums);
  } catch (err) {
    console.error('Error fetching albums:', err);
    return new Response('Failed to fetch albums', { status: 500 });
  }
}
