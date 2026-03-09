import mongoose from 'mongoose';

const PlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index so playlist names are unique per user
PlaylistSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.models.Playlist || mongoose.model('Playlist', PlaylistSchema);
