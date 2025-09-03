const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImageUrl: { type: String, required: true },
  favorites: [
    {
      artistId: String,
      name: String,
      thumbnail: String,
      birthday: String,
      deathday: String,
      nationality: String,
      addedAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('User', UserSchema);