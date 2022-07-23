import React from "react";

import { io } from "socket.io-client";

import { Terminal } from "xterm";
// xterm css
import "xterm/css/xterm.css";

import { FitAddon } from "xterm-addon-fit";

let term;

export default function TerminalComponent() {
  const socket = io.connect("ws://localhost:5000");

  term = new Terminal({
    cursorBlink: true,
    cursorStyle: "block",
    cursorWidth: 2,
    rows: 35,
    cols: 100,
    integration: "react-dom",
    scrollBack: 1000,
    fontSize: 16,
    fontFamily: "monospace",
  });

  // useRef to store the terminal in a variable
  const terminalRef = React.useRef();
  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  fitAddon.fit();

  // type data
  React.useEffect(() => {
    term.open(terminalRef.current);
    term.focus();
    socket.on("connect", function () {
      // resize the terminal to fit the container
      // Browser -> Backend
      term.onData(function (data) {
        socket.emit("data", data);
        // store the log in temporary variable
      });

      // Backend -> Browser
      socket.on("data", function (data) {
        term.write(data);
      });

      // On Disconnect
      socket.on("disconnect", function () {
        term.write("\x1b[31m");
        term.write("\r\n*** Disconnected from backend***\r\n");
        term.write("\x1b[0m");
      });
    });
  }, [socket]);

  return (
    <div>
      <div ref={terminalRef} />
    </div>
  );
}
