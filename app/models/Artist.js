// models/Artist.js
import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema({
  name: String,
  image: String,
  genres: [String],
  description: String,
  albums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }],
});

export default mongoose.models.Artist || mongoose.model('Artist', artistSchema);
