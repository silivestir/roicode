// socketHandler.js
const { Server } = require("socket.io");
const express = require('express');
const path = require('path');
const ioAuthMiddleware = require("./auth");
const token = require("../routes/loginRoute")
const fs = require('fs');
const http = require('http');
const multer = require("multer");
// In-memory store for users and files
let users = {}; // Store connected users by group
let files = {}; // Store uploaded files by group


const socketIo = require('socket.io');
const upload = multer({ dest: 'uploads/' });
const AUDIO_DIR = "./audio"
const chatHistory = [];
const setupClassSocket = (server) => {

    const io = new Server(server);


    const app = express()
    if (!fs.existsSync(AUDIO_DIR)) {
        fs.mkdirSync(AUDIO_DIR);
    }
    app.use(express.static("audio"))

    io.on('connection', (socket) => {
        console.log(`User connected`)
        socket.on('join', (payload) => {
            const roomId = payload.room
            const roomClients = io.sockets.adapter.rooms[roomId] || { length: 0 }
            const numberOfClients = roomClients.length
            console.log(`Room ID: ${roomId}`)
            console.log(`roomClients: ${roomClients}`)
            console.log(`numberOfClients of ${roomId}: ${numberOfClients}`)


            // These events are emitted only to the sender socket.
            if (numberOfClients == 0) {
                console.log(`Creating room ${roomId} and emitting room_created socket event`)
                socket.join(roomId)
                socket.emit('room_created', {
                    roomId: roomId,
                    peerId: socket.id
                })
            } else {
                console.log(`Joining room ${roomId} and emitting room_joined socket event`)
                socket.join(roomId)
                socket.emit('room_joined', {
                    roomId: roomId,
                    peerId: socket.id
                })
            }
        })

        // These events are emitted to all the sockets connected to the same room except the sender.
        socket.on('start_call', (event) => {
            console.log(`Broadcasting start_call event to peers in room ${event.roomId} from peer ${event.senderId}`)
            socket.broadcast.to(event.roomId).emit('start_call', {
                senderId: event.senderId
            })
        })

        //Events emitted to only one peer
        socket.on('webrtc_offer', (event) => {
            console.log(`Sending webrtc_offer event to peers in room ${event.roomId} from peer ${event.senderId} to peer ${event.receiverId}`)
            socket.broadcast.to(event.receiverId).emit('webrtc_offer', {
                sdp: event.sdp,
                senderId: event.senderId
            })
        })

        socket.on('webrtc_answer', (event) => {
            console.log(`Sending webrtc_answer event to peers in room ${event.roomId} from peer ${event.senderId} to peer ${event.receiverId}`)
            socket.broadcast.to(event.receiverId).emit('webrtc_answer', {
                sdp: event.sdp,
                senderId: event.senderId
            })
        })

        socket.on('webrtc_ice_candidate', (event) => {
            console.log(`Sending webrtc_ice_candidate event to peers in room ${event.roomId} from peer ${event.senderId} to peer ${event.receiverId}`)
            socket.broadcast.to(event.receiverId).emit('webrtc_ice_candidate', event)
        })





        socket.on('join class', ({ className, userName }) => {
            socket.join(className);
            console.log(`${userName} joined class ${className}`);
            io.to(className).emit('class joined', { className, userName });
        });

        socket.on('document-update', (msg) => {
            socket.to(msg.className).emit('document-update', msg); // Broadcast to others in the same room
        });

        socket.on('cursor-update', (data) => {
            socket.to(data.className).emit('cursor-update', data); // Relay cursor position to others in the group
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
        });




        socket.on('audio-data', (data) => {
            const audioFilePath = path.join(`./audio/audio-${Date.now()}.webm`);
            fs.writeFile(audioFilePath, data, 'base64', (err) => {
                if (err) {
                    console.error('Error saving audio file:', err);
                } else {
                    console.log('Audio file saved:', audioFilePath);
                    // You may want to notify clients here
                }
            });
        });

        // Optionally handle requests to play audio by sending the list of filenames
        socket.on('request-audio-list', () => {
            fs.readdir(AUDIO_DIR, (err, files) => {
                if (err) {
                    console.error('Error reading audio directory:', err);
                    return;
                }

                const audioFiles = files.map(file => `${file}`

                ); // Prepare paths for the client
                socket.emit('audio-list', audioFiles);
            });
        });

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


        app.post('/upload', upload.single('file'), (req, res) => {
            const filePath = `/uploads/${req.file.filename}`;
            const groupName = req.body.groupName;

            // Save file info in memory (you could save it to a database here)
            if (!files[groupName]) {
                files[groupName] = [];
            }

            files[groupName].push(filePath);
            //  io.to(groupName).emit('new-file', { filePath });
            // Emit file upload event to group members
            console.log("dgggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg")

            res.json({ filePath });
        });





    })
    app.post('/upload', upload.single('file'), (req, res) => {
        const filePath = `/uploads/${req.file.filename}`;
        const groupName = req.body.groupName;

        // Save file info in memory (you could save it to a database here)
        if (!files[groupName]) {
            files[groupName] = [];
        }

        files[groupName].push(filePath);

        // Emit file upload event to group members
        console.log("dgggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg")

        res.json({ filePath });
    });

    app.get('/audio/:filename', (req, res) => {
        const filePath = `${req.params.filename}`;
        res.sendFile(filePath);
    });




    return io;
};







module.exports = setupClassSocket;
