# Nexus - Full Stack Investment & Collaboration Platform
## Technical Documentation & Reference Manual

Welcome to the official technical documentation for **Nexus**. This document provides an in-depth reference for the architecture, system chambers, database schemas, frontend routing guards, real-time signaling layers, e-signature configurations, and deployment strategies implemented within the application.

---

## 📖 Executive Summary
**Nexus** is a premium, secure business matchmaking and collaboration ecosystem designed for **Entrepreneurs** and **Investors**. 

The platform allows entrepreneurs to pitch their startups, request funding, and manage document verification. Investors can track their deal pipelines, analyze portfolio aggregates, schedule double-booking protected meetings, and communicate instantly with founders via a unified real-time chat and WebRTC-based high-definition video calling system.

---

## 📁 Repository Architecture & Folder Structure

Nexus is built as a modular monorepo containing a React TypeScript SPA frontend (`/Client`) and a Node.js Express API backend (`/Server`) with MongoDB Atlas data storage and Socket.IO real-time capabilities.

```text
Nexus/
├── Client/                     # React + Vite + TypeScript SPA
│   ├── public/                 # Static assets (favicons, logos)
│   ├── src/
│   │   ├── components/         # Shared UI components
│   │   │   ├── auth/           # Route Guards (ProtectedRoute, PublicRoute)
│   │   │   ├── chat/           # Chat & Message display components
│   │   │   ├── layout/         # Navigation & Dashboard Sidebar wrappers
│   │   │   └── ui/             # Atoms (Button, Card, Input, Badge, Avatar)
│   │   ├── context/            # AuthContext, AppProvider
│   │   ├── pages/              # App Feature Pages
│   │   │   ├── auth/           # Auth flow (Login, Register, Recover, Reset)
│   │   │   ├── chat/           # Live Chat Page + WebRTC calling modals
│   │   │   ├── deals/          # Dynamic Deals Pipeline Manager
│   │   │   ├── documents/      # Cloudinary upload + Canvas E-signature
│   │   │   ├── meetings/       # Monthly Agenda Grid & Invite controller
│   │   │   └── settings/       # Profile management & Security tabs
│   │   ├── types/              # Global TypeScript declarations
│   │   ├── App.tsx             # Route registry & wrappers
│   │   └── main.tsx            # DOM initialization entry
│   ├── vercel.json             # Vercel SPA routing rewrite config
│   └── package.json            # Client-side dependency list
│
├── Server/                     # Node.js + Express + Socket.IO API
│   ├── src/
│   │   ├── config/             # Database connection & Environment setups
│   │   ├── controllers/        # Express request controller endpoints
│   │   ├── middlewares/        # Auth verification & Multer file uploads
│   │   ├── models/             # Mongoose Schemas (User, Deal, Doc, Meeting, etc)
│   │   ├── routes/             # REST endpoint mapping routers
│   │   ├── services/           # Socket.IO & WebRTC signaling service
│   │   └── utils/              # Cloudinary configs & email templates
│   ├── server.js               # Node server listener & Socket mounting
│   ├── vercel.json             # Serverless deployment configuration
│   └── package.json            # Server-side dependency list
└── README.md                   # Quickstart installation guide
```

---

## 🛠️ Complete Feature Breakdown & System Chambers

### 🔐 1. Authentication Chamber & Route Guards
* **Auth Scheme:** Cookie-based HTTP-only JSON Web Tokens (JWT) for secure session tracking.
* **Context State Management:** Built on top of a React `useReducer` pattern with `SET_LOGIN` and `SET_LOGOUT` dispatches. It exposes `user`, `isAuth`, `isAppLoading`, and helper functions like `login`, `register`, `logout`, `forgotPassword`, and `resetPassword`.
* **Guard Elements:**
  * **`ProtectedRoute`**: Protects dashboard routes. If checking credentials, displays a premium spinner. If not logged in, bounces users back to `/login`.
  * **`PublicRoute`**: Guards auth views (Login/Register/Recover). If an authenticated user attempts to access these, it automatically redirects them to their respective role's dashboard (`/dashboard/investor` or `/dashboard/entrepreneur`).

