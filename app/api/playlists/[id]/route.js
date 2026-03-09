import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../lib/dbConnect';
import Playlist from '../../../models/Playlist';
import Track from '../../../models/Track';

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

// GET /api/playlists/[id] — get a specific playlist
export async function GET(request, { params }) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const playlist = await Playlist.findOne({ _id: id, userId })
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
      });

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    return NextResponse.json(playlist);
  } catch (error) {
    console.error('Playlist GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/playlists/[id] — update playlist (add/remove songs)
export async function PUT(request, { params }) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    await dbConnect();

    const playlist = await Playlist.findOne({ _id: id, userId });

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    // Handle adding a song
    if (body.addSongId) {
      if (!playlist.songs.includes(body.addSongId)) {
        playlist.songs.push(body.addSongId);
      }
    }

    // Handle removing a song
    if (body.removeSongId) {
      playlist.songs = playlist.songs.filter(
        songId => songId.toString() !== body.removeSongId
      );
    }

    // Handle name update
    if (body.name) {
      playlist.name = body.name.trim();
    }

    await playlist.save();

    // Re-fetch with populated data
    const updatedPlaylist = await Playlist.findById(playlist._id)
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
      });

    return NextResponse.json(updatedPlaylist);
  } catch (error) {
    console.error('Playlist PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/playlists/[id] — delete a playlist
export async function DELETE(request, { params }) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const playlist = await Playlist.findOneAndDelete({ _id: id, userId });

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Playlist deleted' });
  } catch (error) {
    console.error('Playlist DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
