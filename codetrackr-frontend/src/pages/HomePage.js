import React from "react";
import '../styles/homepage.css';
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";

function HomePage() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
}

export default HomePage;