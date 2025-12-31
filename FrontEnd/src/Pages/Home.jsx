import React from "react";
import HeroSection from "../Components/HeroSection";

const Home = () => {
  return (
    <div>
      <h1 className="text-center text-3xl md:text-6xl font-bold mt-6">
        Welcome to the Home Page
      </h1>
      <div className="px-4 mt-20">
        <HeroSection />
      </div>
    </div>
  );
};

export default Home;