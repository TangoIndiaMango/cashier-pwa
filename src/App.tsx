import React from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
// import POSPage from "./help/Post";
import POSSystem from "./pages/LandingPage";
import LoginPage from "./pages/auth/login";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* <Route path="/:id" element={<POSPage />} /> */}
          <Route index element={<POSSystem />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
