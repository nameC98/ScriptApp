import { useState, useEffect } from "react";
import ScriptCard from "./ScriptCard";
import "../App.css";

function Dashboard() {
  const [allScripts, setAllScripts] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all scripts on mount and filter for admin scripts only
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
        // Filter to only include admin-created scripts
        const adminScripts = data.filter((script) => script.isAdmin);
        setAllScripts(adminScripts);
        setScripts(adminScripts);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScripts();
  }, []);

  // Apply client-side filtering based on the niche
  useEffect(() => {
    if (filter === "all") {
      setScripts(allScripts);
    } else {
      const filtered = allScripts.filter(
        (script) => script.niche.toLowerCase() === filter.toLowerCase()
      );
      setScripts(filtered);
    }
  }, [filter, allScripts]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl md:text-3xl font-bold libre-caslon-display-regular text-center mb-8">
          Script Dashboard
        </h1>
        <div className="flex flex-col sm:flex-row items-center justify-center mb-8 space-y-4 sm:space-y-0 sm:space-x-4">
          <label className="text-lg font-medium" htmlFor="nicheFilter">
            Filter by Niche:
          </label>
          <select
            id="nicheFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 nav font-bold focus:ring-blue-400"
          >
            <option value="all" className="font-bold">
              All
            </option>
            <option className="font-bold" value="tech">
              Tech
            </option>
            <option className="font-bold" value="gaming">
              Gaming
            </option>
            <option className="font-bold" value="travel">
              Travel
            </option>
            <option className="font-bold" value="finance">
              Finance
            </option>
            <option className="font-bold" value="lifestyle">
              Lifestyle
            </option>
          </select>
        </div>

        {isLoading ? (
          <p className="text-center font-serif">Loading scripts...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : scripts.length === 0 ? (
          <p className="text-center font-serif">
            No scripts found for this niche.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {scripts.map((script) => (
              <ScriptCard key={script._id} script={script} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
