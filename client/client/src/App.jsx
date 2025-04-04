import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
  Link,
} from "react-router-dom";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";
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
import { FaCrown } from "react-icons/fa";
import PromptsPage from "./pages/Prompts";
import PromptDetailPage from "./pages/PromptDetailPage";
import CreatePromptPage from "./pages/CreatePromptPage";
import PostScript from "./admin/pages/PostScript";
import TrendingTopics from "./pages/TrendingTopics";

function NavBar({ user }) {
  const [userData, setUserData] = useState({}); // Initialized as object
  const [menuOpen, setMenuOpen] = useState(false);
  const userId2 = localStorage.getItem("userId");
  const location = useLocation();

  // Compute whether to hide the NavBar on specific routes.
  const hidePaths = ["/login", "/logout"];
  const shouldHide = hidePaths.includes(location.pathname);

  // Fetch user info from the auth endpoint
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  // Optionally refresh user info when session_id is present in URL
  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(
        `http://localhost:5000/api/scripts/user/${userId2}`
      );
      const data = await response.json();
      setUserData(data);
    };
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id"
    );
    if (sessionId) {
      fetchUser();
    }
  }, [userId2]);

  // Early return if the current route should hide the NavBar.
  if (shouldHide) return null;

  const activeClass =
    "text-gray-600 uppercase tracking-widest text-[12px] font-extrabold relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-full after:h-[2px] after:rounded-lg after:bg-black  ";
  const defaultClass =
    "text-gray-600 hover:text-gray-500 text-[12px] uppercase";
  return (
    <nav className="bg-white shadow border border-b p-4">
      <div className="lg:container mx-auto">
        {/*Top Row: Logo and Right Side Items*/}
        <div className="flex items-center justify-between">
          {/*Logo*/}
          <div className="flex items-center">
            {/* <Link to="/">
              <img
                src={Logo}
                alt="Logo"
                className="w-[10rem] h-[40px] sm:w-[16rem] sm:h-[60px] lg:w-[16rem] lg:h-[60px] md:h-[60px] md:w-[15rem]"
              />
            </Link> */}
          </div>
          {/*Right Side: Tokens & User Avatar*/}
          <div className="flex items-center lg:space-x-4 space-x-3">
            {userData && typeof userData.tokens !== "undefined" && (
              <NavLink
                to={userData.tokens < 5 ? "/boost-tokens" : "#"}
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-white text-[14px] shadow border border-gray-200 ${
                  userData.tokens < 5
                    ? "bg-black animate-pulse hover:scale-105 transition-transform"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold  shadow-lg"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 sm:w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M11 0L3 10h5l-1 10 8-12h-5z" />
                </svg>
                <span className="font-bold text-white">{userData.tokens}</span>
              </NavLink>
            )}
            <div className="flex items-center md:space-x-10 space-x-2">
              <div className="flex lg:gap-5 gap-2">
                {userData && (
                  <div className="flex items-center space-x-2">
                    {userData.subscriptionStatus === "active" ? (
                      <div className="flex items-center px-3 py-2 rounded-full bg-black to-pink-500 text-white text-xs font-semibold shadow-lg">
                        <FaCrown className="mr-1 text-yellow-300" />
                        Pro
                      </div>
                    ) : (
                      <NavLink
                        to="/subscription"
                        className="flex items-center px-3 py-2 rounded-full bg-black text-white text-xs font-semibold shadow-lg animate-pulse hover:scale-105 transition-transform"
                      >
                        <FaCrown className="mr-1 text-white" />
                        Upgrade to Pro
                      </NavLink>
                    )}
                  </div>
                )}
              </div>
              <div>
                <UserAvatar />
                <span className="text-black/70 hidden sm:flex text-[14px] font-semibold">
                  {userData.name || "Guest"}
                </span>
              </div>
            </div>
            {/*Hamburger Menu for Mobile*/}
            <div className="lg:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-600 hover:text-gray-500 focus:outline-none"
              >
                <svg
                  className="sm:h-6 h-5 w-6 fill-current"
                  viewBox="0 0 24 24"
                >
                  {menuOpen ? (
                    <path
                      fillRule="evenodd"
                      d="M18.364 5.636a1 1 0 010 1.414L13.414 12l4.95 4.95a1 1 0 01-1.414 1.414L12 13.414l-4.95 4.95a1 1 0 01-1.414-1.414L10.586 12 5.636 7.05a1 1 0 011.414-1.414L12 10.586l4.95-4.95a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      d="M4 5h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2z"
                      clipRule="evenodd"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Desktop Navigation Links Row */}
        <div className="hidden lg:flex justify-center mt-4 space-x-4 font-bold uppercase text-gray-400">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? `${defaultClass} ${activeClass}` : defaultClass
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/trendingtopics"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              isActive ? `${defaultClass} ${activeClass}` : defaultClass
            }
          >
            Trending Topics
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
          <NavLink
            to="/prompts"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              isActive ? `${defaultClass} ${activeClass}` : defaultClass
            }
          >
            Prompts
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
        {/* Mobile Navigation Links */}
        {menuOpen && (
          <div className="lg:hidden mt-4">
            <div className="flex flex-col space-y-2">
              <NavLink
                to="/"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  isActive ? `${defaultClass} ${activeClass}` : defaultClass
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/generate"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  isActive ? `${defaultClass} ${activeClass}` : defaultClass
                }
              >
                Generate Script
              </NavLink>
              <NavLink
                to="/trendingtopics"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  isActive ? `${defaultClass} ${activeClass}` : defaultClass
                }
              >
                Trending Topics
              </NavLink>
              <NavLink
                to="/myscripts"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  isActive ? `${defaultClass} ${activeClass}` : defaultClass
                }
              >
                My Scripts
              </NavLink>
              <NavLink
                to="/subscription"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  isActive ? `${defaultClass} ${activeClass}` : defaultClass
                }
              >
                Subscription
              </NavLink>
              <NavLink
                to="/boost-tokens"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  isActive ? `${defaultClass} ${activeClass}` : defaultClass
                }
              >
                Boost
              </NavLink>
              <NavLink
                to="/prompts"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  isActive ? `${defaultClass} ${activeClass}` : defaultClass
                }
              >
                Prompts
              </NavLink>
              {user && (user.admin === true || user.admin === "true") && (
                <NavLink
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? `${defaultClass} ${activeClass}` : defaultClass
                  }
                >
                  Admin
                </NavLink>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Glow Animation for Pro Badge */}
      <style>
        {`
          @keyframes glow {
            0% { box-shadow: 0 0 5px rgba(236, 72, 153, 0.4); }
            50% { box-shadow: 0 0 20px rgba(236, 72, 153, 0.8); }
            100% { box-shadow: 0 0 5px rgba(236, 72, 153, 0.4); }
          }
          .animate-glow {
            animation: glow 2s infinite ease-in-out;
          }
        `}
      </style>
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
            <Route path="/trendingtopics" element={<TrendingTopics />} />
            <Route path="/generate" element={<CustomScriptForm />} />
            <Route path="/boost-tokens" element={<BoostTokens />} />
            <Route path="/scripts/:id" element={<ScriptDetailPage />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/prompts" element={<PromptsPage />} />
            <Route path="/prompts/:id" element={<PromptDetailPage />} />
            <Route path="/create-prompt" element={<CreatePromptPage />} />
            {user && (user.admin === true || user.admin === "true") && (
              <Route path="/admin/*" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="prompts" element={<AdminPrompts />} />
                <Route path="adminoverview" element={<AdminOverview />} />
                <Route path="users" element={<UserManagementPage />} />
                <Route path="adminscripts" element={<PostScript />} />
              </Route>
            )}
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
