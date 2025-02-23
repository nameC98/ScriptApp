import { useState, useEffect } from "react";
import ScriptCard from "./ScriptCard";
import "../App.css";

function Dashboard() {
  const [allScripts, setAllScripts] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [nicheFilter, setNicheFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all scripts and filter to only include admin-created scripts
  useEffect(() => {
    const fetchScripts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:5000/api/scripts");
        if (!response.ok) {
          throw new Error("Failed to fetch scripts");
        }
        const data = await response.json();
        // Filter for admin-created scripts
        const adminScripts = data.filter((script) => script.isAdmin);
        // Sort scripts so that the most recent ones are first
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

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((script) => script.status === statusFilter);
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter((script) => {
        const scriptDate = new Date(script.createdAt)
          .toISOString()
          .split("T")[0];
        return scriptDate === dateFilter;
      });
    }

    // Filter by niche
    if (nicheFilter !== "all") {
      filtered = filtered.filter(
        (script) => script.niche.toLowerCase() === nicheFilter.toLowerCase()
      );
    }

    // Always ensure the filtered list is sorted (most recent first)
    filtered = filtered.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    setScripts(filtered);
  }, [statusFilter, dateFilter, nicheFilter, allScripts]);

  // Compute unique niches from the fetched scripts
  const uniqueNiches = [
    "all",
    ...new Set(allScripts.map((script) => script.niche)),
  ];

  return (
    <div className=" bg-gray-100 fonts p-6 h-[90vh]">
      <div className="container mx-auto">
        {/* <h1 className="text-3xl md:text-3xl font-bold libre-caslon-display-regular text-center mb-8">
          Script Dashboard
        </h1> */}

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-white shadow-lg rounded-lg p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Status Filter Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2   nav  text-[13px] rounded-[250px] ${
                  statusFilter === "all"
                    ? "bg-gray-700 text-white"
                    : " bg-gray-400 font-bold text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("used")}
                className={`px-4 py-2 nav  text-[13px] rounded-[250px] ${
                  statusFilter === "used"
                    ? "bg-gray-700 text-white"
                    : " bg-gray-400 font-bold text-white"
                }`}
              >
                Used
              </button>
              <button
                onClick={() => setStatusFilter("unused")}
                className={`px-4 nav  text-[13px] py-2 rounded-[250px]  ${
                  statusFilter === "unused"
                    ? "bg-gray-700 text-white"
                    : " bg-gray-400 font-bold text-white"
                }`}
              >
                Unused
              </button>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border nav  text-[13px] rounded-lg shadow-sm"
              />
              <button
                onClick={() => setDateFilter("")}
                className="px-4 py-2 nav  text-[13px] rounded-lg border border-gray-300"
              >
                Clear Date Filter
              </button>
            </div>
          </div>

          {/* Niche Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="nicheFilter"
              className=" nav  text-[13px] font-medium"
            >
              Filter by Niche:
            </label>
            <select
              id="nicheFilter"
              value={nicheFilter}
              onChange={(e) => setNicheFilter(e.target.value)}
              className="px-4 py-1 rounded-[250px] border nav  text-[13px] border-gray-300 focus:outline-none focus:ring-2 font-bold focus:ring-blue-400"
            >
              {uniqueNiches.map((niche, index) => (
                <option key={index} value={niche}>
                  {niche === "all"
                    ? "All"
                    : niche.charAt(0).toUpperCase() + niche.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center nav  text-black/70 text-[13px]">
            Loading scripts...
          </p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : scripts.length === 0 ? (
          <p className="text-center nav text-black/70  text-[13px]">
            No scripts found for the selected filters.
          </p>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 mt-[20px] px-5 md:grid-cols-3 gap-6">
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
