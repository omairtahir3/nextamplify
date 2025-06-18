import dbConnect from '../../lib/dbConnect';
import Track from '../../models/Track';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const albumId = searchParams.get('albumId');
  
  await dbConnect();
  
  try {
    let tracks;
    
    if (albumId) {
      // Get tracks for a specific album
      tracks = await Track.find({ album: albumId }).populate('album', 'title artist cover');
    } else {
      // Get all tracks with album information populated
      tracks = await Track.find({}).populate('album', 'title artist cover');
    }
    
    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Tracks API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const albumId = searchParams.get('albumId');
  
  if (!albumId) {
    return NextResponse.json(
      { error: 'albumId is required for creating tracks' }, 
      { status: 400 }
    );
  }
  
  await dbConnect();
  
  try {
    const body = await request.json();
    
    // Create a new track for an album
    const newTrack = await Track.create({
      ...body,
      album: albumId
    });
    
    // Populate the album information
    await newTrack.populate('album', 'title artist cover');
    
    return NextResponse.json(newTrack, { status: 201 });
  } catch (error) {
    console.error('Tracks API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}