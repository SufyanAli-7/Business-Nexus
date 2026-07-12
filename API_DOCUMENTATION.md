# Nexus API Reference Documentation

This document contains a complete technical reference for all RESTful API endpoints hosted on the Nexus backend server.

---

## 🔑 Global Configuration & Headers

* **Base URL:** `https://business-nexus-sigma.vercel.app/api` (Production) or `http://localhost:3000/api` (Local)
* **Default Request Format:** `application/json`
* **Default Response Format:** `application/json`
* **Session Tracking:** State is managed via cookies. Secure, HTTP-only cookie named `token` containing the authenticated user's JWT is required for all endpoints under the `authMiddleware` section.

---

## 🚪 1. Authentication Endpoints (`/api/auth`)

### 1.1 User Registration
* **Endpoint:** `/auth/register`
* **Method:** `POST`
* **Auth Required:** No
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "name": "Sarah Johnson",
    "email": "sarah.j@example.com",
    "password": "securepassword123",
    "role": "entrepreneur"
  }
  ```
  * `role` must be either `"entrepreneur"` or `"investor"`.
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User created successfully"
  }
  ```
  *(Sets a cookie named `token` containing the session JWT)*
* **Error Responses:**
  * **401 Unauthorized:** User already exists or missing required parameters.
  * **500 Internal Server Error:** General database processing failure.

---

### 1.2 User Login
* **Endpoint:** `/auth/login`
* **Method:** `POST`
* **Auth Required:** No
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "email": "sarah.j@example.com",
    "password": "securepassword123",
    "role": "entrepreneur"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful"
  }
  ```
  *(Sets a cookie named `token` containing the session JWT)*
* **Error Responses:**
  * **400 Bad Request:** Missing login credentials.
  * **401 Unauthorized:** Invalid password, unregistered email, or role mismatch.
  * **500 Internal Server Error:** General database query failure.

---

### 1.3 User Logout
* **Endpoint:** `/auth/logout`
* **Method:** `POST`
* **Auth Required:** No (Will clear cookies anyway)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logout Successful"
  }
  ```
  *(Clears the `token` cookie)*

---

### 1.4 Request Password Reset Link
* **Endpoint:** `/auth/forgot-password`
* **Method:** `POST`
* **Auth Required:** No
* **Request Body:**
  ```json
  {
    "email": "sarah.j@example.com"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Password reset token sent to your email"
  }
  ```
* **Error Responses:**
  * **404 Not Found:** Email is not registered.

---

### 1.5 Execute Password Reset
* **Endpoint:** `/auth/reset-password/:token`
* **Method:** `POST`
* **Auth Required:** No
* **Request Body:**
  ```json
  {
    "password": "newsecurepassword123"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Password updated successfully"
  }
  ```
* **Error Responses:**
  * **400 Bad Request:** Token has expired or is invalid.

---

## 👤 2. User & Profile Endpoints (`/api/user`)

### 2.1 Get Authenticated User Profile
* **Endpoint:** `/user/profile`
* **Method:** `GET`
* **Auth Required:** Yes (JWT Cookie)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": "6a51caebdefe65b82cd9a544",
      "name": "Sarah Johnson",
      "email": "sarah.j@example.com",
      "role": "entrepreneur",
      "avatarUrl": "https://res.cloudinary.com/example/image.png",
      "bio": "Building the future of green tech.",
      "location": "San Francisco, CA",
      "startupName": "EcoCorp",
      "pitchSummary": "Solar powered micro grids.",
      "fundingNeeded": "500k",
      "teamSize": 5,
      "isOnline": true
    }
  }
  ```

---

### 2.2 Get User Profile by ID
* **Endpoint:** `/user/:id`
* **Method:** `GET`
* **Auth Required:** Yes (JWT Cookie)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": "6a51caebdefe65b82cd9a544",
      "name": "Sarah Johnson",
      "email": "sarah.j@example.com",
      "role": "entrepreneur",
      "avatarUrl": "https://res.cloudinary.com/example/image.png",
      "bio": "Building the future of green tech.",
      "location": "San Francisco, CA"
    }
  }
  ```

---

### 2.3 Get Filtered User List
* **Endpoint:** `/user`
* **Method:** `GET`
* **Auth Required:** Yes (JWT Cookie)
* **Query Parameters:**
  * `role` (Optional): Filter users by role. E.g. `/user?role=investor` or `/user?role=entrepreneur`.
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "users": [
      {
        "id": "6a51caebdefe65b82cd9a544",
        "name": "Sarah Johnson",
        "role": "entrepreneur"
      }
    ]
  }
  ```

---

### 2.4 Update Profile Details & Avatar
* **Endpoint:** `/user/profile`
* **Method:** `PUT`
* **Auth Required:** Yes (JWT Cookie)
* **Headers:** `Content-Type: multipart/form-data`
* **Request Body (Form-Data):**
  * `name` (Optional): String
  * `email` (Optional): String
  * `location` (Optional): String
  * `bio` (Optional): String
  * `avatar` (Optional): Binary File (JPG, PNG, GIF. Max size 800KB)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "user": {
      "id": "6a51caebdefe65b82cd9a544",
      "name": "Sarah Johnson Updated",
      "email": "sarah.new@example.com",
      "role": "entrepreneur",
      "avatarUrl": "https://res.cloudinary.com/new_avatar.png",
      "location": "New York, NY",
      "bio": "Updated Bio content"
    }
  }
  ```