### 💬 2. Real-Time Chat & WebRTC Video Calling
* **Instant Messaging:** Direct P2P messaging utilizing web sockets.
  * **CORS Config:** Fixed Socket.IO handshake CORS restrictions by binding authorization credentials (`credentials: true`) and white-listing local and production origins.
  * **HTTP Fallback:** If the client disconnects from the web socket server, messages fall back to an HTTP `POST /api/message` endpoint to guarantee delivery.
* **WebRTC Signaling Server:** relays Peer connection signals:
  * `call_user`: Sends SDP offers between clients.
  * `answer_call`: Sends remote SDP answer back to caller.
  * `ice_candidate`: Relays ICE networking coordinates.
  * `end_call`: Informs remote peer to close streams.
* **WebRTC Client-Side Integration:**
  * Uses `navigator.mediaDevices.getUserMedia` to acquire high-quality local camera/microphone streams.
  * Establishes `RTCPeerConnection` with public STUN servers (`stun.l.google.com:19302`).
  * **Render Lifecycle Synchronization:** Stores the incoming stream in React state and binds the streams to HTML5 `<video>` elements via `useEffect` once elements render. This avoids "black screen" rendering bugs caused by asynchronous DOM updates.
  * Includes toggles for camera enable/disable, mic audio muting, and hang-up actions.

### 📄 3. Document Processing Chamber & E-Signatures
* **Cloudinary Storage Upload:** Uploads files through a Multer configuration. Enforces `resource_type: "raw"` for non-image files (PDFs, spreadsheets, DOCX) to bypass Cloudinary's 401 unauthorized extraction/transformation limits.
* **E-Signature Drawing Canvas:** Incorporates an HTML5 canvas interface that tracks mouse/touch movements, converting drawings to high-quality PNG signatures linked to documents in the database.
* **Document Viewer:** Renders PDF files using a secure `https` source inside an `<object>` tag with an embedded Google Docs Viewer fallback and a direct "Open in New Tab" header utility.

### 📊 4. Deals Pipeline Manager
* **Dynamic Analytics Aggregation:** Replaces static cards with calculated database values for:
  * **Total Investments** ($M / $K conversions).
  * **Active Pipeline Count** (active negotiation stages).
  * **Portfolio Companies Count**.
* **Inline Modal Form:** Interactive popup form allowing investors/entrepreneurs to add deals directly.
* **Status Controls:** Drag-and-drop or select dropdown update systems to change investment stages dynamically, along with record-deleting capabilities.

### 📅 5. Meeting Calendar & Double-Booking Protection
* **Agenda Grid Calendar:** Renders a responsive grid calendar displaying current days and automatically highlights booked days.
* **Conflict Prevention Validation:** Backend validation checking participant calendars. If the host or guest has a meeting scheduled at the exact same Date and Time Slot, the server rejects scheduling with a conflict warning.
* **Invitation Status Hub:** Direct Accept/Reject action dispatches that update MongoDB and sync both user agendas.

### ⚙️ 6. Settings & Profile Editor
* **Tab Selection:** Dynamic tabs for Profile, Security, and coming-soon placeholders.
* **Avatar Upload & Preview:** Allows users to choose an image file, previews it instantly on the client side, and uploads it to Cloudinary. It then dispatches the new user details globally.
* **Password Encryption Change:** Compares the current password's bcrypt hash and encrypts new passwords with a salt strength of `10`.

---

## 🗄️ Database Schemas & Data Models

### 👤 User Model (`user.model.js`)
Stores authentication credentials, role specifications, and profile information:
```javascript
{
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['entrepreneur', 'investor'] },
  avatarUrl: { type: String, default: '' },
  bio: { type: String, default: '' },
  isOnline: { type: Boolean, default: false },
  
  // Entrepreneur fields
  startupName: { type: String, default: '' },
  pitchSummary: { type: String, default: '' },
  fundingNeeded: { type: String, default: '' },
  industry: { type: String, default: '' },
  location: { type: String, default: '' },
  foundedYear: { type: Number },
  teamSize: { type: Number, default: 0 },

  // Investor fields
  investmentInterests: { type: [String], default: [] },
  investmentStage: { type: [String], default: [] },
  portfolioCompanies: { type: [String], default: [] },
  totalInvestments: { type: Number, default: 0 },
  minimumInvestment: { type: String, default: '' },
  maximumInvestment: { type: String, default: '' }
}
```

