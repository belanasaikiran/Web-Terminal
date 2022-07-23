// Importing Express Router
const express = require("express");
const app = express();

// Importing cors
const cors = require("cors");
app.use(cors());

// socket.io setup
const server = require("http").createServer(app);

const io = require("socket.io")(server, {
  transports: ["polling"],
  cors: {
    origin: "*",
  },
});

// socket connection
io.on("connection", (client) => {
  // console.log("socket ID:" + client.id);

  client.on("join", (data) => {
    console.log(data);
  });

  client.on("disconnect", () => {
    client.emit("message", "Bye from server");
  });
});

module.exports = { io };

// use cors to allow cross origin resource sharing
app.use(function (req, res, next) {
  req.io = io;
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Routes for the API

const Terminal = require("./Terminal");

// use Terminal.js to handle the terminal requests
app.use("/terminal", Terminal);

app.get("/", (req, res) => {
  res.send("Just a Server Route");
});

// using PORT from env file or 5000 for local development
const PORT = process.env.PORT || 5000;
// System Information
const os = require("os");
const dotEnv = require("dotenv");
dotEnv.config();

// ----- connect to server -----

server.listen(PORT, () => {
  console.log(`🚀 http://${os.hostname()}:${PORT}`);
});





