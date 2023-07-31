//Topbar.js
import React from "react";
import "../css/main.css";
import "../css/Sidebar.css";
export default function Sidebar() {
  return (
    <div className="SidbarContainer">
      <div className="Sidbar-Top">
        <div>NewChat</div>
      </div>
      <div className="Sidbar-ContentContainer">
        <button className="Sidbar-Content" type="other">
          Fuck Yusuf
        </button>
      </div>
      <div className="Sidbar-Account">
        <button>Login</button>
        <button>Log Out</button>
      </div>
    </div>
  );
}
