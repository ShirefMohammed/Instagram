const express = require("express");
const dotenv = require("dotenv");
const { Server } = require('socket.io');
const http = require("node:http");
const connectDB = require("./config/connectDB");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("node:path");
const corsOptions = require("./config/corsOptions");
const allowedOrigins = require("./config/allowedOrigins");
const authRouter = require("./routes/authRouter");
const usersRouter = require("./routes/usersRouter");
const reportsRouter = require("./routes/reportsRouter");
const postsRouter = require("./routes/postsRouter");
const chatRouter = require("./routes/chatsRouter");
const handleCors = require("./middleware/handleCors");
const handleErrors = require("./middleware/errorHandler");
const socketController = require("./controllers/socketController");

// Use environment variables
dotenv.config();

// Create server
const app = express();
const server = http.createServer(app);
const _PORT = process.env.PORT || 3000;

// Connect to mongo database
connectDB();

// Cross Origin Resource Sharing
app.use(handleCors, cors(corsOptions));

// Built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// Built-in middleware for json
app.use(express.json());

// Middleware for cookies
app.use(cookieParser());

// Serve static files
app.use("/", express.static(path.join(__dirname, "..", "public")));
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.get("/", (req, res) => res.sendFile(
  path.join(__dirname, "views", "index.html")
));
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/posts", postsRouter);
app.use("/api/chats", chatRouter);

// Handle not found routes
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// Ping the server every 14 minutes for render platform
// setInterval(() => {
//   fetch(process.env.SERVER_URL)
//     .then(res => {
//       if (res.ok) {
//         console.log('Server ping successful');
//       } else {
//         console.error('Server ping failed:', res.status);
//       }
//     })
//     .catch(error => {
//       console.error('Error pinging server:', error);
//     });
// }, 840000);

// Handle error middleware
app.use(handleErrors);

// Socket.IO
const io = new Server(
  server,
  {
    pingTimeout: 60000,
    cors: { origin: allowedOrigins }
  }
);

io.on('connection', (socket) => socketController(io, socket));

server.listen(_PORT, () => {
  console.log(`Server running on ${process.env.SERVER_URL} for port ${_PORT}`);
});