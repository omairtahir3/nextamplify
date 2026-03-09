// scripts/seed.js
// Comprehensive seed script for NextAmplify (DYNAMIC LOCAL AUDIO VERSION)
// Run with: node scripts/seed.js

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27015';
const dbName = 'amplifyDB';

// ─── ARTISTS DATA ───────────────────────────────────────────────────────────
const artistsData = [
  {
    name: 'The Weeknd',
    image: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da844fc419eb9ee946468771f3d1',
    genres: ['R&B', 'Pop', 'Synth-pop'],
    description: 'Abel Tesfaye, known as The Weeknd, is a Canadian singer, songwriter, and record producer.'
  },
  {
    name: 'Kendrick Lamar',
    image: 'https://i.scdn.co/image/ab6761610000e5eb39ba6dcd4355c03de0b50918',
    genres: ['Hip-Hop', 'Rap', 'West Coast Hip-Hop'],
    description: 'Kendrick Lamar is an American rapper, songwriter, and record producer.'
  },
  {
    name: 'Billie Eilish',
    image: 'https://i.scdn.co/image/ab67616d0000b273a9f6c04ba168640b48aa5795',
    genres: ['Alternative Pop', 'Electropop', 'Art Pop'],
    description: 'Billie Eilish is an American singer-songwriter.'
  },
  {
    name: 'Justin Bieber',
    image: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da848541ac8220304f57e8fb742e',
    genres: ['Pop', 'R&B'],
    description: 'Justin Bieber is a Canadian singer.'
  },
  {
    name: 'Taylor Swift',
    image: 'https://i.scdn.co/image/ab67616d0000b2732f8c0fd72a80a93f8c53b96c',
    genres: ['Pop', 'Country', 'Folk'],
    description: 'Taylor Swift is an American singer-songwriter.'
  },
  {
    name: 'Doja Cat',
    image: 'https://i.scdn.co/image/ab6761610000e5eb8a0644455ebfa7d3976f5101',
    genres: ['Pop', 'Rap', 'R&B'],
    description: 'Doja Cat is an American rapper and singer.'
  },
  {
    name: 'SZA',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQATRF8fx4XxS2Lmd53z8o184rbxqrNgxcerw&s',
    genres: ['R&B', 'Neo Soul'],
    description: 'SZA is an American singer and songwriter.'
  },
  {
    name: 'Bad Bunny',
    image: 'https://i.scdn.co/image/ab6761610000e5eb81f47f44084e0a09b5f0fa13',
    genres: ['Urbano Latino', 'Reggaeton'],
    description: 'Bad Bunny is a Puerto Rican rapper and singer.'
  }
];

// Mapping artist names to their index in `artistsData`
const artistIndexMap = {
  'The Weeknd': 0,
  'Kendrick Lamar': 1,
  'Billie Eilish': 2,
  'Justin Bieber': 3,
  'Taylor Swift': 4,
  'Doja Cat': 5,
  'SZA': 6,
  'Bad Bunny': 7
};

