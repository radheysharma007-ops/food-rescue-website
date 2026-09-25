const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');

// GET /api/ngo/available-donations (Donation Requests)
router.get('/available-donations', async (req, res) => {
  try {
    const all = dataStore.getDonations();
    // Return donations that are Available or Accepted by this NGO
    const requests = all.filter(d => d.status === 'Available');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ngo/my-accepted (Donations accepted or managed by NGO)
router.get('/my-accepted', async (req, res) => {
  try {
    const { ngoId } = req.query;
    const all = dataStore.getDonations();
    const accepted = all.filter(d => 
      ['Accepted', 'Agent_Requested', 'Out_For_Delivery', 'Completed'].includes(d.status) &&
      (!ngoId || String(d.assignedNgo) === String(ngoId) || !d.assignedNgo)
    );
    res.json(accepted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/ngo/accept/:id (Accept Donation)
router.patch('/accept/:id', async (req, res) => {
  try {
    const { ngoId, ngoName, ngoAddress } = req.body;
    const donation = dataStore.findDonationById(req.params.id);

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    const updated = dataStore.updateDonation(req.params.id, {
      status: 'Accepted',
      assignedNgo: ngoId || 'user_ngo_1',
      ngoName: ngoName || 'Annapurna Food Bank',
      ngoAddress: ngoAddress || 'Lajpat Nagar, New Delhi'
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('donationAccepted', updated);
      io.to(`tracking-${req.params.id}`).emit('statusUpdate', { status: 'Accepted', donation: updated });
    }

    res.json({
      message: 'Donation accepted successfully! You can now request a delivery agent.',
      donation: updated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/ngo/request-agent/:id (Request Delivery Agent)
router.patch('/request-agent/:id', async (req, res) => {
  try {
    const donation = dataStore.findDonationById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    const updated = dataStore.updateDonation(req.params.id, {
      status: 'Agent_Requested'
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('deliveryAvailable', updated);
      io.to(`tracking-${req.params.id}`).emit('statusUpdate', { status: 'Agent_Requested', donation: updated });
    }

    res.json({
      message: 'Delivery agent broadcasted! Rescue riders in the vicinity will receive this task.',
      donation: updated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;