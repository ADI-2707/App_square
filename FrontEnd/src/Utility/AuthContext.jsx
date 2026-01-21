import { createContext, useContext, useEffect, useState } from "react";
import { isAuthenticated, getUser } from "./auth";
import api, { injectLoader } from "./api";
import Loader from "../Components/Loader";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [user, setUser] = useState(getUser());
  const [globalLoading, setGlobalLoading] = useState(false);

  const [hasProjectAccess, setHasProjectAccess] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    injectLoader(setGlobalLoading);

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
      setHasProjectAccess(
        Array.isArray(res.data?.results) && res.data.results.length > 0,
      );
    } catch (err) {
      console.error("Project access check failed", err);
      setHasProjectAccess(false);
    } finally {
      setLoadingProjects(false);
    }
  };

  const login = (userData) => {
    setAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setAuthenticated(false);
    setUser(null);
    setHasProjectAccess(false);
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
      }}
    >
      {children}
      <Loader isLoading={globalLoading} />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
