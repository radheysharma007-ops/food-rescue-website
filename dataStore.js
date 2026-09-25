// services/dataStore.js
// Hybrid data store: Uses MongoDB when connected, or high-fidelity in-memory store when offline.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let isMongoConnected = false;

mongoose.connection.on('connected', () => {
  isMongoConnected = true;
  console.log('⚡ Connected to MongoDB database');
});

mongoose.connection.on('disconnected', () => {
  isMongoConnected = false;
  console.log('⚠️ MongoDB disconnected, utilizing high-fidelity in-memory store');
});

// Initial Seed Data
const users = [
  {
    _id: 'user_donor_1',
    name: 'Aarav Sharma',
    email: 'donor@foodrescue.org',
    password: bcrypt.hashSync('password123', 10),
    role: 'donor',
    phone: '+91 98111 22334',
    organization: 'Community Kitchen Hero',
    address: 'Connaught Place, New Delhi',
    location: { type: 'Point', coordinates: [77.2195, 28.6315] }
  },
  {
    _id: 'user_restaurant_1',
    name: 'Spice & Saffron Bistro',
    email: 'restaurant@foodrescue.org',
    password: bcrypt.hashSync('password123', 10),
    role: 'restaurant',
    phone: '+91 98222 33445',
    organization: 'Spice & Saffron Fine Dining',
    address: 'Hauz Khas Village, New Delhi',
    location: { type: 'Point', coordinates: [77.1950, 28.5494] }
  },
  {
    _id: 'user_ngo_1',
    name: 'Annapurna Food Bank',
    email: 'ngo@foodrescue.org',
    password: bcrypt.hashSync('password123', 10),
    role: 'ngo',
    phone: '+91 98333 44556',
    organization: 'Annapurna Relief Foundation',
    address: 'Lajpat Nagar, New Delhi',
    location: { type: 'Point', coordinates: [77.2433, 28.5677] }
  },
  {
    _id: 'user_ngo_2',
    name: 'Robin Hope Collective',
    email: 'robin@foodrescue.org',
    password: bcrypt.hashSync('password123', 10),
    role: 'ngo',
    phone: '+91 98333 77889',
    organization: 'Robin Hope Food Distribution',
    address: 'Karol Bagh, New Delhi',
    location: { type: 'Point', coordinates: [77.1906, 28.6517] }
  },
  {
    _id: 'user_agent_1',
    name: 'Vikram Singh (Rider)',
    email: 'agent@foodrescue.org',
    password: bcrypt.hashSync('password123', 10),
    role: 'delivery_agent',
    phone: '+91 98444 55667',
    organization: 'Rapid Rescue Fleet',
    address: 'Saket, New Delhi',
    location: { type: 'Point', coordinates: [77.2167, 28.5244] }
  }
];

const donations = [
  {
    _id: 'don_101',
    foodName: 'Fresh Paneer Tikka & 50 Rotis',
    quantity: '35 meals (approx 12 kg)',
    category: 'Vegetarian',
    donor: 'user_donor_1',
    donorName: 'Aarav Sharma',
    donorPhone: '+91 98111 22334',
    donorType: 'donor',
    pickupLocation: {
      address: 'Flat 402, Block C, Connaught Place, New Delhi',
      coordinates: [77.2195, 28.6315]
    },
    safetyDeadline: 'Best before 3 hours (Packaged at 8:00 PM)',
    notes: 'Hot and freshly packed in hygienic insulated containers.',
    status: 'Available',
    assignedNgo: null,
    ngoName: '',
    ngoAddress: '',
    deliveryAgent: null,
    agentName: '',
    agentPhone: '',
    currentLocation: { lat: 28.6315, lng: 77.2195, updatedAt: new Date() },
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    _id: 'don_102',
    foodName: 'Buffet Surplus: Dal Makhani, Pulao & Naan',
    quantity: '60 meals (approx 22 kg)',
    category: 'Vegetarian',
    donor: 'user_restaurant_1',
    donorName: 'Spice & Saffron Bistro',
    donorPhone: '+91 98222 33445',
    donorType: 'restaurant',
    pickupLocation: {
      address: 'Shop 14, Hauz Khas Village, New Delhi',
      coordinates: [77.1950, 28.5494]
    },
    safetyDeadline: 'Within 4 hours (Chilled storage)',
    notes: 'Restaurant buffet closing surplus, safe and untouched.',
    status: 'Accepted',
    assignedNgo: 'user_ngo_1',
    ngoName: 'Annapurna Food Bank',
    ngoAddress: 'Lajpat Nagar, New Delhi',
    deliveryAgent: null,
    agentName: '',
    agentPhone: '',
    currentLocation: { lat: 28.5494, lng: 77.1950, updatedAt: new Date() },
    createdAt: new Date(Date.now() - 7200000)
  },
  {
    _id: 'don_103',
    foodName: 'Assorted Bakery: Breads, Muffins & Sandwiches',
    quantity: '45 packages',
    category: 'Bakery',
    donor: 'user_restaurant_1',
    donorName: 'Spice & Saffron Bistro',
    donorPhone: '+91 98222 33445',
    donorType: 'restaurant',
    pickupLocation: {
      address: 'Shop 14, Hauz Khas Village, New Delhi',
      coordinates: [77.1950, 28.5494]
    },
    safetyDeadline: 'Within 8 hours',
    notes: 'High quality bakery items packaged in cartons.',
    status: 'Out_For_Delivery',
    assignedNgo: 'user_ngo_1',
    ngoName: 'Annapurna Food Bank',
    ngoAddress: 'Lajpat Nagar, New Delhi',
    deliveryAgent: 'user_agent_1',
    agentName: 'Vikram Singh (Rider)',
    agentPhone: '+91 98444 55667',
    currentLocation: { lat: 28.5600, lng: 77.2200, updatedAt: new Date() },
    createdAt: new Date(Date.now() - 10800000)
  },
  {
    _id: 'don_104',
    foodName: 'Mixed Fruit & Veggie Salad Bowls',
    quantity: '25 bowls',
    category: 'Vegetarian',
    donor: 'user_restaurant_1',
    donorName: 'Spice & Saffron Bistro',
    donorPhone: '+91 98222 33445',
    donorType: 'restaurant',
    pickupLocation: {
      address: 'Shop 14, Hauz Khas Village, New Delhi',
      coordinates: [77.1950, 28.5494]
    },
    safetyDeadline: 'Delivered',
    notes: 'Completed delivery to Annapurna Shelter.',
    status: 'Completed',
    assignedNgo: 'user_ngo_1',
    ngoName: 'Annapurna Food Bank',
    ngoAddress: 'Lajpat Nagar, New Delhi',
    deliveryAgent: 'user_agent_1',
    agentName: 'Vikram Singh (Rider)',
    agentPhone: '+91 98444 55667',
    currentLocation: { lat: 28.5677, lng: 77.2433, updatedAt: new Date() },
    completedAt: new Date(Date.now() - 86400000),
    createdAt: new Date(Date.now() - 90000000)
  }
];

