// models/Track.js
import mongoose from 'mongoose';

const TrackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
    required: true
  },
  duration: String,
  audioUrl: String
});

export default mongoose.models.Track || mongoose.model('Track', TrackSchema);
