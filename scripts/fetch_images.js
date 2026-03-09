const https = require('https');

async function fetchImage(title) {
  return new Promise((resolve, reject) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=1000`;
    https.get(url, { headers: { 'User-Agent': 'NextAmplify/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId === '-1' || !pages[pageId].thumbnail) {
            resolve(null);
          } else {
            resolve(pages[pageId].thumbnail.source);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

const titles = {
  artists: [
    'The Weeknd', 'Kendrick Lamar', 'Billie Eilish', 
    'Justin Bieber', 'Taylor Swift', 'Doja Cat', 'SZA', 'Bad Bunny'
  ],
  albums: [
    'Dawn FM', 'Good Kid, M.A.A.D City', 'Happier Than Ever',
    'Hurry Up, Tomorrow', 'Justice (Justin Bieber album)', 'Midnights',
    'Planet Her', 'SOS (SZA album)', 'Starboy (album)', 'Un Verano Sin Ti'
  ]
};

async function run() {
  const result = { artists: {}, albums: {} };
  
  for (const artist of titles.artists) {
    result.artists[artist] = await fetchImage(artist);
  }
  for (const album of titles.albums) {
    result.albums[album] = await fetchImage(album);
  }
  
  console.log(JSON.stringify(result, null, 2));
}

run();
