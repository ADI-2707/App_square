import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Utility/AuthContext";
import Sidebar from "@/Components/Sidebar/Sidebar";
import Navbar from "@/Components/Navbar/Navbar";
import { useEffect, useState } from "react";
import ProjectPasswordModal from "@/Components/ProjectPasswordModal";
import api from "@/Utility/api";

const PrivateLayout = () => {
  const { authenticated } = useAuth();
  const [isClosed, setIsClosed] = useState(true);

  const [passwordProjectId, setPasswordProjectId] = useState(null);
  const [retryRequest, setRetryRequest] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      setPasswordProjectId(e.detail.projectId);
      setRetryRequest(e.detail.retryRequest || null);
    };

    window.addEventListener("PROJECT_PASSWORD_REQUIRED", handler);
    return () =>
      window.removeEventListener("PROJECT_PASSWORD_REQUIRED", handler);
  }, []);

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar hasSidebar={true} />
      <Sidebar isClosed={isClosed} setIsClosed={setIsClosed} />

      <main
        className={`app-content ${
          isClosed ? "sidebar-closed" : "sidebar-open"
        }`}
      >
        <Outlet />
      </main>

      {passwordProjectId && (
        <ProjectPasswordModal
          isOpen={true}
          projectId={passwordProjectId}
          onVerified={async (password) => {
            await api.post(
              `/api/projects/${passwordProjectId}/verify-password/`,
              { password }
            );

            if (retryRequest) {
              await api(retryRequest);
            }

            setPasswordProjectId(null);
            setRetryRequest(null);
          }}
          onClose={() => {
            setPasswordProjectId(null);
            setRetryRequest(null);
          }}
        />
      )}
    </>
  );
};

export default PrivateLayout;