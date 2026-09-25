const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const dataStore = require('../services/dataStore');

// POST /api/donations/donate (Donor / Restaurant)
router.post('/donate', async (req, res) => {
  try {
    const { 
      foodName, 
      quantity, 
      category, 
      donorId, 
      donorName, 
      donorPhone,
      donorType, 
      pickupLocation, 
      coordinates, 
      safetyDeadline, 
      notes 
    } = req.body;

    if (!foodName || !quantity) {
      return res.status(400).json({ error: 'Food name and quantity are required' });
    }

    const coords = Array.isArray(coordinates) && coordinates.length === 2 
      ? coordinates 
      : [77.2090 + (Math.random() - 0.5) * 0.05, 28.6139 + (Math.random() - 0.5) * 0.05];

    const donationData = {
      foodName,
      quantity,
      category: category || 'Vegetarian',
      donor: donorId || 'user_donor_1',
      donorName: donorName || 'Kind Donor',
      donorPhone: donorPhone || '+91 98765 00000',
      donorType: donorType || 'donor',
      pickupLocation: {
        address: typeof pickupLocation === 'string' ? pickupLocation : (pickupLocation?.address || 'Connaught Place, New Delhi'),
        type: 'Point',
        coordinates: coords
      },
      safetyDeadline: safetyDeadline || 'Within 4 hours',
      notes: notes || '',
      status: 'Available',
      currentLocation: {
        lat: coords[1],
        lng: coords[0],
        updatedAt: new Date()
      }
    };

    let newDonation = null;
    if (dataStore.isMongo()) {
      try {
        const mongoDonation = new Donation(donationData);
        await mongoDonation.save();
        newDonation = mongoDonation;
      } catch (err) {
        console.warn('Mongo save skipped for donation:', err.message);
      }
    }

    if (!newDonation) {
      newDonation = dataStore.createDonation(donationData);
    }

    // Broadcast through socket.io if attached to app
    const io = req.app.get('io');
    if (io) {
      io.emit('newDonationAvailable', newDonation);
    }

    res.status(201).json({
      message: 'Donation listed successfully! NGOs are being notified.',
      donation: newDonation
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/donations/nearby-ngos (Nearby NGOs for Donors)
router.get('/nearby-ngos', async (req, res) => {
  try {
    const ngos = dataStore.getNearbyNgos();
    res.json(ngos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/donations/my-requests (Donor's submitted donations)
router.get('/my-requests', async (req, res) => {
  try {
    const { donorId } = req.query;
    let donations = dataStore.getDonations();
    if (donorId) {
      donations = donations.filter(d => String(d.donor) === String(donorId) || d.donorType === 'donor');
    } else {
      donations = donations.filter(d => d.donorType === 'donor');
    }
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/donations/history (Restaurant Owner's Donation History & Analytics)
router.get('/history', async (req, res) => {
  try {
    const { restaurantId } = req.query;
    let donations = dataStore.getDonations();
    if (restaurantId) {
      donations = donations.filter(d => String(d.donor) === String(restaurantId) || d.donorType === 'restaurant');
    } else {
      donations = donations.filter(d => d.donorType === 'restaurant');
    }

    const totalRescued = donations.length;
    const completedCount = donations.filter(d => d.status === 'Completed').length;
    const activeCount = donations.filter(d => d.status !== 'Completed' && d.status !== 'Cancelled').length;

    res.json({
      history: donations,
      analytics: {
        totalDonations: totalRescued,
        completedRescues: completedCount,
        activeRescues: activeCount,
        estimatedMealsRescued: totalRescued * 35,
        estimatedCo2SavedKg: (totalRescued * 35 * 1.8).toFixed(1)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/donations/track/:id (Live Tracking details for Donor, Restaurant, NGO, Agent)
router.get('/track/:id', async (req, res) => {
  try {
    const donation = dataStore.findDonationById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: 'Donation tracking record not found' });
    }
    res.json({
      donationId: donation._id,
      foodName: donation.foodName,
      status: donation.status,
      pickup: {
        address: donation.pickupLocation.address,
        lat: donation.pickupLocation.coordinates[1],
        lng: donation.pickupLocation.coordinates[0]
      },
      dropoff: {
        ngoName: donation.ngoName || 'Annapurna Food Bank',
        address: donation.ngoAddress || 'Lajpat Nagar, New Delhi',
        lat: 28.5677,
        lng: 77.2433
      },
      agent: {
        name: donation.agentName || 'Vikram Singh (Rider)',
        phone: donation.agentPhone || '+91 98444 55667',
        currentLat: donation.currentLocation?.lat || 28.5600,
        currentLng: donation.currentLocation?.lng || 77.2200,
        updatedAt: donation.currentLocation?.updatedAt || new Date()
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;