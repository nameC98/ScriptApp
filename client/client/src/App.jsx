import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./components/Dashboard";
import CustomScriptForm from "./pages/CustomScriptForm";
import Subscription from "./pages/Subscription";
import ScriptDetailPage from "./components/ScriptDetailPage";
import UserAvatar from "./components/UserAvatar";
import MyScripts from "./pages/MyScripts";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCancel from "./pages/SubscriptionCancel";
import BoostTokens from "./pages/Boosttokens";

import Logo from "./assets/logo.png";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminLayout from "./admin/pages/AdminLayout";
import AdminPrompts from "./admin/pages/AdminPrompts";
import AdminOverview from "./admin/pages/AdminOverview";
import UserManagementPage from "./admin/pages/UserManagementPage";
import { FaCircle, FaCrown } from "react-icons/fa";

function NavBar({ user }) {
  const [userData, setUserData] = useState([]);
  const userId2 = localStorage.getItem("userId");

  console.log(userData);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(
        `http://localhost:5000/api/scripts/user/${userId2}`
      );
      const data = await response.json();
      setUserData(data); // Ensure subscriptionStatus is part of data
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(
        `http://localhost:5000/api/scripts/user/${userId2}`
      );
      const data = await response.json();
      setUserData(data); // Ensure subscriptionStatus is part of data
    };
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id"
    );
    if (sessionId) {
      fetchUser(); // Refresh user info after successful subscription
    }
  }, []);

  const location = useLocation();
  // Hide the nav bar on these routes
  const hidePaths = ["/login", "/logout"];
  if (hidePaths.includes(location.pathname)) return null;
  console.log(user);

  const activeClass = `
  text-gray-600 uppercase tracking-widest text-[12px] font-extrabold relative 
  after:content-[''] after:absolute after:left-0 after:bottom-[-2px] 
  after:w-full after:h-[2px] after:rounded-lg 
  after:bg-gradient-to-r after:from-purple-500 after:to-pink-500
`;

  const defaultClass =
    "text-gray-600 hover:text-gray-500 text-[12px] uppercase";

  return (
    <nav className="bg-white shadow border border-b-1 p-4">
      <div className="container mx-auto flex items-center justify-between ">
        {/* Left: Logo */}
        <div className="flex items-center">
          <img src={Logo} alt="Logo" className="w-[13rem] h-[50px]" />
        </div>

        {/* Center: Navigation Links */}
        <div className="flex space-x-4 font-sans font-bold uppercase text-gray-400 ">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? `${defaultClass} ${activeClass}` : defaultClass
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/generate"
            className={({ isActive }) =>
              isActive ? `${defaultClass} ${activeClass}` : defaultClass
            }
          >
            Generate Script
          </NavLink>
          <NavLink
            to="/myscripts"
            className={({ isActive }) =>
              isActive ? `${defaultClass} ${activeClass}` : defaultClass
            }
          >
            My Scripts
          </NavLink>
          <NavLink
            to="/subscription"
            className={({ isActive }) =>
              isActive ? `${defaultClass} ${activeClass}` : defaultClass
            }
          >
            Subscription
          </NavLink>
          <NavLink
            to="/boost-tokens"
            className={({ isActive }) =>
              isActive ? `${defaultClass} ${activeClass}` : defaultClass
            }
          >
            Boost
          </NavLink>
          {user && (user.admin === true || user.admin === "true") && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive ? `${defaultClass} ${activeClass}` : defaultClass
              }
            >
              Admin
            </NavLink>
          )}
        </div>

        {/* Right: Tokens, Pro/Upgrade Badge, and Avatar */}
        <div className="flex items-center space-x-8">
          {user && (
            <NavLink
              to={userData.tokens < 5 ? "/boost-tokens" : "#"}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-white text-[14px] shadow border border-gray-200 ${
                userData.tokens < 5
                  ? "bg-gradient-to-r from-yellow-400 to-red-500 animate-pulse hover:scale-105 transition-transform"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold shadow-lg"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M11 0L3 10h5l-1 10 8-12h-5z" />
              </svg>
              <span className="font-bold text-white">{user.tokens}</span>
            </NavLink>
          )}

          <div className="flex items-center space-x-3">
            <UserAvatar />
            <div className="flex gap-5">
              <span className="text-black/70 text-[14px] font-semibold">
                {user ? user.name : "Guest"}
              </span>
              {userData && (
                <div className="flex items-center space-x-2">
                  {userData.subscriptionStatus === "active" ? (
                    <div className="flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold shadow-lg ">
                      <FaCrown className="mr-1 text-yellow-300" />
                      Pro
                    </div>
                  ) : (
                    <NavLink
                      to="/subscription"
                      className="flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-red-500 text-white text-xs font-semibold shadow-lg animate-pulse hover:scale-105 transition-transform"
                    >
                      <FaCrown className="mr-1 text-white" />
                      Upgrade to Pro
                    </NavLink>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Glow Animation for Pro Badge */}
      <style>{`
        @keyframes glow {
          0% {
            box-shadow: 0 0 5px rgba(236, 72, 153, 0.4);
          }
          50% {
            box-shadow: 0 0 20px rgba(236, 72, 153, 0.8);
          }
          100% {
            box-shadow: 0 0 5px rgba(236, 72, 153, 0.4);
          }
        }
        .animate-glow {
          animation: glow 2s infinite ease-in-out;
        }
      `}</style>
    </nav>
  );
}

NavBar.propTypes = {
  user: PropTypes.object,
};

function App() {
  const [user, setUser] = useState(null);
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
      <NavBar user={user} />
      <div className="app-container">
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
            {/* Admin Routes (visible only if user is admin) */}
            {user && (user.admin === true || user.admin === "true") && (
              <Route path="/admin/*" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="prompts" element={<AdminPrompts />} />
                <Route path="adminoverview" element={<AdminOverview />} />
                <Route path="users" element={<UserManagementPage />} />
                {/* Add additional nested admin routes here */}
              </Route>
            )}
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
