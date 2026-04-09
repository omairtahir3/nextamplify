// Simplified seed script for Docker environment (no audio file scanning)
// This inserts artists, albums, and track metadata directly

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://mongo:27017/amplifyDB';
const dbName = 'amplifyDB';

const artistsData = [
  { name: 'The Weeknd', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da844fc419eb9ee946468771f3d1', genres: ['R&B', 'Pop', 'Synth-pop'], description: 'Abel Tesfaye, known as The Weeknd, is a Canadian singer, songwriter, and record producer.' },
  { name: 'Kendrick Lamar', image: 'https://i.scdn.co/image/ab6761610000e5eb39ba6dcd4355c03de0b50918', genres: ['Hip-Hop', 'Rap', 'West Coast Hip-Hop'], description: 'Kendrick Lamar is an American rapper, songwriter, and record producer.' },
  { name: 'Billie Eilish', image: 'https://i.scdn.co/image/ab67616d0000b273a9f6c04ba168640b48aa5795', genres: ['Alternative Pop', 'Electropop', 'Art Pop'], description: 'Billie Eilish is an American singer-songwriter.' },
  { name: 'Justin Bieber', image: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da848541ac8220304f57e8fb742e', genres: ['Pop', 'R&B'], description: 'Justin Bieber is a Canadian singer.' },
  { name: 'Taylor Swift', image: 'https://i.scdn.co/image/ab67616d0000b2732f8c0fd72a80a93f8c53b96c', genres: ['Pop', 'Country', 'Folk'], description: 'Taylor Swift is an American singer-songwriter.' },
  { name: 'Doja Cat', image: 'https://i.scdn.co/image/ab6761610000e5eb8a0644455ebfa7d3976f5101', genres: ['Pop', 'Rap', 'R&B'], description: 'Doja Cat is an American rapper and singer.' },
  { name: 'SZA', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQATRF8fx4XxS2Lmd53z8o184rbxqrNgxcerw&s', genres: ['R&B', 'Neo Soul'], description: 'SZA is an American singer and songwriter.' },
  { name: 'Bad Bunny', image: 'https://i.scdn.co/image/ab6761610000e5eb81f47f44084e0a09b5f0fa13', genres: ['Urbano Latino', 'Reggaeton'], description: 'Bad Bunny is a Puerto Rican rapper and singer.' },
];

const albumsData = [
  { folder: 'dawn_fm', artist: 'The Weeknd', title: 'Dawn FM', year: 2022, cover: 'https://upload.wikimedia.org/wikipedia/en/b/b9/The_Weeknd_-_Dawn_FM.png',
    tracks: ['Gasoline', 'How Do I Make You Love Me', 'Take My Breath', 'Sacrifice', 'Out Of Time', 'Is There Someone Else', 'Starry Eyes', 'Every Angel Is Terrifying', 'Less Than Zero'] },
  { folder: 'gkmc', artist: 'Kendrick Lamar', title: 'good kid, m.A.A.d city', year: 2012, cover: 'https://i.scdn.co/image/ab67616d0000b273d28d2ebdedb220e479743797',
    tracks: ['Sherane', 'Bitch Dont Kill My Vibe', 'Backseat Freestyle', 'The Art Of Peer Pressure', 'Money Trees', 'Poetic Justice', 'Swimming Pools', 'Sing About Me', 'Real', 'Compton'] },
  { folder: 'happier_than_ever', artist: 'Billie Eilish', title: 'Happier Than Ever', year: 2021, cover: 'https://i.scdn.co/image/ab67616d0000b2732a038d3bf875d23e4aeaa84e',
    tracks: ['Getting Older', 'I Didnt Change My Number', 'Billie Bossa Nova', 'My Future', 'Oxytocin', 'Lost Cause', 'Halley Comet', 'NDA', 'Therefore I Am', 'Happier Than Ever'] },
  { folder: 'hurry_up_tomorrow', artist: 'The Weeknd', title: 'Hurry Up Tomorrow', year: 2024, cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/75/The_Weeknd_-_Hurry_Up_Tomorrow_%28alternative_cover%29.png/250px-The_Weeknd_-_Hurry_Up_Tomorrow_%28alternative_cover%29.png',
    tracks: ['Wake Me Up', 'Sao Paulo', 'Open Hearts', 'Runaway', 'Cry For Me'] },
  { folder: 'justice', artist: 'Justin Bieber', title: 'Justice', year: 2021, cover: 'https://i.scdn.co/image/ab67616d0000b273e6f407c7f3a0ec98845e4431',
    tracks: ['2 Much', 'Deserve You', 'As I Am', 'Off My Face', 'Ghost', 'Peaches', 'Hold On', 'Somebody', 'Holy', 'Lonely'] },
  { folder: 'midnights', artist: 'Taylor Swift', title: 'Midnights', year: 2022, cover: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Midnights_-_Taylor_Swift.png',
    tracks: ['Lavender Haze', 'Maroon', 'Anti Hero', 'Snow On The Beach', 'Midnight Rain', 'Bejeweled', 'Karma', 'Vigilante Shit', 'Mastermind'] },
  { folder: 'planet_her', artist: 'Doja Cat', title: 'Planet Her', year: 2021, cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUAJ6gZWI7AK3X6rQh-qfVOQJvB1V76iaehQ&s',
    tracks: ['Woman', 'Naked', 'Payday', 'Get Into It', 'Need To Know', 'I Dont Do Drugs', 'Love To Dream', 'You Right', 'Kiss Me More'] },
  { folder: 'sos', artist: 'SZA', title: 'SOS', year: 2022, cover: 'https://i.scdn.co/image/ab67616d0000b27370dbc9f47669d120ad874ec1',
    tracks: ['SOS', 'Kill Bill', 'Seek And Destroy', 'Low', 'Love Language', 'Blind', 'Used', 'Snooze', 'Notice Me', 'Gone Girl'] },
  { folder: 'starboy', artist: 'The Weeknd', title: 'Starboy', year: 2016, cover: 'https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452',
    tracks: ['Starboy', 'Party Monster', 'False Alarm', 'Reminder', 'Rockin', 'Secrets', 'True Colors', 'Stargirl Interlude', 'Sidewalks', 'Six Feet Under', 'Die For You', 'I Feel It Coming'] },
  { folder: 'un_verano', artist: 'Bad Bunny', title: 'Un Verano Sin Ti', year: 2022, cover: 'https://i.scdn.co/image/ab67616d0000b27349d694203245f241a1bcaa72',
    tracks: ['Moscow Mule', 'After Last Night', 'Me Porto Bonito', 'Titi Me Pregunto', 'Un Ratito', 'Yo No Soy Celoso', 'Tarot', 'Neverita', 'Ojitos Lindos', 'Efecto'] },
];

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✓ Connected to MongoDB at', uri);

    const db = client.db(dbName);
    const artistsCol = db.collection('artists');
    const albumsCol = db.collection('albums');
    const tracksCol = db.collection('tracks');

    // Clear existing data
    console.log('\n🗑  Clearing existing data...');
    await Promise.all([
      artistsCol.deleteMany({}),
      albumsCol.deleteMany({}),
      tracksCol.deleteMany({}),
    ]);

    // Insert artists
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

    // Insert albums and tracks
    console.log('\n💿 Seeding albums and tracks...');
    let totalTracks = 0;

    for (const album of albumsData) {
      const artistId = artistDbIdMap[album.artist];

      const albumResult = await albumsCol.insertOne({
        title: album.title,
        artist: artistId,
        year: album.year,
        cover: album.cover,
        tracks: [],
      });
      const albumId = albumResult.insertedId;

      const trackIds = [];
      for (let i = 0; i < album.tracks.length; i++) {
        const trackResult = await tracksCol.insertOne({
          title: album.tracks[i],
          duration: '3:30',
          audioUrl: `/audio/${album.folder}/${album.tracks[i].toLowerCase().replace(/ /g, '_')}.mp3`,
          cover: album.cover,
          album: albumId,
          artist: artistId,
        });
        trackIds.push(trackResult.insertedId);
        totalTracks++;
      }

      await albumsCol.updateOne({ _id: albumId }, { $set: { tracks: trackIds } });
      await artistsCol.updateOne({ _id: artistId }, { $push: { albums: albumId } });
      console.log(`  + ${album.title} (${trackIds.length} tracks)`);
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('  SEED COMPLETED SUCCESSFULLY!');
    console.log(`  Database: ${dbName}`);
    console.log(`  Artists:  ${artistsData.length}`);
    console.log(`  Albums:   ${albumsData.length}`);
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
