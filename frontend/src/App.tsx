import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import LeopaCalendar from "./components/LeopaCalendar";
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* LP（トップページ） */}
        <Route path="/" element={<LandingPage />} />

        {/* カレンダー本体 */}
        <Route path="/app" element={<LeopaCalendar />} />
        <Route path="/terms" element={<Terms />} />
<Route path="/privacy" element={<Privacy />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;