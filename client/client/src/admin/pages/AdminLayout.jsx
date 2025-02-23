// src/admin/AdminLayout.js
import { NavLink, Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Updated Admin Navigation */}
      <nav className="bg-white shadow">
        <div className="container mx-auto flex space-x-8 py-4">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 border-b-2 border-blue-600 pb-2"
                : "text-gray-600 hover:text-blue-600 pb-2"
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 border-b-2 border-blue-600 pb-2"
                : "text-gray-600 hover:text-blue-600 pb-2"
            }
          >
            Users
          </NavLink>
          <NavLink
            to="/admin/prompts"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 border-b-2 border-blue-600 pb-2"
                : "text-gray-600 hover:text-blue-600 pb-2"
            }
          >
            Prompts
          </NavLink>
          <NavLink
            to="/admin/adminoverview"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 border-b-2 border-blue-600 pb-2"
                : "text-gray-600 hover:text-blue-600 pb-2"
            }
          >
            OverView
          </NavLink>

          {/* Add additional admin links here */}
        </div>
      </nav>
      {/* Render the child admin page */}
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
