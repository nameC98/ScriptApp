import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./components/Dashboard";
import CustomScriptForm from "./components/CustomScriptForm";
import Subscription from "./components/Subscription";
import ScriptDetailPage from "./components/ScriptDetailPage";
import UserAvatar from "./components/UserAvatar";
import MyScripts from "./MyScripts";

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="bg-[#3E54A3] p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex space-x-4 font-sans font-semibold">
              <Link
                to="/"
                className="text-white font-semibold hover:text-gray-300"
              >
                Dashboard
              </Link>
              <Link
                to="/generate"
                className="text-white font-semibold hover:text-gray-300"
              >
                Generate Script
              </Link>
              <Link
                to="/myscripts"
                className="text-white font-semibold hover:text-gray-300"
              >
                My Scripts
              </Link>
              <Link
                to="/subscription"
                className="text-white font-semibold hover:text-gray-300"
              >
                Subscription
              </Link>
            </div>
            <div className="flex space-x-4">
              {/* Instead of Login/Signup links, we render the avatar */}
              <UserAvatar />
            </div>
          </div>
        </nav>

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/myscripts" element={<MyScripts />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/generate" element={<CustomScriptForm />} />
            <Route path="/scripts/:id" element={<ScriptDetailPage />} />
            <Route path="/subscription" element={<Subscription />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
