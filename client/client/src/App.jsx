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

function NavBar({ user }) {
  const location = useLocation();
  // Hide the nav bar on these routes
  const hidePaths = ["/login", "/logout"];
  if (hidePaths.includes(location.pathname)) return null;
  console.log(user);

  const activeClass = "text-gray-600 tracking-widest font-extrabold";
  const defaultClass = "text-black/70 hover:text-gray-500 text-[14px]";

  return (
    <nav className="bg-white shadow border border-b-1 p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center">
          <img src={Logo} alt="Logo" className="w-[13rem] h-[50px]" />
        </div>

        {/* Center: Navigation Links */}
        <div className="flex space-x-4 font-sans font-bold text-gray-400">
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
          {/* Conditional Admin Link */}
          {user && (user.admin === true || user.admin === "true") && (
            <NavLink to="/admin">Admin</NavLink>
          )}
        </div>

        {/* Right: Tokens and Avatar */}
        <div className="flex items-center space-x-8">
          {user && (
            <div className="flex items-center space-x-2 bg-yellow-600 text-white text-[14px] px-3 py-1 rounded-full shadow border border-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11z" />
                <path d="M10 7a3 3 0 100 6 3 3 0 000-6z" />
              </svg>
              <span className="font-bold text-white">{user.tokens}</span>
            </div>
          )}
          <div className="flex items-center">
            <UserAvatar />
            <span className="text-black/70 px-3 py-1 text-[14px] font-semibold">
              {user ? user.name : "Guest"}
            </span>
          </div>
        </div>
      </div>
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
