const https = require('https');

function fetchAlbum(term) {
  return new Promise((resolve) => {
    https.get(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=album&limit=1`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        if (json.results && json.results.length > 0) {
          // get 600x600 size instead of 100x100
          const img = json.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
          resolve(img);
        } else {
          resolve(null);
        }
      });
    });
  });
}

async function run() {
  const hut = await fetchAlbum('Hurry Up Tomorrow The Weeknd');
  const ph = await fetchAlbum('Planet Her Doja Cat');
  console.log('Hurry Up Tomorrow:', hut);
  console.log('Planet Her:', ph);
}

run();
