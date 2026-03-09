const path = require('path');

async function test() {
  const { parseFile } = await import('music-metadata');
  const metadata = await parseFile(path.join(__dirname, 'public/audio/after_hours/15 Until I Bleed Out.mp3'));
  console.log(metadata.format.duration);
}
test().catch(console.error);
