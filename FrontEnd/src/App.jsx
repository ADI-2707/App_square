import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Mode from "./Utility/Mode";
import PrivateRoute from "./Utility/PrivateRoute";
import PublicRoute from "./Utility/PublicRoute";
import { useAuth } from "./Utility/AuthContext";

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
import Account from "./Pages/Account";
import ProjectLanding from "./Pages/ProjectLanding";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const { authenticated } = useAuth();
  const [isSidebarClosed, setIsSidebarClosed] = useState(true);
  const hasSidebar = authenticated;

  const contentClass = hasSidebar
    ? isSidebarClosed
      ? "sidebar-closed"
      : "sidebar-open"
    : "no-sidebar";

  return (
    <>
      <Router>
        <Mode />

        {hasSidebar && (
          <Sidebar
            isClosed={isSidebarClosed}
            setIsClosed={setIsSidebarClosed}
          />
        )}

        <Navbar hasSidebar={hasSidebar} />

        <main className={`app-content ${contentClass}`}>
          <Routes>

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

            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <HomePrivate />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/account"
              element={
                <PrivateRoute>
                  <Account />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects/:projectId"
              element={
                <PrivateRoute>
                  <ProjectLanding />
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