// setupPdfFunction.js
const express = require('express');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// In-memory store for users and files
let users = {}; // Store connected users by group
let files = {}; // Store uploaded files by group

// Function to set up the PDF handling, file uploads, and WebSocket communication
const setupPdfFunction = (server) => {
  const io = socketIo(server);

  // WebSocket connection for real-time communication
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    let groupName = null;

    // Join a group when user joins
    socket.on('join-group', (group) => {
      groupName = group;
      if (!users[groupName]) {
        users[groupName] = [];
      }
      users[groupName].push(socket.id);
      socket.join(groupName);
      console.log(`${socket.id} joined group: ${groupName}`);
    });

    // Handle file clicked event (open the file)
    socket.on('file-clicked', (data) => {
      console.log(`File clicked: ${data.filePath}`);
      io.to(groupName).emit('alert-file', data.filePath);
    });

    // Handle drawing events
    socket.on('drawing', (data) => {
      socket.to(groupName).emit('drawing', data);
    });

    // Handle WebRTC signaling events (voice chat)
    socket.on('webrtc-offer', (data) => {
      socket.to(data.peerId).emit('webrtc-offer', data);
    });

    socket.on('webrtc-answer', (data) => {
      socket.to(data.peerId).emit('webrtc-answer', data);
    });

    socket.on('new-peer', (peerId) => {
      socket.to(peerId).emit('new-peer', socket.id);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (groupName) {
        const index = users[groupName].indexOf(socket.id);
        if (index !== -1) {
          users[groupName].splice(index, 1);
        }
        console.log(`${socket.id} disconnected from group: ${groupName}`);
      }
    });
  });

  // Set up the upload route
  const uploadRoute = express.Router();

  uploadRoute.post('/upload', upload.single('file'), (req, res) => {
    const filePath = `/uploads/${req.file.filename}`;
    const groupName = req.body.groupName;

    // Save file info in memory (you could save it to a database here)
    if (!files[groupName]) {
      files[groupName] = [];
    }

    files[groupName].push(filePath);

    // Emit file upload event to group members
    io.to(groupName).emit('new-file', { filePath });

    res.json({ filePath });
  });

  // Return the upload route so it can be used in the main app
  return uploadRoute;
};

module.exports = setupPdfFunction;
