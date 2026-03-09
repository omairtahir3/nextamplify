const https = require('https');

function fetchArtist(term) {
  return new Promise((resolve) => {
    https.get(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=musicArtist&limit=1`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch(e) {
          resolve(null);
        }
      });
    });
  });
}

function fetchAlbumFallback(term) {
  return new Promise((resolve) => {
    https.get(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=album&limit=1`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.results && json.results.length > 0) {
            resolve(json.results[0].artworkUrl100.replace('100x100bb', '600x600bb'));
          } else {
            resolve(null);
          }
        } catch(e) {
          resolve(null);
        }
      });
    });
  });
}

async function run() {
  const artists = [
    'The Weeknd', 'Kendrick Lamar', 'Billie Eilish', 
    'Justin Bieber', 'Taylor Swift', 'Doja Cat', 'SZA', 'Bad Bunny'
  ];
  
  const results = {};
  for (const artist of artists) {
    // iTunes artist search often does not return images
    // So we search for their most popular album and use that as the artist avatar
    const img = await fetchAlbumFallback(artist);
    results[artist] = img;
  }
  
  console.log(JSON.stringify(results, null, 2));
}

run();
