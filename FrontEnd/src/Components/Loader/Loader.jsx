import React, { useState, useEffect, useRef } from "react";
import "./Loader.css";

const Loader = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const delayRef = useRef(null);

  useEffect(() => {
    let interval;

    if (isLoading) {
      delayRef.current = setTimeout(() => {
        setVisible(true);
        setProgress(20);

        interval = setInterval(() => {
          setProgress((prev) => {
            if (prev < 90) return prev + Math.random() * 6;
            return prev;
          });
        }, 250);
      }, 200);
    } else {
      clearTimeout(delayRef.current);

      if (visible) {
        setProgress(100);

        const timeout = setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 300);

        return () => clearTimeout(timeout);
      }
    }

    return () => clearInterval(interval);
  }, [isLoading, visible]);

  if (!visible) return null;

  return (
    <div className="loader-container">
      <div className="loader-bar" style={{ width: `${progress}%` }} />
      <div className="loader-glow" style={{ left: `${progress}%` }} />
    </div>
  );
};

export default Loader;