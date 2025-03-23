import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import PromptCard from "../components/PromptCard";
function PromptsPage() {
  const [prompts, setPrompts] = useState([]);
  const [filteredPrompts, setFilteredPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // "all" => admin prompts; "my" => user-created prompts; "favorites" => bookmarked prompts
  const [filterType, setFilterType] = useState(
    () => localStorage.getItem("filterType") || "all"
  );
  const [selectedNiche, setSelectedNiche] = useState(
    () => localStorage.getItem("selectedNiche") || "all"
  );

  // Retrieve logged-in user's ID from localStorage
  const userId = localStorage.getItem("userId");

  // Save filter settings to localStorage whenever they change.
  useEffect(() => {
    localStorage.setItem("filterType", filterType);
  }, [filterType]);

  useEffect(() => {
    localStorage.setItem("selectedNiche", selectedNiche);
  }, [selectedNiche]);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/scripts/prompts"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch prompts");
        }
        const data = await response.json();
        // Sort so the most recent prompts come first (using createdAt or updatedAt as fallback)
        const sortedData = data.sort(
          (a, b) =>
            new Date(b.createdAt || b.updatedAt) -
            new Date(a.createdAt || a.updatedAt)
        );
        setPrompts(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  // Callback defined inside the component—has access to setPrompts.
  const handleBookmarkToggle = (updatedPrompt) => {
    setPrompts((prevPrompts) =>
      prevPrompts.map((prompt) =>
        prompt._id === updatedPrompt._id ? updatedPrompt : prompt
      )
    );
  };

  // Update filtered prompts when filters or prompts change
  useEffect(() => {
    let filtered = [];

    if (filterType === "all") {
      filtered = prompts.filter((prompt) => prompt.is_admin);
    } else if (filterType === "my" && userId) {
      filtered = prompts.filter(
        (prompt) => prompt.created_by && prompt.created_by.toString() === userId
      );
    } else if (filterType === "favorites" && userId) {
      filtered = prompts.filter(
        (prompt) =>
          prompt.favoriteUsers && prompt.favoriteUsers.includes(userId)
      );
    } else {
      filtered = prompts;
    }

    // Apply partial-match filtering for niche using regex (if a niche filter is provided)
    if (selectedNiche.trim() !== "" && selectedNiche !== "all") {
      const nicheRegex = new RegExp(selectedNiche.trim(), "i");
      filtered = filtered.filter((prompt) =>
        nicheRegex.test(prompt.niche.trim())
      );
    }

    // Finally, sort by createdAt (or updatedAt if createdAt is missing)
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt || b.updatedAt) -
        new Date(a.createdAt || a.updatedAt)
    );

    setFilteredPrompts(filtered);
  }, [filterType, selectedNiche, prompts, userId]);

  // Get unique niches for the dropdown
  const promptsForNiches = prompts.filter(
    (prompt) =>
      prompt.is_admin ||
      (prompt.created_by && prompt.created_by.toString() === userId)
  );
  const uniqueNiches = [
    "all",
    ...new Set(promptsForNiches.map((p) => p.niche)),
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading prompts...</p>
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
    <div className="min-h-screen overflow-x-hidden bg-[var(--color-bg)]">
      <div className="container mx-auto max-w-full p-4 sm:p-6 lg:p-8 flex flex-col">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Prompt Library</h1>
          <p className="text-gray-600">
            Create, manage, and generate prompts to power your YouTube scripts.
          </p>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-white border border-[var(--color-gray-light)] rounded-lg p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`btn ${filterType === "all" && "active-filter"}`}
            >
              All Prompts
            </button>
            <button
              onClick={() => setFilterType("my")}
              className={`btn ${filterType === "my" && "active-filter"}`}
            >
              My Prompts
            </button>
            <button
              onClick={() => setFilterType("favorites")}
              className={`btn ${filterType === "favorites" && "active-filter"}`}
            >
              Favorites
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

          {/* Create New Prompt Button */}
          <NavLink to="/create-prompt" className="btn active-filter ">
            Create New Prompt
          </NavLink>
        </div>

        {/* Prompts Grid */}
        {filteredPrompts.length === 0 ? (
          <p className="text-center text-gray-500">
            No prompts match the selected criteria.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-5">
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt._id}
                prompt={prompt}
                onBookmarkToggle={handleBookmarkToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PromptsPage;
