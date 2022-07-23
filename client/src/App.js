import React, { useEffect, useRef } from "react";
import "./App.css";
import { io } from "socket.io-client";
import { Terminal } from "xterm";
import "xterm/css/xterm.css"; // xterm css
import { FitAddon } from "xterm-addon-fit";


let term;

function App() {
  const socket = io.connect("ws://localhost:5000");

  term = new Terminal({
    cursorBlink: true,
    cursorStyle: "block",
    cursorWidth: 2,
    rows: 49,
    cols: 98,
    integration: "react-dom",
    scrollBack: 1000,
    fontSize: 16,
    fontFamily: "monospace",
  });

  // useRef to store the terminal in a variable
  const terminalRef = useRef();
  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  fitAddon.fit();

  // type data
  useEffect(() => {
    term.open(terminalRef.current);
    term.focus();
    socket.on("connect", function () {
      // resize the terminal to fit the container
      // Browser -> Backend
      term.onData(function (data) {
        socket.emit("data", data);
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
    <div className="">
    <h1 className="text-slate-50 bg-slate-800 font-bold p-1"> SSH Terminal </h1>
      <div ref={terminalRef} className="p-2 bg-black" />
    </div>
  );
}

export default App;