### 💬 Message Model (`message.model.js`)
Tracks the direct communication history between users:
```javascript
{
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}
```

### 📄 Document Model (`document.model.js`)
Tracks files, versions, ownership, sharing state, and electronic signature logs:
```javascript
{
  name: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, default: 'pdf' },
  fileSize: { type: Number, default: 0 },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'pending_signature', 'signed', 'approved'], default: 'draft' },
  version: { type: Number, default: 1 },
  signatureImageUrl: { type: String, default: '' },
  signedAt: { type: Date },
  isShared: { type: Boolean, default: false }
}
```

### 📊 Deal Model (`deal.model.js`)
Manages investment records and progress:
```javascript
{
  startupName: { type: String, required: true },
  investorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  entrepreneurId: { type: Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true }, // in USD
  equity: { type: Number, required: true }, // in %
  status: { type: String, enum: ['Lead', 'Due Diligence', 'Term Sheet', 'Closed Won', 'Closed Lost'], default: 'Lead' },
  notes: { type: String, default: '' }
}
```

### 📅 Meeting Model (`meeting.model.js`)
Tracks scheduled appointments:
```javascript
{
  title: { type: String, required: true },
  description: { type: String },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  timeSlot: { type: String, required: true }, // e.g. "10:00 - 11:00"
  host: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  guest: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}
```

---

## 📈 Git Development Timeline & Evolution History

The project history shows a structured implementation from server-side configurations to frontend page integrations:

1. **Initial Foundation Setup:**
   * Server application initialization, database seeding scripts for development (`sarah.johnson@techwave.io` & `michael.r@vcinnovate.com`).
   * JWT cookies authentication, registration validation, and password recovery emails.
2. **Dashboard & Metrics Integration:**
   * Context-bound API integration for dashboards (`/api/user?role=...`).
   * Profile displays fetching details by ID (`/api/user/:id`).
3. **Real-time Messaging Service:**
   * Created server-side socket gateway white-listing CORS headers.
   * Built message history fetch endpoints (`GET /api/message/:userId`) and socket relays for live communication.
4. **Notification Architecture:**
   * Added notifications (`/api/notification`) with real-time alerts.
5. **Document Processing Chamber:**
   * Multer-Cloudinary setup to upload documents.
   * E-signature canvas signing updates and Google Docs embed viewers fallback fixing.
6. **Deals & Pipeline Manager:**
   * Dynamic portfolio aggregates, status updates, and inline forms.
7. **Calendar Agenda & WebRTC Calls:**
   * Meeting conflict validation checks on identical time slots.
   * WebRTC signaling relays on sockets and `useEffect` asynchronous video element hooks rendering fixes.
8. **Vercel Deploy Configuration:**
   * Created SPA redirect `vercel.json` configurations to solve `404 Not Found` refresh issues.

---

## ☁️ Production Deployment Reference (Vercel)

For production deployment, configure the repository as **two separate Vercel projects** pointing to the same git repository:

### 1. Client Project Setup (Frontend)
- **Framework Preset:** Vite
- **Root Directory:** `Client`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:**
  - `VITE_BACKEND_URL`: `https://nexus-api.vercel.app` (Your Server API URL)

*The frontend uses [Client/vercel.json](file:///c:/Users/user/Desktop/Web%20Dev/SMIT-WAMD/Nexus/Client/vercel.json) to redirect all client routes to `/index.html` to prevent refresh-based 404 errors.*

### 2. Server Project Setup (Backend API)
- **Framework Preset:** Other / None (Node.js)
- **Root Directory:** `Server`
- **Environment Variables:**
  - `MONGO_URI`: Your production MongoDB Connection string.
  - `JWT_SECRET`: Random secure string used to sign cookie tokens.
  - `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name.
  - `CLOUDINARY_API_KEY`: Cloudinary API Key.
  - `CLOUDINARY_API_SECRET`: Cloudinary API Secret.
  - `FRONTEND_URL`: `https://nexus-app.vercel.app` (Your Client URL for CORS white-listing)

*The backend uses [Server/vercel.json](file:///c:/Users/user/Desktop/Web%20Dev/SMIT-WAMD/Nexus/Server/vercel.json) to route all backend API endpoints to the Express handler in `server.js` using Vercel serverless Node.js functions.*
