// scripts/seedArtists.js
import { MongoClient } from 'mongodb';
import { artists } from '../app/dashboard/artists/data/artists.js';

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'amplifyDB';

export async function run() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('artists');

    await collection.deleteMany({});

    const artistIdMap = {};

    for (const artist of artists) {
      const result = await collection.insertOne({
        name: artist.name,
        image: artist.image,
        followers: artist.followers,
        genres: artist.genres,
        description: artist.description,
        albums: []
      });

      artistIdMap[artist.id] = result.insertedId;
    }

    console.log('Artists seeded!');
    return artistIdMap;
  } catch (err) {
    console.error('Error seeding artists:', err);
  } finally {
    await client.close();
  }
}
