const express = require("express");
// For future use of Terminal Data from the database
const app = express();
const fs = require("fs");

const { io } = require("./server");
const dotEnv = require("dotenv");
dotEnv.config();

// The Below is the Configuration for the Terminal
var sshConfig = {
  host: process.env.SSH_HOST,
  username: process.env.SSH_USERNAME,
  password: process.env.SSH_PASSWORD,
  port: process.env.SSH_PORT,
};

var SSHClient = require("ssh2").Client;

// load config.json
const getConfig = () => {
  if(fs.existsSync('modifiedConfig.json')) {
    return JSON.parse(fs.readFileSync('./modifiedConfig.json', 'utf8'));
  }
}


// The below code is for the terminal
//Socket Connection
io.on("connection", function (socket) {
  // Creating  a new SSH Client
  // var ssh = new SSHClient();


  // if config.json exists, use that configuration
  if (getConfig()) {
    sshConfig = getConfig();
    console.log("Set sshConfig from JSON file");
  }

  // Creating a new SSH Client
    var ssh = new SSHClient();


  console.log(sshConfig);

  // Connecting to the SSH Server
  ssh
    .on("ready", function () {
      // socket.emit("data", "\r\n*** SSH CONNECTION ESTABLISHED ***\r\n");
      connected = true;
      // Executing the command with the SSH Client
      ssh.shell(function (err, stream) {
        if (err)
          return socket.emit(
            "data",
            "\r\n*** SSH SHELL ERROR: " + err.message + " ***\r\n"
          );
        // Writing the data to the terminal
        socket.on("data", function (data) {
          stream.write(data);
        });
        // Reading the data from the terminal
        stream
          .on("data", function (d) {
            // emitting the decoded data to the client
            socket.emit("data", d.toString("utf-8"));
          })
          .on("close", function () {
            ssh.end();
          });
      });
    })

    // Handling the error if any
    .on("close", function () {
      socket.emit("data", "\r\n*** SSH CONNECTION CLOSED ***\r\n");
    })
    .on("error", function (err) {
      console.log(err);
      //  Sending the error to the client
      socket.emit(
        "data",
        "\r\n*** SSH CONNECTION ERROR: " + err.message + " ***\r\n"
      );
    })
    .connect(sshConfig);
});

module.exports = app;

// TEST CASE:

//  function testSSH() {
//   var conn = new SSHClient();
//   conn.on("ready", function() {
//     console.log("Client :: ready");
//     conn.exec("ls", function(err, stream) {
//       if (err) throw err;
//       stream.on("close", function(code, signal) {
//         console.log("Stream :: close code: " + code);
//         conn.end();
//       }).on("data", function(data) {
//         console.log("STDOUT: " + data);
//       }).stderr.on("data", function(data) {
//         console.log("STDERR: " + data);
//       });
//     });
//   }).connect(sshConfig);
// }

// test case example:
// testSSH();