const nearbyNgosStatic = [
  {
    _id: 'user_ngo_1',
    name: 'Annapurna Food Bank',
    organization: 'Annapurna Relief Foundation',
    phone: '+91 98333 44556',
    address: 'Lajpat Nagar, New Delhi',
    distanceKm: 2.1,
    capacity: '200 meals/day',
    verified: true,
    coordinates: [77.2433, 28.5677]
  },
  {
    _id: 'user_ngo_2',
    name: 'Robin Hope Collective',
    organization: 'Robin Hope Food Distribution',
    phone: '+91 98333 77889',
    address: 'Karol Bagh, New Delhi',
    distanceKm: 3.4,
    capacity: '150 meals/day',
    verified: true,
    coordinates: [77.1906, 28.6517]
  },
  {
    _id: 'user_ngo_3',
    name: 'Feeding Futures Delhi',
    organization: 'Child Nourishment Mission',
    phone: '+91 98333 99001',
    address: 'South Extension, New Delhi',
    distanceKm: 4.8,
    capacity: '300 meals/day',
    verified: true,
    coordinates: [77.2185, 28.5728]
  }
];

// Helper methods
const dataStore = {
  isMongo: () => isMongoConnected,
  getUsers: () => users,
  findUserByEmail: (email) => users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  findUserById: (id) => users.find(u => u._id === id || String(u._id) === String(id)),
  createUser: (userData) => {
    const newUser = {
      _id: 'user_' + Date.now(),
      ...userData,
      password: bcrypt.hashSync(userData.password || 'password123', 10),
      createdAt: new Date()
    };
    users.push(newUser);
    return newUser;
  },

  getDonations: () => donations,
  findDonationById: (id) => donations.find(d => d._id === id || String(d._id) === String(id)),
  createDonation: (donationData) => {
    const newDonation = {
      _id: 'don_' + Date.now(),
      ...donationData,
      status: 'Available',
      assignedNgo: null,
      ngoName: '',
      ngoAddress: '',
      deliveryAgent: null,
      agentName: '',
      agentPhone: '',
      currentLocation: {
        lat: donationData.pickupLocation?.coordinates ? donationData.pickupLocation.coordinates[1] : 28.6139,
        lng: donationData.pickupLocation?.coordinates ? donationData.pickupLocation.coordinates[0] : 77.2090,
        updatedAt: new Date()
      },
      createdAt: new Date()
    };
    donations.unshift(newDonation);
    return newDonation;
  },

  updateDonation: (id, updates) => {
    const index = donations.findIndex(d => d._id === id || String(d._id) === String(id));
    if (index === -1) return null;
    donations[index] = { ...donations[index], ...updates, updatedAt: new Date() };
    return donations[index];
  },

  getNearbyNgos: () => nearbyNgosStatic
};

module.exports = dataStore;
