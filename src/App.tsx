import { Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
// import POSPage from "./help/Post";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/auth/login";
import FailedTransaction from "./pages/FailedTransaction";
import POSSystem from "./pages/LandingPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* <Route path="/:id" element={<POSPage />} /> */}
          <Route index element={<POSSystem />} />
          {/* <Route path="/failed-sync" element={<FailedTransaction />} /> */}
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/failed" element={<FailedTransaction />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
