import React, { useEffect, useRef, useState } from "react";
import Client from "../components/Clients";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import { useNavigate, Navigate, useLocation, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

const ACTIONS = require('../Actions');

function EditorPage() {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const languageRef = useRef('JavaScript');
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();

  const [clients, setClients] = useState([]);
  useEffect(() => {
    async function init() {
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', err => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
        console.log('socket error', e);
        toast.error(`socket connection failed, try again later :/`);
        reactNavigator('/');
      }
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        userName: location.state?.userName,
      });

      socketRef.current.on(ACTIONS.JOINED, ({ clients, userName, socketId }) => {
        if (userName !== location.state?.userName) {
          toast.success(`${userName} joined the room`);
        }
        setClients(clients);
        socketRef.current.emit(ACTIONS.SYNC_CODE, { code: codeRef.current,  socketId });
        socketRef.current.emit(ACTIONS.SYNC_LANGUAGE, {
          language: languageRef.current,
          socketId,
        });
      });
      
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, userName }) => {
        toast.success(`${userName} left the room`);
        setClients((prev) => {
          return prev.filter(client => client.socketId !== socketId);
        });
      });

    }
    init();
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    }
  }, []);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success(`RoomId has been copied to your clipboard`);
    } catch (error) {
      toast.error(`Could not copy roomId`);
      console.log(error);
    }
  }

  function leaveRoom() {
    reactNavigator("/");
  }

  if (!location.state) {
    <Navigate to="/" />;
  }
  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="editorPageLogo">
            <img width="40" height="40" src="/icon.png" alt="logo" />
            <h1>InLoop</h1>
          </div>
          <div className="clientList">
                      {clients.map((client) => (
                          <Client key={client.socketId} userName={client.userName} />
                      ))}
          </div>
              </div>
              <button className="btn copyBtn" onClick={copyRoomId}>Copy Room Id</button>
              <button className="btn leaveBtn" onClick={leaveRoom}>Leave Room</button>
      </div>
      <div className="editorWrap"><Editor socketRef={socketRef} roomId={roomId} onCodeChange={code => { codeRef.current = code }} onLanguageChange={lang=>{languageRef.current=lang}} languageRef={languageRef} /></div>
    </div>
  );
}

export default EditorPage;
