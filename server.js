const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const setupSocket = require("./controllers/socketHandler");
const setupClassSocket = require("./controllers/classSocketHandler");
//const setupPdfFunction = require("./controllers/setupPdf");
// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// In-memory store for users and files
let users = {}; // Store connected users by group
let files = {}; // Store uploaded files by group


const sequelize = require("./config/dbConf");
const commentRouter = require("./routes/commentRoute");
const deletePostRoute = require("./routes/deletePostRoute");
const loginRouter = require("./routes/loginRoute");
const likesRoute = require("./routes/likesRoute");
const adminRouter = require("./routes/adminRoute");
const userRouter = require("./routes/userRoute");
const apiRouter = require("./routes/apiRoute");
const profileRouter = require("./routes/userProfileRoute");
const postRouter = require("./routes/userPostRoute");

// Initialize app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const servers = http.createServer(app);
// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("views"));
app.use(express.static("uploads")); // For serving uploaded files
app.use(express.static("audio"));
// Sync database

// Setup additional WebSocket handlers


const setupPdfFunction = (server) => {



    const upload = multer({ dest: 'uploads/' });


    let users = {};
    let files = {};

    const ioo = socketIo(servers);


    ioo.on('connection', (socket) => {
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
            ioo.to(groupName).emit('alert-file', data.filePath);
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

    app.post('/upload', upload.single('file'), (req, res) => {
        const filePath = `/uploads/${req.file.filename}`;
        const groupName = req.body.groupName;

        // Save file info in memory (you could save it to a database here)
        if (!files[groupName]) {
            files[groupName] = [];
        }

        files[groupName].push(filePath);

        // Emit file upload event to group members
        ioo.to(groupName).emit('new-file', { filePath });

        res.json({ filePath });
    });

    // Return the upload route so it can be used in the main app
    return uploadRoute;
};


app.post('/upload', upload.single('file'), (req, res) => {
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


sequelize.authenticate()





.then(() => console.log("Database connected!"))
    .catch(err => console.error("Database connection failed:", err));

async function syncDatabase() {
    await sequelize.sync({force:true}); // Sync all models
    console.log("Database synced successfully.");
}
syncDatabase();

// Add routes
app.use('/delete', deletePostRoute);
app.use('/login', loginRouter);
app.use('/admin', adminRouter);
app.use('/users', userRouter);
app.use('/api', apiRouter);
app.use('/profile', profileRouter);
app.use('/posts', postRouter);
app.use('/comments', commentRouter);
app.use('/likes', likesRoute);

setupSocket(server);
setupClassSocket(server);
//setupPdfFunction(server)
// Keep app awake (e.g., for Render deployment)
setInterval(() => {
    fetch("https://roitech-education-solution.onrender.com")
        .then(() => console.log("Ping successful"))
        .catch(err => console.error("Ping failed:", err));
}, 30000);

// Start the server
const port = process.env.PORT || 10000;
server.listen(port, () => {
    console.log(`Server running on http://127.0.0.1:${port}`);
});



/*


// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');
const uuid = require('uuid');

// Initialize the app and create an HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Set up static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware for JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// In-memory store for users and files
let users = {}; // Store connected users by group
let files = {}; // Store uploaded files by group

// Serve the HTML file (client-side)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
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

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});*/