* **Error Responses:**
  * **400 Bad Request:** Email already in use.

---

### 2.5 Change Password
* **Endpoint:** `/user/change-password`
* **Method:** `PUT`
* **Auth Required:** Yes (JWT Cookie)
* **Request Body:**
  ```json
  {
    "currentPassword": "oldsecurepassword123",
    "newPassword": "newsecurepassword123",
    "confirmNewPassword": "newsecurepassword123"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Password updated successfully"
  }
  ```
* **Error Responses:**
  * **400 Bad Request:** Missing fields, passwords mismatch, or currentPassword is incorrect.

---

## 💬 3. Message & Chat Endpoints (`/api/message`)

### 3.1 Get User Conversations List
* **Endpoint:** `/message/conversations`
* **Method:** `GET`
* **Auth Required:** Yes (JWT Cookie)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "conversations": [
      {
        "id": "thread123",
        "otherUser": {
          "id": "6a51d03e9e54551262d1c46e",
          "name": "Michael Rodriguez",
          "avatarUrl": "https://res.cloudinary.com/example/michael.jpg"
        },
        "lastMessage": {
          "content": "Hey! Did you check the term sheet?",
          "timestamp": "2026-07-12T04:22:00.000Z",
          "senderId": "6a51d03e9e54551262d1c46e"
        }
      }
    ]
  }
  ```

---

### 3.2 Get Chat Messages Thread
* **Endpoint:** `/message/:otherUserId`
* **Method:** `GET`
* **Auth Required:** Yes (JWT Cookie)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "messages": [
      {
        "id": "msg_01",
        "senderId": "6a51caebdefe65b82cd9a544",
        "receiverId": "6a51d03e9e54551262d1c46e",
        "content": "Hello, when are we meeting?",
        "timestamp": "2026-07-12T04:00:00.000Z",
        "isRead": true
      }
    ]
  }
  ```

---

### 3.3 Post Message (REST Fallback)
* **Endpoint:** `/message`
* **Method:** `POST`
* **Auth Required:** Yes (JWT Cookie)
* **Request Body:**
  ```json
  {
    "receiverId": "6a51d03e9e54551262d1c46e",
    "content": "Confirming the appointment slot."
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": {
      "id": "msg_02",
      "senderId": "6a51caebdefe65b82cd9a544",
      "receiverId": "6a51d03e9e54551262d1c46e",
      "content": "Confirming the appointment slot.",
      "timestamp": "2026-07-12T04:30:00.000Z",
      "isRead": false
    }
  }
  ```

---

## 🔔 4. Notification Endpoints (`/api/notification`)

### 4.1 Get User Notifications
* **Endpoint:** `/notification`
* **Method:** `GET`
* **Auth Required:** Yes (JWT Cookie)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "notifications": [
      {
        "id": "notify_01",
        "type": "message",
        "content": "Michael Rodriguez sent you a new message",
        "unread": true,
        "timestamp": "2026-07-12T05:00:00.000Z"
      }
    ]
  }
  ```

---

### 4.2 Mark All Notifications as Read
* **Endpoint:** `/notification/mark-all-read`
* **Method:** `PUT`
* **Auth Required:** Yes (JWT Cookie)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "All notifications marked as read"
  }
  ```

---

### 4.3 Mark Single Notification as Read
* **Endpoint:** `/notification/:id/read`
* **Method:** `PUT`
* **Auth Required:** Yes (JWT Cookie)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Notification marked as read"
  }
  ```

---

## 📄 5. Document Endpoints (`/api/document`)

### 5.1 Upload Document file
* **Endpoint:** `/document`
* **Method:** `POST`
* **Auth Required:** Yes (JWT Cookie)
* **Headers:** `Content-Type: multipart/form-data`
* **Request Body (Form-Data):**
  * `file`: Binary File (PDF, DOCX, CSV, Image)
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Document uploaded successfully",
    "document": {
      "id": "doc_88",
      "name": "BusinessPlan.pdf",
      "fileUrl": "https://res.cloudinary.com/example/raw/upload/BusinessPlan.pdf",
      "fileType": "pdf",
      "fileSize": 120405,
      "uploadedBy": "6a51caebdefe65b82cd9a544",
      "status": "pending_signature",
      "version": 1,
      "isShared": false
    }
  }
  ```

---

