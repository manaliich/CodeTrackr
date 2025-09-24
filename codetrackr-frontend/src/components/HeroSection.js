import React from "react";
import codingImage from "../assets/coding-image.png";

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-text">
        <h1>
          Track your coding journey, progress,<br />
          and projects in one place.
        </h1>
        <p>
          CodeTrackr helps you monitor your coding practice, project development, and overall progress, all in a unified dashboard.
        </p>
        <a href="/dashboard" className="hero-btn">Get Started</a>
      </div>
      <div className="hero-image">
        <img src={codingImage} alt="Coding dashboard" />
      </div>
    </section>
  );
}

export default HeroSection;