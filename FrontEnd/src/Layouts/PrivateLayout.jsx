import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";

const PrivateLayout = () => {
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    setIsClosed(false);
  }, []);

  return (
    <>
      <Sidebar
        isClosed={isClosed}
        setIsClosed={setIsClosed}
        forceOpen
      />

      <main
        className={`app-content ${
          isClosed ? "sidebar-closed" : "sidebar-open"
        }`}
      >
        <Outlet />
      </main>
    </>
  );
};

export default PrivateLayout;
