import React from "react";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="logo-icon">🔷</span> CodeTrackr
      </div>
      <div className="navbar-links">
        <a href="/login" className="navbar-link">Login</a>
        <a href="/signup" className="navbar-signup">Sign Up</a>
      </div>
    </nav>
  );
}

export default Navbar;