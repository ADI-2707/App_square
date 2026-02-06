import { createContext, useContext, useEffect, useState } from "react";
import api, { injectLoader } from "./api";
import Loader from "../Components/Loader";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(
    !!localStorage.getItem("accessToken")
  );
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const [globalLoading, setGlobalLoading] = useState(false);
  const [hasProjectAccess, setHasProjectAccess] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  useEffect(() => {
    injectLoader(setGlobalLoading);
  }, []);

  useEffect(() => {
    if (authenticated) {
      refreshProjectAccess();
    } else {
      setHasProjectAccess(false);
    }
  }, [authenticated]);

  const refreshProjectAccess = async () => {
    try {
      setLoadingProjects(true);
      const res = await api.get("/api/projects/my-projects/");
      setHasProjectAccess(Array.isArray(res.data) && res.data.length > 0);
    } catch {
      setHasProjectAccess(false);
    } finally {
      setLoadingProjects(false);
    }
  };

  const login = (userData, accessToken, refreshToken) => {
    setAuthenticated(true);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await api.post("/api/auth/logout/", { refresh: refreshToken });
      }
    } finally {
      localStorage.clear();
      setAuthenticated(false);
      setUser(null);
      setHasProjectAccess(false);
      window.location.replace("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        user,
        login,
        logout,
        hasProjectAccess,
        loadingProjects,
        refreshProjectAccess,
        createProjectOpen,
        openCreateProject: () => setCreateProjectOpen(true),
        closeCreateProject: () => setCreateProjectOpen(false),
      }}
    >
      {children}
      <Loader isLoading={globalLoading} />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);