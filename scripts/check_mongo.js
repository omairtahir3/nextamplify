const { MongoClient } = require('mongodb');
const uri = 'mongodb://127.0.0.1:27017';
async function check() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const admin = client.db('admin');
    const dbs = await admin.command({ listDatabases: 1 });
    console.log('Databases:', dbs.databases.map(d => d.name));
  } catch (e) {
    console.error('Failed to connect to 27017:', e.message);
  } finally {
    await client.close();
  }
}
check();