// ─── FOLDER TO ALBUM MAPPING ──────────────────────────────────────────────────
const albumMeta = {
  'dawn_fm': { artist: 'The Weeknd', title: 'Dawn FM', year: 2022, cover: 'https://upload.wikimedia.org/wikipedia/en/b/b9/The_Weeknd_-_Dawn_FM.png' },
  'gkmc': { artist: 'Kendrick Lamar', title: 'good kid, m.A.A.d city', year: 2012, cover: 'https://i.scdn.co/image/ab67616d0000b273d28d2ebdedb220e479743797' },
  'happier_than_ever': { artist: 'Billie Eilish', title: 'Happier Than Ever', year: 2021, cover: 'https://i.scdn.co/image/ab67616d0000b2732a038d3bf875d23e4aeaa84e' },
  'hurry_up_tomorrow': { artist: 'The Weeknd', title: 'Hurry Up Tomorrow', year: 2024, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/75/The_Weeknd_-_Hurry_Up_Tomorrow_%28alternative_cover%29.png/250px-The_Weeknd_-_Hurry_Up_Tomorrow_%28alternative_cover%29.png' },
  'justice': { artist: 'Justin Bieber', title: 'Justice', year: 2021, cover: 'https://i.scdn.co/image/ab67616d0000b273e6f407c7f3a0ec98845e4431' },
  'midnights': { artist: 'Taylor Swift', title: 'Midnights', year: 2022, cover: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Midnights_-_Taylor_Swift.png' },
  'planet_her': { artist: 'Doja Cat', title: 'Planet Her', year: 2021, cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUAJ6gZWI7AK3X6rQh-qfVOQJvB1V76iaehQ&s' },
  'sos': { artist: 'SZA', title: 'SOS', year: 2022, cover: 'https://i.scdn.co/image/ab67616d0000b27370dbc9f47669d120ad874ec1' },
  'starboy': { artist: 'The Weeknd', title: 'Starboy', year: 2016, cover: 'https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452' },
  'un_verano': { artist: 'Bad Bunny', title: 'Un Verano Sin Ti', year: 2022, cover: 'https://i.scdn.co/image/ab67616d0000b27349d694203245f241a1bcaa72' },
};

function formatTrackTitle(filename) {
  // Convert "a_tale_by_quincy.mp3" to "A Tale By Quincy"
  const name = filename.replace(/\.(mp3|wav|m4a|ogg)$/i, '');
  return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// ─── MAIN SEED FUNCTION ──────────────────────────────────────────────────────
async function seed() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB at', uri);
    
    const db = client.db(dbName);
    const artistsCol = db.collection('artists');
    const albumsCol = db.collection('albums');
    const tracksCol = db.collection('tracks');
    
    // 1. Clear existing data
    console.log('\n🗑  Clearing existing data...');
    await Promise.all([
      artistsCol.deleteMany({}),
      albumsCol.deleteMany({}),
      tracksCol.deleteMany({}),
    ]);
    console.log('✓ Collections cleared');
    
    // 2. Insert artists
    console.log('\n🎤 Seeding artists...');
    const artistDbIdMap = {};
    for (const artist of artistsData) {
      const result = await artistsCol.insertOne({
        name: artist.name,
        image: artist.image,
        genres: artist.genres,
        description: artist.description,
        albums: [],
      });
      artistDbIdMap[artist.name] = result.insertedId;
      console.log(`  + ${artist.name}`);
    }
    console.log(`✓ ${artistsData.length} artists seeded`);
    
    // 3. Scan local audio files to build albums and tracks
    console.log('\n💿 Scanning local audio files and seeding albums/tracks...');
    const audioDir = path.join(__dirname, '../public/audio');
    
    // Load music-metadata dynamically for true durations
    let parseFile;
    try {
      const mm = await import('music-metadata');
      parseFile = mm.parseFile;
    } catch (err) {
      console.warn('  ! Could not load music-metadata:', err.message);
    }
    
    if (!fs.existsSync(audioDir)) {
      throw new Error(`Directory not found: ${audioDir}`);
    }
    
    const folders = fs.readdirSync(audioDir);
    let totalTracks = 0;
    
    for (const folder of folders) {
      const folderPath = path.join(audioDir, folder);
      if (!fs.statSync(folderPath).isDirectory()) continue;
      
      const meta = albumMeta[folder];
      if (!meta) {
        console.warn(`  ! No metadata mapping found for folder: ${folder}, skipping...`);
        continue;
      }
      
      const artistId = artistDbIdMap[meta.artist];
      if (!artistId) {
        console.warn(`  ! Artist not found for album: ${meta.title}, skipping...`);
        continue;
      }
      
      // Insert the album
      const albumResult = await albumsCol.insertOne({
        title: meta.title,
        artist: artistId,
        year: meta.year,
        cover: meta.cover,
        tracks: [],
      });
      const albumId = albumResult.insertedId;
      
      // Read audio files in the folder
      const files = fs.readdirSync(folderPath);
      const trackIds = [];
      
      for (const file of files) {
        if (!file.match(/\.(mp3|wav|m4a|ogg)$/i)) continue;
        
        const trackTitle = formatTrackTitle(file);
        const audioUrl = `/audio/${folder}/${file}`; // local path
        
        let trackDurationStr = '3:00'; // fallback
        
        if (parseFile) {
          try {
            const metadata = await parseFile(path.join(folderPath, file));
            if (metadata.format && metadata.format.duration) {
              const totalSeconds = Math.round(metadata.format.duration);
              const minutes = Math.floor(totalSeconds / 60);
              const seconds = totalSeconds % 60;
              trackDurationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
          } catch (err) {
            console.warn(`    ! Could not parse duration for ${file}`);
          }
        }
        
        const trackResult = await tracksCol.insertOne({
          title: trackTitle,
          duration: trackDurationStr,
          audioUrl: audioUrl,
          cover: meta.cover,
          album: albumId,
          artist: artistId,
        });
        
        trackIds.push(trackResult.insertedId);
        totalTracks++;
      }
      
      // Update album with track IDs
      await albumsCol.updateOne(
        { _id: albumId },
        { $set: { tracks: trackIds } }
      );
      
      // Update artist with album ID
      await artistsCol.updateOne(
        { _id: artistId },
        { $push: { albums: albumId } }
      );
      
      console.log(`  + ${meta.title} (${trackIds.length} tracks from /public/audio/${folder})`);
    }
    
    // 4. Summary
    console.log('\n═══════════════════════════════════════════');
    console.log('  DYNAMIC SEED SCRIPT COMPLETED SUCCESSFULLY!');
    console.log(`  Database: ${dbName}`);
    console.log(`  Artists:  ${artistsData.length}`);
    console.log(`  Tracks:   ${totalTracks}`);
    console.log('═══════════════════════════════════════════\n');
    
  } catch (err) {
    console.error('✗ Error seeding database:', err);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

seed();
