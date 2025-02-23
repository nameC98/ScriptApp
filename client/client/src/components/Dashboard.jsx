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
    <div className=" bg-[#EEF5FF] fonts p-6 h-[90vh]">
      <div className="container mx-auto">
        {/* <h1 className="text-3xl md:text-3xl font-bold libre-caslon-display-regular text-center mb-8">
          Script Dashboard
        </h1> */}

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-white border-[1px] border-gray-300 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Status Filter Buttons */}
            <div className="flex space-x-2">
              <div className="gradient-border">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-5 text-[10px] sm:text-[12px] py-1 rounded-full  btn nav   ${
                    statusFilter === "all"
                      ? "btn text-white"
                      : " bg-[#EEF5FF] font-bold text-black"
                  }`}
                >
                  All
                </button>
              </div>
              <div className="gradient-border">
                <button
                  onClick={() => setStatusFilter("used")}
                  className={`px-4 py-2 nav text-[10px] sm:text-[12px] btn  rounded-[250px] ${
                    statusFilter === "used"
                      ? "btn text-white"
                      : " bg-[#EEF5FF] font-bold text-black"
                  }`}
                >
                  Used
                </button>
              </div>
              <div className="gradient-border">
                <button
                  onClick={() => setStatusFilter("unused")}
                  className={`px-4 text-[10px] sm:text-[12px] nav   btn py-2 rounded-[250px]  ${
                    statusFilter === "unused"
                      ? "btn text-white"
                      : " bg-[#EEF5FF] font-bold text-black"
                  }`}
                >
                  Unused
                </button>
              </div>
            </div>
          </div>
          {/* Date Picker */}
          <div className="flex  items-center gap-2">
            <div className="gradient-border">
              {" "}
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 text-[10px] sm:text-[12px] bg-[#EEF5FF] border nav outline-none border-none  btn   rounded-lg shadow-sm"
              />
            </div>
            <div className="gradient-border">
              {" "}
              <button
                onClick={() => setDateFilter("")}
                className="px-4 py-2 nav text-[10px] sm:text-[12px] btn bg-[#EEF5FF] rounded-lg border "
              >
                Clear Date Filter
              </button>
            </div>
          </div>

          {/* Niche Filter Dropdown */}
          <div className="flex items-center gap-2">
            <div className="gradient-border ">
              {" "}
              <select
                id="nicheFilter"
                value={nicheFilter}
                onChange={(e) => setNicheFilter(e.target.value)}
                className="px-4 py-1 rounded-[250px] border nav  text-[13px] bg-[#EEF5FF] md:text-[13px]   sm:text-[12px] focus:outline-none  font-bold focus:ring-0"
              >
                {uniqueNiches.map((niche, index) => (
                  <option key={index} value={niche}>
                    {niche === "all"
                      ? "  All Niches"
                      : niche.charAt(0).toUpperCase() + niche.slice(1)}
                  </option>
                ))}
              </select>
            </div>
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
