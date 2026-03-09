import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '../../lib/dbConnect';
import Playlist from '../../models/Playlist';
import Track from '../../models/Track';

// Helper: extract userId from JWT cookie
function getUserId(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
}

// GET /api/playlists — get all playlists for current user
export async function GET(request) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();

    const playlists = await Playlist.find({ userId })
      .populate({
        path: 'songs',
        populate: {
          path: 'album',
          select: 'title cover artist',
          populate: {
            path: 'artist',
            select: 'name',
          },
        },
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(playlists);
  } catch (error) {
    console.error('Playlists GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/playlists — create a new playlist
export async function POST(request) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Playlist name is required' }, { status: 400 });
    }

    await dbConnect();

    const playlist = await Playlist.create({
      name: name.trim(),
      userId,
      songs: [],
    });

    return NextResponse.json(playlist, { status: 201 });
  } catch (error) {
    // Handle duplicate name
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'You already have a playlist with that name' },
        { status: 409 }
      );
    }
    console.error('Playlists POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
