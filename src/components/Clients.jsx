import React from "react";
import Avatar from "react-avatar";

function Client({userName}) {
    return (
      <div className="client">
        <Avatar name={userName} size={30} round="10px" />
        <span className="userName">&nbsp;&nbsp;{userName}</span>
      </div>
    );
}

export default Client;