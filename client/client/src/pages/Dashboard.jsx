import { useState, useEffect } from "react";
import ScriptCard from "../components/ScriptCard";

function Dashboard() {
  const [allScripts, setAllScripts] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [nicheFilter, setNicheFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch scripts on mount
  useEffect(() => {
    const fetchScripts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:5000/api/scripts");
        if (!response.ok) throw new Error("Failed to fetch scripts");
        const data = await response.json();
        // Filter for admin-created scripts
        const adminScripts = data.filter((script) => script.isAdmin);
        // Sort scripts (most recent first)
        const sortedScripts = adminScripts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAllScripts(sortedScripts);
        setScripts(sortedScripts);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScripts();
  }, []);

  // Update filtered scripts when any filter changes
  useEffect(() => {
    let filtered = allScripts;
    if (statusFilter !== "all") {
      filtered = filtered.filter((script) => script.status === statusFilter);
    }
    if (dateFilter) {
      filtered = filtered.filter((script) => {
        const scriptDate = new Date(script.createdAt)
          .toISOString()
          .split("T")[0];
        return scriptDate === dateFilter;
      });
    }
    if (nicheFilter !== "all") {
      filtered = filtered.filter(
        (script) => script.niche.toLowerCase() === nicheFilter.toLowerCase()
      );
    }
    filtered = filtered.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setScripts(filtered);
  }, [statusFilter, dateFilter, nicheFilter, allScripts]);

  const uniqueNiches = [
    "all",
    ...new Set(allScripts.map((script) => script.niche)),
  ];

  return (
    <div className="p-6 h-[90vh]">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-white  border-[2px] rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`btn ${statusFilter === "all" && "active-filter"}`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("used")}
                className={`btn ${statusFilter === "used" && "active-filter"}`}
              >
                Used
              </button>
              <button
                onClick={() => setStatusFilter("unused")}
                className={`btn ${
                  statusFilter === "unused" && "active-filter"
                }`}
              >
                Unused
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input"
            />
            <button onClick={() => setDateFilter("")} className="btn">
              Clear Date Filter
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select
              id="nicheFilter"
              value={nicheFilter}
              onChange={(e) => setNicheFilter(e.target.value)}
              className="select"
            >
              {uniqueNiches.map((niche, index) => (
                <option key={index} value={niche}>
                  {niche === "all"
                    ? "All Niches"
                    : niche.charAt(0).toUpperCase() + niche.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-muted text-small">
            Loading scripts...
          </p>
        ) : error ? (
          <p className="text-center" style={{ color: "red" }}>
            {error}
          </p>
        ) : scripts.length === 0 ? (
          <p className="text-center text-muted text-small">
            No scripts found for the selected filters.
          </p>
        ) : (
          <div className="overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 mt-5 px-5 md:grid-cols-3 gap-6">
              {scripts.map((script) => (
                <ScriptCard key={script._id} script={script} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
