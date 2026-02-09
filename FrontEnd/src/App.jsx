import Mode from "./Utility/Mode";
import PrivateLayout from "./Layouts/PrivateLayout";
import PublicLayout from "./Layouts/PublicLayout";
import PublicRoute from "./Utility/PublicRoute";

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
import Footer from "./Components/Footer/Footer";

import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <>
      <Mode />

      <Routes>
        <Route element={<PublicRoute />}>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
          </Route>
        </Route>

        <Route element={<PrivateLayout />}>
          <Route path="/home" element={<HomePrivate />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/account" element={<Account />} />
          <Route path="/projects/:projectId" element={<ProjectLanding />} />
        </Route>
      </Routes>
      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
      />
    </>
  );
};

export default App;