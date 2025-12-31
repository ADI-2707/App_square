import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Mode from "./Utility/Mode.jsx";
import Home from "./Pages/Home.jsx";
import Navbar from "./Components/Navbar.jsx";
import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import About from "./Pages/About.jsx";
import Contact from "./Pages/Contact.jsx";
import Sidebar from "./Components/Sidebar.jsx"
import ForgetPassword from "./Pages/ForgetPassword.jsx";


const App = () => {
  return (
    <Router>
      <Sidebar />
      <Navbar />
      <Mode />
      <main className="app-content">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path='/forget-password' element={<ForgetPassword />} />
      </Routes>
      </main>
    </Router>
  );
};

export default App;
