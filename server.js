// server.js
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const donationRoutes = require('./routes/donationRoutes');
const ngoRoutes = require('./routes/ngoRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const dataStore = require('./services/dataStore');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Static Files: Serve Frontend directly at root
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/component', express.static(path.join(__dirname, 'component')));

// 2. Connect to MongoDB gracefully
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/foodrescue';
mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 2000
}).then(() => {
    console.log("✅ MongoDB Connected successfully");
}).catch(err => {
    console.log("ℹ️ MongoDB offline or unreachable: Running seamlessly with live in-memory data store");
});

// 3. Location Schema (Mongoose Model if connected)
const locationSchema = new mongoose.Schema({
    donationId: { type: String, required: true, unique: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    agentName: { type: String },
    updatedAt: { type: Date, default: Date.now }
});

let Location;
try {
    Location = mongoose.model('Location', locationSchema);
} catch (e) {
    Location = mongoose.models.Location;
}

// 4. HTTP Server and Socket.io setup
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH"]
    }
});

// Attach io to express app so routes can broadcast
app.set('io', io);

// 5. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/delivery', deliveryRoutes);

// ================= API Endpoints for Location & Tracking =================

// API: Update Location (Called by delivery agent or simulation)
app.post('/api/update-location', async (req, res) => {
    const { donationId, lat, lng, agentName } = req.body;

    if (!donationId || lat === undefined || lng === undefined) {
        return res.status(400).json({ error: 'Missing donationId, lat, or lng' });
    }

    try {
        // Update in dataStore
        dataStore.updateDonation(donationId, {
            currentLocation: { lat, lng, updatedAt: new Date() },
            agentName: agentName || 'Delivery Agent'
        });

        // If mongo is active, update mongo as well
        if (dataStore.isMongo() && Location) {
            await Location.findOneAndUpdate(
                { donationId: donationId },
                { lat, lng, agentName, updatedAt: new Date() },
                { new: true, upsert: true }
            );
        }

        // Broadcast location update via Socket.io to the specific tracking room and globally
        io.to(`tracking-${donationId}`).emit('locationUpdate', {
            donationId,
            lat,
            lng,
            agentName,
            updatedAt: new Date()
        });

        io.emit('agentLiveMoved', { donationId, lat, lng, agentName });

        res.status(200).json({ message: 'Location updated successfully', lat, lng });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Fetch current location for a donation
app.get('/api/get-location/:donationId', async (req, res) => {
    try {
        const donation = dataStore.findDonationById(req.params.donationId);
        if (donation && donation.currentLocation) {
            return res.json({
                donationId: donation._id,
                lat: donation.currentLocation.lat,
                lng: donation.currentLocation.lng,
                agentName: donation.agentName || 'Vikram Singh (Rider)',
                status: donation.status,
                updatedAt: donation.currentLocation.updatedAt
            });
        }

        if (dataStore.isMongo() && Location) {
            const loc = await Location.findOne({ donationId: req.params.donationId });
            if (loc) return res.json(loc);
        }

        res.status(404).json({ error: 'Location not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve frontend.html for non-API routes
app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
        return next();
    }
    res.sendFile(path.join(__dirname, 'frontend', 'frontend.html'));
});

// ================= Socket.io Real-time Connection =================
io.on('connection', (socket) => {
    console.log(`⚡ New Client Connected: ${socket.id}`);

    // Join tracking room for a specific donation ID
    socket.on('joinTracking', (donationId) => {
        socket.join(`tracking-${donationId}`);
        console.log(`Socket ${socket.id} joined tracking room: tracking-${donationId}`);
    });

    // Real-time location stream from delivery agent
    socket.on('sendLocation', (data) => {
        const { donationId, lat, lng, agentName } = data;
        if (donationId) {
            dataStore.updateDonation(donationId, {
                currentLocation: { lat, lng, updatedAt: new Date() }
            });
            io.to(`tracking-${donationId}`).emit('locationUpdate', {
                donationId,
                lat,
                lng,
                agentName,
                updatedAt: new Date()
            });
        }
    });

    socket.on('disconnect', () => {
        console.log(`Client Disconnected: ${socket.id}`);
    });
});

// Port configuration: use 5001 by default on macOS to avoid AirPlay conflict on 5000
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`
======================================================
  🍱 FoodRescue Platform Server is Running!
  👉 Web App: http://localhost:${PORT}
  👉 API Endpoint: http://localhost:${PORT}/api
======================================================
    `);
});