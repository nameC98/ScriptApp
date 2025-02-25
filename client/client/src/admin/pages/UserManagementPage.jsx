// src/admin/UserManagementPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]); // Initialized as an array
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    subscriptionStatus: "active",
    tokens: 100,
  });

  // Fetch users when the component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/admin/users");
      console.log("Fetched users:", response.data); // Debug log
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.error("Fetched data is not an array:", response.data);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset tokens for a specific user (sets tokens to a default value)
  const handleResetTokens = async (userId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/reset-tokens`
      );
      fetchUsers();
    } catch (error) {
      console.error("Error resetting tokens:", error);
    }
  };

  // Edit tokens for a user
  const handleEditTokens = async (userId, currentTokens) => {
    const newTokens = window.prompt("Enter new token count:", currentTokens);
    if (newTokens !== null) {
      try {
        await axios.patch(
          `http://localhost:5000/api/admin/users/${userId}/tokens`,
          { tokens: Number(newTokens) }
        );
        fetchUsers();
      } catch (error) {
        console.error("Error updating tokens:", error);
      }
    }
  };

  // Toggle plan status for a user and update activation/deactivation dates
  const handlePlanToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/plan`,
        { status: newStatus }
      );
      fetchUsers();
    } catch (error) {
      console.error("Error updating user plan:", error);
    }
  };

  // Delete a user
  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Handle add user form submit
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      // POST endpoint to add a user
      const response = await axios.post(
        "http://localhost:5000/api/admin/users",
        newUser
      );
      console.log("Added user:", response.data);
      setNewUser({
        name: "",
        email: "",
        password: "",
        subscriptionStatus: "active",
        tokens: 100,
      });
      setShowAddForm(false);
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  // Filter users based on search query
  const filteredUsers = Array.isArray(users)
    ? users.filter(
        (user) =>
          (user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.email || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {/* Top Controls: Search and Add User */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded w-full sm:max-w-xs"
        />
        <button
          className="bg-indigo-500 text-white py-2 px-4 rounded"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Cancel" : "Add User"}
        </button>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddUser}
          className="mb-4 p-4 border rounded bg-gray-50"
        >
          <div className="mb-2">
            <label className="block mb-1 text-sm font-medium">Name:</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="p-2 border rounded w-full"
              required
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1 text-sm font-medium">Email:</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className="p-2 border rounded w-full"
              required
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1 text-sm font-medium">Password:</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              className="p-2 border rounded w-full"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white py-2 px-4 rounded"
          >
            Add User
          </button>
        </form>
      )}

      {/* Users Table */}
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border text-sm">Name</th>
                <th className="py-2 px-4 border text-sm">Email</th>
                <th className="py-2 px-4 border text-sm">Subscription</th>
                <th className="py-2 px-4 border text-sm">Token Balance</th>
                <th className="py-2 px-4 border text-sm">Created At</th>
                <th className="py-2 px-4 border text-sm">Plan Activated</th>
                <th className="py-2 px-4 border text-sm">Plan Deactivated</th>
                <th className="py-2 px-4 border text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border text-sm">
                      {user.name || "N/A"}
                    </td>
                    <td className="py-2 px-4 border text-sm">
                      {user.email || "N/A"}
                    </td>
                    <td className="py-2 px-4 border text-sm">
                      {user.subscriptionStatus || "N/A"}
                    </td>
                    <td className="py-2 px-4 border text-sm">{user.tokens}</td>
                    <td className="py-2 px-4 border text-sm">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="py-2 px-4 border text-sm">
                      {user.planActivatedAt
                        ? new Date(user.planActivatedAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="py-2 px-4 border text-sm">
                      {user.planDeactivatedAt
                        ? new Date(user.planDeactivatedAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="py-2 px-4 border text-sm space-y-2 sm:space-x-2">
                      <button
                        className="bg-blue-500 text-white py-1 px-2 rounded text-xs sm:text-sm"
                        onClick={() => handleResetTokens(user._id)}
                      >
                        Reset Tokens
                      </button>
                      <button
                        className="bg-purple-500 text-white py-1 px-2 rounded text-xs sm:text-sm"
                        onClick={() => handleEditTokens(user._id, user.tokens)}
                      >
                        Edit Tokens
                      </button>
                      <button
                        className="bg-yellow-500 text-white py-1 px-2 rounded text-xs sm:text-sm"
                        onClick={() =>
                          handlePlanToggle(user._id, user.subscriptionStatus)
                        }
                      >
                        {user.subscriptionStatus === "active"
                          ? "Deactivate Plan"
                          : "Activate Plan"}
                      </button>
                      <button
                        className="bg-red-500 text-white py-1 px-2 rounded text-xs sm:text-sm"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-sm">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
