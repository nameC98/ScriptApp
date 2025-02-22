import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./components/Dashboard";
import CustomScriptForm from "./components/CustomScriptForm";
import Subscription from "./components/Subscription";
import ScriptDetailPage from "./components/ScriptDetailPage";
import UserAvatar from "./components/UserAvatar";
import MyScripts from "./MyScripts";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCancel from "./pages/SubscriptionCancel";
import BoostTokens from "./pages/Boosttokens";

function App() {
  const [user, setUser] = useState(null);
  // The JWT is stored after login; make sure your login process saves it as "authToken"
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetch("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch user profile");
          }
          return res.json();
        })
        .then((data) => {
          setUser(data);
        })
        .catch((err) => console.error("Error fetching user profile", err));
    }
  }, [token]);

  return (
    <Router>
      <div className="app-container">
        <nav className="bg-[#3E54A3] p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex space-x-4 font-sans font-semibold">
              <Link to="/" className="text-white hover:text-gray-300">
                Dashboard
              </Link>
              <Link to="/generate" className="text-white hover:text-gray-300">
                Generate Script
              </Link>
              <Link to="/myscripts" className="text-white hover:text-gray-300">
                My Scripts
              </Link>
              <Link
                to="/subscription"
                className="text-white hover:text-gray-300"
              >
                Subscription
              </Link>
              <Link
                to="/boost-tokens"
                className="text-white hover:text-gray-300"
              >
                Boost
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2 bg-white text-blue-500 px-3 py-1 rounded-full shadow">
                  {/* Coin Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11z" />
                    <path d="M10 7a3 3 0 100 6 3 3 0 000-6z" />
                  </svg>
                  <span className="font-semibold">{user.tokens}</span>
                </div>
              )}
              <div className="flex flex-col ">
                <UserAvatar />
                <span className="text-white font-semibold">
                  {user ? user.name : "Guest"}
                </span>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/myscripts" element={<MyScripts />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/subscription-success"
            element={<SubscriptionSuccess />}
          />
          <Route path="/subscription-cancel" element={<SubscriptionCancel />} />
          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/generate" element={<CustomScriptForm />} />
            <Route path="/boost-tokens" element={<BoostTokens />} />
            <Route path="/scripts/:id" element={<ScriptDetailPage />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
