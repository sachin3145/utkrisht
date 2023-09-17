import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Home() {

  const navigate = useNavigate();

  const [roomId, setRoomId] = useState("");
  const [userName, setUserNmae] = useState("");

  const createNewRoom = (event) => {
    event.preventDefault();
    const id = uuidv4();
    setRoomId(id);
    toast.success("Created New Room")
  }

  const joinRoom = (event) => {
    if (!roomId || !userName) {
      toast.error("ROOM ID and USERNAME are required");
      return;
    }

    navigate(`/editor/${roomId}`, {
      state: {
        userName
      }
    })

  }

  const handleInputEnterKey = (event) => {
    if (event.code === 'Enter') {
      joinRoom();
    }
  }

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <div className="homePageLogo">
          <img width="50" height="50" src="icon.png" alt="logo" />
          <h1>InLoop</h1>
        </div>
        <h4 className="mainLabel">Paste Invitation ROOM ID</h4>
        <div className="inputGroup">
          <input
            className="inputBox"
            placeholder="ROOM ID"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
            onKeyUp={handleInputEnterKey}
          />
          <input
            className="inputBox"
            placeholder="USERNAME"
            onChange={(e) => setUserNmae(e.target.value)}
            value={userName}
            onKeyUp={handleInputEnterKey}
          />
          <button className="btn joinBtn" onClick={joinRoom}>
            Join
          </button>
          <span className="createInfo">
            If you don't have an invite then create &nbsp;
            <a onClick={createNewRoom} href="/" className="createNewBtn">
              new room
            </a>
          </span>
        </div>
      </div>
      <footer>
        <h4>
          Built With 💛 by &nbsp;
          <a href="https://github.com/sachin3145">Sachin Yadav</a>
        </h4>
      </footer>
    </div>
  );
}

export default Home;
