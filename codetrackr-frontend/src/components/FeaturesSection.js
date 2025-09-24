import React from "react";

const features = [
  {
    icon: "💻",
    title: "Track Problems",
    desc: "Log and monitor your coding challenges, solutions, and time spent on each problem."
  },
  {
    icon: "📁",
    title: "Track Projects",
    desc: "Organize and track the progress of your coding projects, from ideation to completion."
  },
  {
    icon: "📊",
    title: "Progress Reports",
    desc: "Visualize your coding activity and progress with detailed reports and analytics."
  },
  {
    icon: "👤",
    title: "Profile Dashboard",
    desc: "Customize your profile, showcase your skills, and share your coding journey."
  }
];

function FeaturesSection() {
  return (
    <section className="features-section">
      <h2>Powerful Features to Boost Your Growth</h2>
      <p>
        CodeTrackr offers a comprehensive suite of tools to help you manage and track your coding activities effectively.
      </p>
      <div className="features-cards">
        {features.map((f) => (
          <div key={f.title} className="feature-card">
            <span className="feature-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturesSection;