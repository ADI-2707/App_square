import { useEffect, useState } from "react";
import { getInitialTheme, applyTheme } from "./theme";

const Mode = () => {
  const [mode, setMode] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  return (
    <div className="mode-toggle-container">
      <label className="switch">
        <input
          type="checkbox"
          checked={mode === "dark"}
          onChange={() =>
            setMode((prev) => (prev === "dark" ? "light" : "dark"))
          }
        />
        <span className="slider round"></span>
      </label>
      <span style={{ fontSize: "12px" }}>
        {mode === "dark" ? "🌙" : "☀️"}
      </span>
    </div>
  );
};

export default Mode;