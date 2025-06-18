import { MongoClient } from 'mongodb';
import { albums } from '../app/dashboard/albums/data/albums.js';
import { run as seedArtists } from './seedArtists.js';

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'amplifyDB';

async function seedAlbums(artistIdMap) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const albumsCollection = db.collection('albums');
    const tracksCollection = db.collection('tracks');
    const artistsCollection = db.collection('artists');

    // Clear existing data
    await albumsCollection.deleteMany({});
    await tracksCollection.deleteMany({});

    for (const album of albums) {
      // 1. Create album document
      const albumDoc = {
        title: album.title,
        artist: artistIdMap[album.artist], // Convert to ObjectId
        cover: album.cover,
        year: album.year,
        genres: album.genres || [],
        tracks: [] // Will be filled with track IDs
      };
      
      // 2. Insert album
      const albumResult = await albumsCollection.insertOne(albumDoc);
      const albumId = albumResult.insertedId;
      
      // 3. Insert tracks
      const trackIds = [];
      for (const track of album.tracks) {
        const trackDoc = {
          title: track.title,
          duration: track.duration,
          audioUrl: track.audioUrl,
          cover: track.cover,
          album: albumId,
          artist: artistIdMap[album.artist] // Same as album artist
        };
        
        const trackResult = await tracksCollection.insertOne(trackDoc);
        trackIds.push(trackResult.insertedId);
      }
      
      // 4. Update album with track IDs
      await albumsCollection.updateOne(
        { _id: albumId },
        { $set: { tracks: trackIds } }
      );
      
      // 5. Update artist with album ID
      await artistsCollection.updateOne(
        { _id: artistIdMap[album.artist] },
        { $push: { albums: albumId } }
      );
    }

    console.log('Albums and tracks seeded successfully!');
  } catch (err) {
    console.error('Error seeding albums:', err);
  } finally {
    await client.close();
  }
}

// First seed artists, then seed albums with the ID map
seedArtists().then(artistIdMap => {
  seedAlbums(artistIdMap);
});