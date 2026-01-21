import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Utility/AuthContext";
import Sidebar from "../Components/Sidebar";
import { useState } from "react";

const PrivateLayout = () => {
  const { authenticated } = useAuth();
  const [isClosed, setIsClosed] = useState(true);

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Sidebar isClosed={isClosed} setIsClosed={setIsClosed} />
      <main className={`app-content ${isClosed ? "sidebar-closed" : "sidebar-open"}`}>
        <Outlet />
      </main>
    </>
  );
};

export default PrivateLayout;