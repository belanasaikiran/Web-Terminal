import React, { useEffect, useRef } from "react";
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

  // Connection Status
  const [connected, setConnected] = React.useState(true);
  const [connectionStyle, setConnectionStyle] = React.useState(true);

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
        setConnected(true);
        setConnectionStyle(true);
      });

      // On Disconnect
      socket.on("disconnect", function () {
        term.write("\x1b[31m");
        term.write("\r\n*** Disconnected from backend***\r\n");
        term.write("\x1b[0m");
        setConnected(false);
        setConnectionStyle(false);
      });
    });
  }, [socket]);
  return (
    <div>
      <div className="text-slate-800 bg-slate-50 p-1 flex justify-between    ">
        <h1 className="font-bold "> SSH Terminal </h1>
        <h1 className=" ">
          Status:
          <span
            style={connectionStyle ? { color: "green" } : { color: "red" }}
            className="pl-2"
          >
            {connected ? "Connected ✅" : "Disconnected ❌"}
          </span>
        </h1>
      </div>

      <div ref={terminalRef} className="p-2 bg-black" />
      {/* You can delete the below line if you want to use it to your projects */}
      <footer className="fixed z-50 text-center left-0 w-screen bottom-0 ">
        By Saikiran Belana
      </footer>
    </div>
  );
}

export default App;
