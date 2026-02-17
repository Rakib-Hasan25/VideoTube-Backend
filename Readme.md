
<div align="center">
  <h1>🎥 VideoTube Backend</h1>
  <h3>A Scalable REST API for a Video Hosting Platform</h3>

  <p>
    A production-ready backend built with Node.js, Express, and MongoDB. <br />
    Features complex aggregation pipelines, JWT authentication, and Cloudinary integration.
  </p>

  <!-- Tech Stack Badges -->
  <p>
    <img src="https://img.shields.io/badge/Runtime-Node.js-green?style=flat-square&logo=node.js" alt="Node.js" />
    <img src="https://img.shields.io/badge/Framework-Express.js-white?style=flat-square&logo=express" alt="Express.js" />
    <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Storage-Cloudinary-blue?style=flat-square&logo=cloudinary" alt="Cloudinary" />
    <img src="https://img.shields.io/badge/Tools-Postman-orange?style=flat-square&logo=postman" alt="Postman" />
  </p>

  <p>
    <a href="#system-architecture"><strong>Architecture</strong></a> ·
    <a href="#key-features"><strong>Features</strong></a> ·
    <a href="#installation"><strong>Installation</strong></a> ·
    <a href="#api-testing"><strong>API Docs</strong></a> ·
    <a href="https://www.youtube.com/playlist?list=PLGMuWOX9e5MrXlnQ4tO8t7n3IDTIalRjt"><strong>Watch Tutorial</strong></a>
  </p>
</div>

---

## 📖 Overview

**VideoTube Backend** is a complex backend project designed to replicate the core functionality of platforms like YouTube. It handles user authentication, video uploads, comments, likes, subscriptions, and playlists.

This project was built in public to demonstrate advanced backend concepts. You can follow the complete development process in this **[YouTube Playlist](https://www.youtube.com/playlist?list=PLGMuWOX9e5MrXlnQ4tO8t7n3IDTIalRjt)**.

---

## 🏗️ System Architecture

<div align="center">
  <!-- Ensure you create an 'assets' folder and move your image there -->
  <img src="./assets/system-architecture.png" alt="System Architecture" width="800">
</div>

---

## ⚡ Key Features

### 🔐 User Management
- **Authentication**: Secure Login/Signup using JWT (Access & Refresh Tokens).
- **Security**: Password hashing with Bcrypt.
- **Profile**: Update avatars, cover images, and channel details.

### 📹 Video & Content
- **CRUD Operations**: Upload, update, and delete videos.
- **File Handling**: Integrated with **Cloudinary** for image and video storage.
- **Multer**: Middleware for handling file uploads.

### 🤝 Social Interaction
- **Comments**: Add, update, and delete comments on videos.
- **Likes/Dislikes**: Toggle likes on videos, comments, and tweets.
- **Subscriptions**: Subscribe/Unsubscribe to channels.
- **Playlists**: Create and manage video playlists.

### 📊 Analytics & Dashboard
- **Aggregation Pipelines**: Complex MongoDB aggregations to calculate views, subscribers, and video stats.
- **Watch History**: Track and clear user watch history.

---

## 💻 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Cloud Storage**: Cloudinary
- **Authentication**: JWT, Bcrypt
- **File Uploads**: Multer

---

## 🛠️ Installation

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone https://github.com/Rakib-Hasan25/VideoTube-Backend.git
cd VideoTube-Backend
```

### 2. Install Dependencies
```bash
npm install
# Optional: Install nodemon globally if you haven't
npm install -g nodemon
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add the following variables:
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Start the Server
```bash
# Production mode
npm start

# Development mode (with Nodemon)
npm run dev
```

---

## 🧪 API Testing

To make testing the API easier, I have included a comprehensive Postman collection.

### 📥 [Download Postman Collection](./videotube.postman_collection.json)

**How to use:**
1. Download the JSON file linked above.
2. Open **Postman**.
3. Click **Import** -> **File** -> Select `videotube.postman_collection.json`.
4. Ensure your server is running on `http://localhost:8000`.
5. Start testing endpoints (Auth, Videos, Comments, etc.).

---

## 🧠 Learning Outcomes

This project focuses on advanced backend patterns, including:
- **MongoDB Aggregation Pipelines**: For complex data joins and filtering.
- **JWT Authentication Flow**: Handling Access and Refresh tokens securely.
- **Standard API Response**: Implementing a custom `ApiResponse` and `ApiError` class for consistent error handling.
- **Middleware**: Writing custom middleware for file handling and auth verification.

---

<div align="center">
  <strong>Connect with me:</strong>
  <br>
  <a href="https://github.com/Rakib-Hasan25">GitHub</a> • 
  <a href="https://www.linkedin.com/in/rakib-hasan-cuet/">LinkedIn</a>
</div>
