// models/Album.js
import mongoose from 'mongoose';

const AlbumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true
  },
  year: Number,
  cover: String,
  tracks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track'
  }]
});

export default mongoose.models.Album || mongoose.model('Album', AlbumSchema);
