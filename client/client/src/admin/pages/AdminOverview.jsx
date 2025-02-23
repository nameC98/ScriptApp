import { useEffect, useState } from "react";

function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/overview")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch overview stats");
        }
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading overview stats...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-lg font-semibold">Total Users</h3>
          <p className="text-2xl">{stats.totalUsers}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-lg font-semibold">Active Users</h3>
          <p className="text-2xl">{stats.activeUsers}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-lg font-semibold">Total Scripts Generated</h3>
          <p className="text-2xl">{stats.totalScripts}</p>
        </div>
      </div>
      <div className="bg-white shadow rounded p-4">
        <h3 className="text-lg font-semibold mb-2">Recent Signups</h3>
        <ul>
          {stats.recentSignups.map((user) => (
            <li key={user._id} className="border-b py-1">
              <span className="font-semibold">{user.name || "Guest"}</span> -{" "}
              {user.email}{" "}
              <span className="text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminOverview;
