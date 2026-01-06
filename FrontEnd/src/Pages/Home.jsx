import React from "react";
import HeroSection from "../Components/HeroSection";

const Home = () => {

  return (
    <div>
        <h1 className="text-center text-3xl md:text-6xl font-bold mt-25 hero-header">
          Welcome to the Web App
        </h1>

          <p className="text-center mt-6 md:text-sm px-4 hero-subheader">
            Streamline your industrial operations with real-time recipe
            management, advanced trend analytics, and comprehensive audit
            compliance in one unified ecosystem.
          </p>

        <div className="mt-10 mb-20">
          <HeroSection />
      </div>
    </div>
  );
};

export default Home;