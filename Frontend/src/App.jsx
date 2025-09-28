import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import Issues from "./pages/Issues";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const location = useLocation();
  const isHome = location.pathname === "/"; // check if current page is home

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 text-gray-800">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <main
        className={
          isHome
            ? "flex-1 flex" // full height and width for home
            : "flex-1 container mx-auto px-4 py-6 overflow-auto" // scrollable container for other pages
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
