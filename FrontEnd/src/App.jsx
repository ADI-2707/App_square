import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Mode from "./Utility/Mode.jsx";
import PrivateRoute from "./Utility/PrivateRoute.jsx";

import Navbar from "./Components/Navbar.jsx";
import Sidebar from "./Components/Sidebar.jsx"

import Home from "./Pages/Home.jsx"
import HomePrivate from "./Pages/HomePrivate.jsx";
import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import About from "./Pages/About.jsx";
import Contact from "./Pages/Contact.jsx";
import ForgetPassword from "./Pages/ForgetPassword.jsx";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const App = () => {
  const [isSidebarClosed, setIsSidebarClosed] = useState(true);

  return (
    <>
    <Router>
      <Sidebar isClosed={isSidebarClosed} setIsClosed={setIsSidebarClosed} />
      <Navbar isSidebarClosed={isSidebarClosed} />
      <Mode />
      <main className={`app-content ${isSidebarClosed ? "sidebar-closed" : "sidebar-open"}`}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path='/forget-password' element={<ForgetPassword />} />

        {/* Protected routes */}
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
      </Routes>
      </main>
    </Router>
     <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
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
