# 🍱 Food Rescue Platform — Backend
A **full-stack food rescue platform** that connects food donors, restaurants, NGOs, and delivery agents to reduce food waste and feed communities in need. Built with Node.js, Express, MongoDB, and Socket.io for real-time live tracking.
---
## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
  - [Auth Routes](#auth-routes)
  - [Donation Routes](#donation-routes)
  - [NGO Routes](#ngo-routes)
  - [Delivery Routes](#delivery-routes)
  - [Location Tracking](#location-tracking)
- [Real-time Events (Socket.io)](#real-time-events-socketio)
- [Data Models](#data-models)
- [Architecture Notes](#architecture-notes)
---
## 📖 Overview
The **Food Rescue Platform** is a community-driven application where:
- 🏪 **Restaurants & Donors** list surplus food for rescue
- 🤝 **NGOs** browse and accept available food donations
- 🚴 **Delivery Agents** pick up and deliver food to NGOs
- 📍 **Live GPS Tracking** lets all parties track deliveries in real time
The backend seamlessly operates in **two modes**:
- ✅ **MongoDB Connected** — Data persisted to database
- ⚡ **Offline / In-Memory** — Falls back to a live in-memory data store (no setup required for demos)
---
## ✨ Features
| Feature | Description |
|---|---|
| 🔐 JWT Authentication | Signup / Login with role-based access (donor, restaurant, ngo, delivery_agent) || `location` | GeoJSON Point | `[lng, lat]` coordinates |
### Donation
| Field | Type | Notes |
|---|---|---|
| `foodName` | String | Required |
| `quantity` | String | Required |
| `category` | String | `Vegetarian`, `Non-Vegetarian`, `Mixed`, `Vegan`, `Bakery`, `Packaged` |
| `donor` | ObjectId (ref User) | |
| `donorType` | String | `donor` / `restaurant` |
| `pickupLocation` | GeoJSON Point | Address + coordinates |
| `safetyDeadline` | String | |
| `status` | String | See flow below |
| `assignedNgo` | ObjectId (ref User) | |
| `deliveryAgent` | ObjectId (ref User) | |
| `currentLocation` | `{ lat, lng, updatedAt }` | Live GPS |
| `completedAt` | Date | |
**Donation Status Flow:**
```
Available → Accepted (by NGO) → Agent_Requested → Out_For_Delivery → Completed
                                                                    ↘ Cancelled
```
---
## 🏗️ Architecture Notes
- **Dual Data Mode**: `dataStore.js` acts as an in-memory store mirroring MongoDB operations. If MongoDB is unreachable at startup, the app transparently uses this store — no restart needed.
- **Socket.io Rooms**: Each donation gets a private room `tracking-<donationId>`. Clients join this room to receive targeted updates without global broadcast noise.
- **Frontend Serving**: Express serves the static SPA from `/frontend`. All non-API routes return `frontend.html` for client-side routing.
- **GeoJSON + 2dsphere Index**: Pickup locations are stored as GeoJSON `Point` with a `2dsphere` index, enabling efficient geo-proximity queries.
- **JWT Expiry**: Tokens expire after **7 days**. Re-authenticate to receive a new token.
---
## 📜 License
ISC
---
> Built with ❤️ to reduce food waste and feed communities.
