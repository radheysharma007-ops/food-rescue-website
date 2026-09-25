const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');

// GET /api/delivery/available-deliveries (Available Deliveries)
router.get('/available-deliveries', async (req, res) => {
  try {
    const all = dataStore.getDonations();
    // Deliveries that have been accepted by NGO or agent requested and need pickup
    const available = all.filter(d => 
      (d.status === 'Accepted' || d.status === 'Agent_Requested') && !d.deliveryAgent
    );
    res.json(available);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/delivery/accept-delivery/:id (Accept Delivery)
router.patch('/accept-delivery/:id', async (req, res) => {
  try {
    const { agentId, agentName, agentPhone } = req.body;
    const donation = dataStore.findDonationById(req.params.id);

    if (!donation) {
      return res.status(404).json({ error: 'Delivery task not found' });
    }

    const updated = dataStore.updateDonation(req.params.id, {
      status: 'Out_For_Delivery',
      deliveryAgent: agentId || 'user_agent_1',
      agentName: agentName || 'Vikram Singh (Rider)',
      agentPhone: agentPhone || '+91 98444 55667',
      currentLocation: {
        lat: donation.pickupLocation.coordinates[1],
        lng: donation.pickupLocation.coordinates[0],
        updatedAt: new Date()
      }
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('deliveryAcceptedByAgent', updated);
      io.to(`tracking-${req.params.id}`).emit('locationUpdate', {
        lat: updated.currentLocation.lat,
        lng: updated.currentLocation.lng,
        status: updated.status,
        agentName: updated.agentName
      });
    }

    res.json({
      message: 'Delivery accepted! Navigation route is now active.',
      donation: updated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/delivery/complete-delivery/:id (Mark Completed)
router.patch('/complete-delivery/:id', async (req, res) => {
  try {
    const donation = dataStore.findDonationById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: 'Delivery record not found' });
    }

    const updated = dataStore.updateDonation(req.params.id, {
      status: 'Completed',
      completedAt: new Date()
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('deliveryCompleted', updated);
      io.to(`tracking-${req.params.id}`).emit('statusUpdate', { status: 'Completed', donation: updated });
    }

    res.json({
      message: 'Rescue mission successfully completed! Food safely delivered to NGO.',
      donation: updated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/delivery/completed (Completed Deliveries)
router.get('/completed', async (req, res) => {
  try {
    const { agentId } = req.query;
    const all = dataStore.getDonations();
    const completed = all.filter(d => 
      d.status === 'Completed' && (!agentId || String(d.deliveryAgent) === String(agentId))
    );
    res.json(completed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;