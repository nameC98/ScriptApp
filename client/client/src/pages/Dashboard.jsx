import { useState, useEffect } from "react";
import ScriptCard from "../components/ScriptCard";

function Dashboard() {
  const [allScripts, setAllScripts] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all"); // default "All"
  const [ratingFilter, setRatingFilter] = useState("all"); // new rating filter state
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
        const adminScripts = data.filter((script) => script.isAdmin);
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

  // Helper: compute lower bound date based on time filter
  const getLowerBoundDate = (filter) => {
    if (filter === "all") return null;
    const now = new Date();
    switch (filter) {
      case "latest":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000); // last 24 hours
      case "thisWeek": {
        const firstDay = new Date(now);
        firstDay.setDate(now.getDate() - now.getDay());
        firstDay.setHours(0, 0, 0, 0);
        return firstDay;
      }
      case "thisMonth":
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case "past2Months":
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      case "thisYear":
        return new Date(now.getFullYear(), 0, 1);
      default:
        return null;
    }
  };

  // Update filtered scripts when filters change
  useEffect(() => {
    let filtered = allScripts;
    if (statusFilter !== "all") {
      filtered = filtered.filter((script) => script.status === statusFilter);
    }
    if (ratingFilter !== "all") {
      const selectedRating = parseFloat(ratingFilter);
      filtered = filtered.filter(
        (script) => (script.rating || 5) === selectedRating
      );
    }
    const lowerBound = getLowerBoundDate(timeFilter);
    if (lowerBound) {
      filtered = filtered.filter(
        (script) => new Date(script.createdAt) >= lowerBound
      );
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
  }, [statusFilter, timeFilter, ratingFilter, nicheFilter, allScripts]);

  const uniqueNiches = [
    "all",
    ...new Set(allScripts.map((script) => script.niche)),
  ];

  const ratingOptions = [
    "all",
    "1",
    "1.5",
    "2",
    "2.5",
    "3",
    "3.5",
    "4",
    "4.5",
    "5",
  ];

  return (
    <div className="p-6 h-[90vh]">
      <div className="container">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-white border-2 rounded-xl p-4">
          {/* Left: Status Filter */}
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
          {/* Center: Time Filter and Rating Filter */}
          <div className="flex items-center gap-2">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="btn"
            >
              <option value="all">All Time</option>
              <option value="latest">Latest (last 24h)</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="past2Months">Past 2 Months</option>
              <option value="thisYear">This Year</option>
            </select>
            <select
              id="ratingFilter"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="btn"
            >
              {ratingOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option === "all" ? "All Ratings" : `${option} Stars`}
                </option>
              ))}
            </select>
          </div>
          {/* Right: Niche Filter */}
          <div className="flex items-center gap-2">
            <select
              id="nicheFilter"
              value={nicheFilter}
              onChange={(e) => setNicheFilter(e.target.value)}
              className="btn"
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
          <p className="text-center text-muted text-sm">Loading scripts...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : scripts.length === 0 ? (
          <p className="text-center text-muted text-sm">
            No scripts found for the selected filters.
          </p>
        ) : (
          <div className="overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 mt-5 px-5 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
