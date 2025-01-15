// Importing Express Router
const express = require("express");
const app = express();
const fs = require("fs");

// Importing cors
const cors = require("cors");
app.use(cors());

// Middleware to parse JSON body
app.use(express.json());

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

// end point for config.json
app.get("/config", (req, res) => {
  var config = fs.readFileSync("./modifiedConfig.json", "utf8");
  console.log("config:", config);
  res.json(config);
});

// post endpoint for config.json
app.post("/config", (req, res) => {
  console.log("Request Hit!\n");

  // read json data from the request
  console.log("Request Body: ", req.body);


  const config = req.body;
  
  // update the config.json file
  fs.writeFileSync("modifiedConfig.json", JSON.stringify(config, null, 2));
  res.json({success: true, message: "Config Updated Successfully"});
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





