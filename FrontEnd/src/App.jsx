import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Mode from "./Utility/Mode";
import PrivateRoute from "./Utility/PrivateRoute";
import { isAuthenticated } from "./Utility/auth";
import { useAuth } from "./Utility/AuthContext";
import PublicRoute from "./Utility/PublicRoute";

import Navbar from "./Components/Navbar";
import Sidebar from "./Components/Sidebar";

import Home from "./Pages/Home";
import HomePrivate from "./Pages/HomePrivate";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Dashboard from "./Pages/Dashboard";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import ForgetPassword from "./Pages/ForgetPassword";
import Account from "./Pages/Account.jsx";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [isSidebarClosed, setIsSidebarClosed] = useState(true);

  const loggedIn = isAuthenticated();
  const { authenticated } = useAuth();

  return (
    <>
      <Router>
        <Mode />

        {/* Sidebar ONLY when logged in */}
        {authenticated && (
          <Sidebar
            isClosed={isSidebarClosed}
            setIsClosed={setIsSidebarClosed}
          />
        )}

        <Navbar isSidebarClosed={isSidebarClosed} />

        <main
          className={`app-content ${
            loggedIn
              ? isSidebarClosed
                ? "sidebar-closed"
                : "sidebar-open"
              : "no-sidebar"
          }`}
        >
          <Routes>
            {/* Public */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Home />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/forget-password" element={<ForgetPassword />} />

            {/* Auth landing */}
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <HomePrivate />
                </PrivateRoute>
              }
            />

            {/* Project dashboard */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* Account page */}
            <Route
              path="/account"
              element={
                <PrivateRoute>
                  <Account />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </>
  );
};

export default App;
