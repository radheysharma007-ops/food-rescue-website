const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['donor', 'restaurant', 'ngo', 'delivery_agent'], 
    required: true 
  },
  phone: { type: String, default: '+91 98765 43210' },
  organization: { type: String, default: '' },
  address: { type: String, default: 'Connaught Place, New Delhi' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [77.2090, 28.6139] } // [lng, lat]
  }
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
