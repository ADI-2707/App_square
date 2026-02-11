import React, { useState, useEffect } from "react";
import "./Loader.css";

const Loader = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let interval;
    if (isLoading) {
      setShow(true);
      setProgress(15);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 90) return prev + Math.random() * 5;
          return prev;
        });
      }, 300);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => {
        setShow(false);
        setProgress(0);
      }, 400);
      return () => clearTimeout(timeout);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!show) return null;

  return (
    <div className="yt-loader-container">
      <div className="yt-loader-bar" style={{ width: `${progress}%` }} />
      <div className="yt-loader-glow" style={{ left: `${progress}%` }} />
    </div>
  );
};

export default Loader;