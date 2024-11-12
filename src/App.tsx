import React from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import POSPage from "./pages/Post";
import POSSystem from "./pages/LandingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/:id" element={<POSPage />} />
        <Route path="/cashier" element={<POSSystem />} />
      </Route>
    </Routes>
  );
}

export default App;
