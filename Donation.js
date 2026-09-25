const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  foodName: { type: String, required: true },
  quantity: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Vegetarian', 'Non-Vegetarian', 'Mixed', 'Vegan', 'Bakery', 'Packaged'], 
    default: 'Vegetarian' 
  },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  donorName: { type: String, default: 'Community Donor' },
  donorPhone: { type: String, default: '+91 98765 00000' },
  donorType: { 
    type: String, 
    enum: ['donor', 'restaurant'], 
    default: 'donor' 
  },
  pickupLocation: {
    address: { type: String, default: 'Green Park, New Delhi' },
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [77.2090, 28.6139] } // [lng, lat]
  },
  safetyDeadline: { type: String, default: 'Within 4 hours' },
  notes: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Available', 'Accepted', 'Agent_Requested', 'Out_For_Delivery', 'Completed', 'Cancelled'], 
    default: 'Available' 
  },
  assignedNgo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ngoName: { type: String, default: '' },
  ngoAddress: { type: String, default: '' },
  deliveryAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  agentName: { type: String, default: '' },
  agentPhone: { type: String, default: '' },
  currentLocation: {
    lat: { type: Number, default: 28.6139 },
    lng: { type: Number, default: 77.2090 },
    updatedAt: { type: Date, default: Date.now }
  },
  completedAt: { type: Date }
}, { timestamps: true });

donationSchema.index({ 'pickupLocation.coordinates': '2dsphere' });

module.exports = mongoose.models.Donation || mongoose.model('Donation', donationSchema);
