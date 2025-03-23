import { useState, useEffect } from "react";
import ScriptCard from "../components/ScriptCard";

function MyScripts() {
  const [scripts, setScripts] = useState([]);
  const [filteredScripts, setFilteredScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("all");

  // Retrieve the logged-in user's ID from localStorage
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchMyScripts = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/scripts/my-scripts/${userId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch your scripts");
        }
        const data = await response.json();
        // Sort the data so that the most recent scripts come first
        const sortedData = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setScripts(sortedData);
        setFilteredScripts(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchMyScripts();
    } else {
      setError("User ID not found. Please log in.");
      setLoading(false);
    }
  }, [userId]);

  // Update filtered scripts when any filter changes
  useEffect(() => {
    let filtered = scripts;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((script) => script.status === statusFilter);
    }

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter((script) => {
        // Convert script.createdAt to yyyy-mm-dd format for comparison
        const scriptDate = new Date(script.createdAt)
          .toISOString()
          .split("T")[0];
        return scriptDate === selectedDate;
      });
    }

    // Filter by niche
    if (selectedNiche !== "all") {
      filtered = filtered.filter((script) => script.niche === selectedNiche);
    }

    // Sort by createdAt (recent first)
    filtered = [...filtered].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    setFilteredScripts(filtered);
  }, [statusFilter, selectedDate, selectedNiche, scripts]);

  // Compute unique niches from the scripts data for the dropdown
  const uniqueNiches = [
    "all",
    ...new Set(scripts.map((script) => script.niche)),
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    // Prevent any horizontal overflow on mobile
    <div className="bg-[var(--color-bg)] min-h-screen overflow-x-hidden">
      <div className="container mx-auto max-w-full p-4 sm:p-6 lg:p-8 flex flex-col">
        {/* Filters Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-white border border-[var(--color-gray-light)] rounded-lg p-4">
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap gap-2">
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
              className={`btn ${statusFilter === "unused" && "active-filter"}`}
            >
              Unused
            </button>
          </div>

          {/* Date Picker */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input"
            />
            <button onClick={() => setSelectedDate("")} className="btn">
              Clear Date Filter
            </button>
          </div>

          {/* Niche Filter Dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
              className="select"
            >
              {uniqueNiches.map((niche, index) => (
                <option key={index} value={niche}>
                  {niche === "all" ? "All Niches" : niche}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scripts Grid */}
        {filteredScripts.length === 0 ? (
          <p className="text-center text-gray-500">
            No scripts match the selected criteria.
          </p>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-5 px-2 sm:px-5">
              {filteredScripts.map((script) => (
                <ScriptCard key={script._id} script={script} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyScripts;
