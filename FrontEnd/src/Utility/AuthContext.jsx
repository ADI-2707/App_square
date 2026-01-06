import { createContext, useContext, useState, useEffect } from "react";
import { isAuthenticated, getUser } from "./auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [user, setUser] = useState(getUser());

  const login = (userData) => {
    setAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    setAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ authenticated, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);