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

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("views"));
app.use(express.static("uploads")); // For serving uploaded files

// Sync database
sequelize.authenticate()
    .then(() => console.log("Database connected!"))
    .catch(err => console.error("Database connection failed:", err));

async function syncDatabase() {
    await sequelize.sync(); // Sync all models
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

// File upload handling
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.post('/upload', upload.single('book'), (req, res) => {
    if (req.file) {
        const filePath = `/uploads/${req.file.filename}`;
        console.log('File uploaded:', filePath);
        io.emit('newBook', filePath); // Notify clients
        res.json({ message: 'Book uploaded successfully!', filePath });
    } else {
        res.status(400).json({ message: 'No file uploaded' });
    }
});

// WebSocket Setup
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Handle WebSocket events
    socket.on("joinGroup", (groupId) => {
        console.log(`User ${socket.id} joined group ${groupId}`);
    });

    socket.on("pageChange", (groupId, pageNumber) => {
        console.log(`Group ${groupId} requested page ${pageNumber}`);
        socket.broadcast.emit("pageChanged", pageNumber);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

// Setup additional WebSocket handlers
setupSocket(server);
setupClassSocket(server);

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
