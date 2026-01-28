import React, { useEffect, useState } from "react";

const Mode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("mode") === "dark";
  });

  useEffect(() => {
    const mode = isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("dark-mode", mode);
    localStorage.setItem("mode", mode);
  }, [isDarkMode]);

  const toggleMode = () => setIsDarkMode(!isDarkMode);

  
  return (
  <div className='mode-toggle-container'>
    <label className="switch">
      <input 
        type="checkbox" 
        onChange={toggleMode} 
        checked={isDarkMode} 
      />
      <span className="slider round"></span>
    </label>
    <span style={{ fontSize: '12px' }}>
       {isDarkMode ? '🌙' : '☀️'}
    </span>
  </div>
)};

export default Mode;