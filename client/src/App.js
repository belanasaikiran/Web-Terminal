import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Terminal } from "xterm";
import "xterm/css/xterm.css"; // xterm css
import { FitAddon } from "xterm-addon-fit";
import Modal from "react-modal";

let term;

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },

  //  background color to black
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  }

};

Modal.setAppElement(document.getElementById('root'));

function App() {


  const [modalIsOpen, setIsOpen] = React.useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setShowTerminal(true);
  }


  var defaultConfig = {
    host: "",
    port: "",
    username: "",
    password: "",
  };


  const [config, setConfig] = useState(defaultConfig);
  
   const [showSettings, setShowSettings] = useState(false);
    const [showTerminal, setShowTerminal] = useState(true);
    const [saveText, setSaveText] = useState("Save");

   const fetchConfig = async () => {
     const response =  await fetch("http://localhost:5000/config");
      const data =  await response.json();
      console.log("Response: ", data);

      // update the state
      const jsonData = JSON.parse(data);
      setConfig(jsonData);

      console.log("Config: ", jsonData);
   }

   useEffect(() => {
    if (showSettings) {
        fetchConfig();
    }
}, [showSettings]);

   const handleSave = async () => {

    // update the config
    console.log("Config: ", JSON.stringify(config));

    console.log("Sending Config to Server");

    const response = await fetch('http://localhost:5000/config', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
      
    });

   

    setShowTerminal(true);
    closeModal();

    const result = await response.json();
    // if result.success is true, reload the terminal
    if (result.success) {
      window.location.reload();
    } else{
      setSaveText("Save");
    }
    alert(result.message);


   }


    useEffect(() => {
  }, [setConfig]);




  // Terminal Stuff
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
    <div className="p-2 b  m-0">
      <div>
        <div className="text-slate-800 bg-slate-50 p-1 flex justify-between  relative  ">
          <h1 className="font-bold "> SSH Terminal </h1>
          <h1 className=" " >
          <button onClick={()=> {
            openModal();
            setShowSettings(!showSettings);
            setShowTerminal(false);
            
          }} className="hover:bg-slate-800 hover:text-white mx-2 px-2 py-1 transition-all duration-300">Settings</button>
          <span>
            Status:
            <span
              style={connectionStyle ? { color: "green" } : { color: "red" }}
              className="pl-2"
            >
              {connected ? "Connected ✅" : "Disconnected ❌"}
            </span>
            </span>
          </h1>
       
        </div>
        <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Configuration"
      >
           {/* Display Config options */}
           <div className={`  bg-slate-50 p-2 w-96 shadow-lg border-2 shadow-slate-800`} >
            <div className="flex justify-between items-center">
            <h1 className="font-bold text-slate-800">Configuration:</h1>
            <button onClick={
              ()=> {
                closeModal();
                setShowSettings(!showSettings);
                setShowTerminal(true);
                }
                } className=" bg-slate-800  px-2 text-white rounded-sm"> X </button>
                </div>
                <div className="flex flex-col ">
                <div className="flex justify-between items-center">
                <label>HostName/IP :</label>
                <input
                className="border border-slate-200 rounded-md px-3 py-1 my-2"
                autoFocus={true}
                  type="text"
                  placeholder="Enter Hostname/IP"
                  value={config.host}
                  // when the value changes, update the state but maintain the cursor in the input field
                  onChange={(e) => setConfig({ ...config, host: e.target.value })}
                />
                </div>
                <div className="flex justify-between items-center">
                <label>Port:</label>
                <input
                className="border border-slate-200 rounded-md px-3 py-1 my-2"
                  type="text"
                  placeholder="Enter Port"
                  value={config.port}
                  onChange={(e) => setConfig({ ...config, port: e.target.value })}
                />
                </div>
                <div className="flex justify-between items-center">
                <label>Username:</label>
                <input
                className="border border-slate-200 rounded-md px-3 py-1 my-2"
                  type="text"
                  placeholder="Enter Username"
                  value={config.username}
                  onChange={(e) => setConfig({ ...config, username: e.target.value })}
                />
                </div>
                <div className="flex justify-between items-center">
                <label>Password:</label>
                <input
                className="border border-slate-200 rounded-md px-3 py-1 my-2"
                  type="password"
                  placeholder="Enter Password"
                  value={config.password}
                  onChange={(e) => setConfig({ ...config, password: e.target.value })}
                />
                </div>
                <button onClick={()=> {setSaveText("Saving..."); handleSave()}}  className="bg-slate-800 text-white rounded-sm py-2 my-2"> {saveText} </button>
                </div>
                 </div>
                 </Modal>

                <div ref={terminalRef} className={`bg-black h-screen ${showTerminal ? 'block' : 'hidden'}`}></div>
                <footer className="fixed z-50 text-center bg-slate-50 left-0 w-screen bottom-0 p-1 ">
                <span>By </span>
                <span className="text-sky-900 font-bold hover:text-yellow-600">
                <a
                href="https://github.com/belanasaikiran"
                target="_blank"
                rel="noreferrer"
                >
                Saikiran Belana
                </a>
                {/* Same line as name */}
        </span>
      </footer>
    </div>
    </div>

  );
}

export default App;
