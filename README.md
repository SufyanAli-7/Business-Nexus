# Nexus - Investment & Collaboration Platform

Nexus is a premium web application designed to bridge the gap between **Entrepreneurs** and **Investors**. It provides a secure, interactive ecosystem for pitch presentations, deal pipeline management, secure document verification with electronic signatures, meeting scheduling with calendar synchronization, and real-time communication featuring chat and WebRTC-based video calling.

---

## 🏗️ Repository Architecture

Nexus is organized as a monorepo containing two main components:
- **/Client**: React (TypeScript), Vite, and CSS styling.
- **/Server**: Node.js, Express.js, MongoDB (Mongoose), and Socket.IO.

```text
Nexus/
├── Client/     # React + Vite Frontend
└── Server/     # Node.js + Express Backend
```

---

## 🚀 Key Features

### 🔐 1. Authentication & Route Guards
- **Secure JWT Auth:** Cookies-based HTTP-only JWT authentication.
- **Route Protection:** Wrappers for route lifecycle control:
  - `ProtectedRoute`: Bounces non-logged-in users back to `/login`.
  - `PublicRoute`: Autoredirects authenticated users directly to their roles' dashboard.
- **Role-Based Experience:** Custom dashboards for **Entrepreneurs** (focusing on startup metrics, team, and funding needed) and **Investors** (focusing on investment interests, portfolios, and deal pipelines).

### 💬 2. Real-Time Chat & WebRTC Video Calling
- **Instant Messaging:** Real-time web sockets (Socket.IO) messaging with instant updates, fallback to HTTP REST endpoints if sockets are disconnected.
- **WebRTC P2P Video Calls:** One-to-one WebRTC video calling initiated directly from chat pages.
- **Call Controls:** Live local/remote video rendering, picture-in-picture layout, audio mute toggle, camera off toggle, and clean call hang-up/decline handlers.

### 📄 3. Document Processing & E-Signatures
- **Cloudinary Integration:** Cloudinary cloud storage configured with `resource_type: "raw"` for secure PDF/Office file delivery.
- **E-Signature Pad:** HTML5 canvas e-signing board to draw and link signatures directly to documents in the database.
- **Interactive PDF Viewer:** Embedded previews with automatic fallback options (Google Docs viewer and direct tab links).

### 📊 4. Deals Pipeline Manager
- **Portfolio Metrics:** Dynamic startup metrics (Total investment aggregates, equity shares, active vs. closed pipelines).
- **Update Status:** Instantly update stage phases and delete items.
- **Popup Add Form:** Add investment deals on the fly with responsive modal inputs.

### 📅 5. Meeting Scheduler & Grid Calendar
- **Interactive Calendar:** Full monthly grid calendar highlight showing scheduled appointment slots.
- **Double-Booking Protection:** Automated conflict detection preventing overlaps on identical date/time slots.
- **Invitations Hub:** Direct accept/decline action triggers updating MongoDB records.

### ⚙️ 6. Settings Panel
- **Profile Customization:** Edit bio, location, name, and email details.
- **Avatar Changing:** Direct Cloudinary uploads with client-side image size checks and instant previews.
- **Security Control:** Current password matching and hashing for secure password updates.

---

## 🛠️ Tech Stack

### Client (Frontend)
- **Framework:** React 18, Vite, TypeScript
- **Icons:** Lucide React
- **Requests & Realtime:** Axios, Socket.IO Client
- **P2P Streams:** WebRTC APIs (RTCPeerConnection)
- **Toasts:** React Hot Toast

### Server (Backend)
- **Runtime:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Realtime / Signaling:** Socket.IO
- **Storage Service:** Cloudinary API
- **File Parsing:** Multer middleware
- **Authentication:** JWT, BcryptJS

---

## ⚙️ Setup & Installation

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed on your machine.

---

### 2. Server Setup

1. Navigate to the Server directory:
   ```bash
   cd Server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `/Server` folder and populate the variables:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/nexus
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

---

### 3. Client Setup

1. Navigate to the Client directory:
   ```bash
   cd ../Client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `/Client` folder:
   ```env
   VITE_BACKEND_URL=http://localhost:3000
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. Build for production verification:
   ```bash
   npm run build
   ```