### 5.2 Get User Documents List
* **Endpoint:** `/document`
* **Method:** `GET`
* **Auth Required:** Yes (JWT Cookie)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "documents": [
      {
        "id": "doc_88",
        "name": "BusinessPlan.pdf",
        "fileUrl": "https://res.cloudinary.com/example/raw/upload/BusinessPlan.pdf",
        "status": "pending_signature",
        "version": 1,
        "isShared": false
      }
    ]
  }
  ```

---

### 5.3 Apply E-Signature to Document
* **Endpoint:** `/document/:id/sign`
* **Method:** `PUT`
* **Auth Required:** Yes (JWT Cookie)
* **Request Body:**
  ```json
  {
    "signatureImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQ..."
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Document signed successfully",
    "document": {
      "id": "doc_88",
      "status": "signed",
      "signatureImageUrl": "https://res.cloudinary.com/signature_saved.png",
      "signedAt": "2026-07-12T05:10:00.000Z"
    }
  }
  ```

---

### 5.4 Toggle Document Sharing Status
* **Endpoint:** `/document/:id/share`
* **Method:** `PUT`
* **Auth Required:** Yes (JWT Cookie)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Document sharing status updated successfully",
    "document": {
      "id": "doc_88",
      "isShared": true
    }
  }
  ```

---

### 5.5 Delete Document
* **Endpoint:** `/document/:id`
* **Method:** `DELETE`
* **Auth Required:** Yes (JWT Cookie)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Document deleted successfully"
  }
  ```

---

## 📊 6. Deal Pipeline Endpoints (`/api/deal`)

### 6.1 Create New Deal Record
* **Endpoint:** `/deal`
* **Method:** `POST`
* **Auth Required:** Yes (JWT Cookie)
* **Request Body:**
  ```json
  {
    "startupName": "SolarForce Inc",
    "amount": 250000,
    "equity": 12,
    "status": "Lead",
    "notes": "Met at VC convention. High potential."
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Deal created successfully",
    "deal": {
      "id": "deal_001",
      "startupName": "SolarForce Inc",
      "amount": 250000,
      "equity": 12,
      "status": "Lead",
      "notes": "Met at VC convention. High potential."
    }
  }
  ```

---

### 6.2 Get Deals list
* **Endpoint:** `/deal`
* **Method:** `GET`
* **Auth Required:** Yes (JWT Cookie)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "deals": [
      {
        "id": "deal_001",
        "startupName": "SolarForce Inc",
        "amount": 250000,
        "equity": 12,
        "status": "Lead"
      }
    ]
  }
  ```

---

### 6.3 Update Deal Status
* **Endpoint:** `/deal/:id/status`
* **Method:** `PUT`
* **Auth Required:** Yes (JWT Cookie)
* **Request Body:**
  ```json
  {
    "status": "Term Sheet"
  }
  ```
  * `status` must be either: `"Lead"`, `"Due Diligence"`, `"Term Sheet"`, `"Closed Won"`, or `"Closed Lost"`.
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Deal status updated successfully",
    "deal": {
      "id": "deal_001",
      "status": "Term Sheet"
    }
  }
  ```

---

### 6.4 Delete Deal Record
* **Endpoint:** `/deal/:id`
* **Method:** `DELETE`
* **Auth Required:** Yes (JWT Cookie)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Deal deleted successfully"
  }
  ```

---

## 📅 7. Meeting Endpoints (`/api/meeting`)

### 7.1 Schedule Meeting (with Conflict Validation)
* **Endpoint:** `/meeting`
* **Method:** `POST`
* **Auth Required:** Yes (JWT Cookie)
* **Request Body:**
  ```json
  {
    "title": "Board Review Pitch",
    "description": "Discuss seed funding terms.",
    "date": "2026-07-20",
    "timeSlot": "14:00 - 15:00",
    "guestId": "6a51d03e9e54551262d1c46e"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Meeting scheduled successfully",
    "meeting": {
      "id": "meeting_99",
      "title": "Board Review Pitch",
      "date": "2026-07-20",
      "timeSlot": "14:00 - 15:00",
      "host": "6a51caebdefe65b82cd9a544",
      "guest": "6a51d03e9e54551262d1c46e",
      "status": "pending"
    }
  }
  ```
* **Error Responses:**
  * **400 Bad Request:** Double-booking conflict detected. Example message response:
    ```json
    {
      "success": false,
      "message": "Conflict detected: One of the participants has another meeting at this date and time slot."
    }
    ```

---

### 7.2 Get Scheduled Meetings list
* **Endpoint:** `/meeting`
* **Method:** `GET`
* **Auth Required:** Yes (JWT Cookie)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "meetings": [
      {
        "id": "meeting_99",
        "title": "Board Review Pitch",
        "date": "2026-07-20",
        "timeSlot": "14:00 - 15:00",
        "status": "pending"
      }
    ]
  }
  ```

---

### 7.3 Update Invitation Status
* **Endpoint:** `/meeting/:id/status`
* **Method:** `PUT`
* **Auth Required:** Yes (JWT Cookie)
* **Request Body:**
  ```json
  {
    "status": "accepted"
  }
  ```
  * `status` must be either: `"pending"`, `"accepted"`, or `"rejected"`.
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Meeting status updated successfully",
    "meeting": {
      "id": "meeting_99",
      "status": "accepted"
    }
  }
  ```

---

### 7.4 Delete Scheduled Meeting
* **Endpoint:** `/meeting/:id`
* **Method:** `DELETE`
* **Auth Required:** Yes (JWT Cookie)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Meeting deleted successfully"
  }
  ```
