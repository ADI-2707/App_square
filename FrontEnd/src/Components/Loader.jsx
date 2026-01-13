import React, { useState, useEffect } from "react";

const Loader = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let interval;
    if (isLoading) {
      setShow(true);
      setProgress(15); // Instant jump to show it started
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 90) return prev + Math.random() * 5;
          return prev;
        });
      }, 300);
    } else {
      // Complete the bar
      setProgress(100);
      const timeout = setTimeout(() => {
        setShow(false);
        setProgress(0);
      }, 400); // Small delay to let user see it hit the end
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