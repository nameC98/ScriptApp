import { useState, useEffect } from "react";
import axios from "axios";

const TrendingTopics = () => {
  const [videos, setVideos] = useState([]);
  const [niche, setNiche] = useState("all"); // Default to "all"
  const [niches, setNiches] = useState([]); // Store niches from backend
  const [loading, setLoading] = useState(false);

  // Filter states for sorting and rank filtering
  const [sort, setSort] = useState("rank"); // "rank" or "new"
  const [rank, setRank] = useState("All"); // "All", "Excellent", etc.

  // Fetch distinct niches on mount
  useEffect(() => {
    const fetchNiches = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/videos/niches"
        );
        setNiches(data);
      } catch (error) {
        console.error("Error fetching niches:", error);
      }
    };
    fetchNiches();
  }, []);

  // Build query string based on current filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (niche && niche !== "all") params.append("niche", niche);
    if (sort) params.append("sort", sort);
    if (rank && rank !== "All") params.append("rank", rank);
    return params.toString();
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const queryString = buildQueryString();
      const { data } = await axios.get(
        `http://localhost:5000/api/videos?${queryString}`
      );
      setVideos(data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, [niche, sort, rank]);

  const handleNicheChange = (e) => setNiche(e.target.value);
  const handleSortChange = (e) => setSort(e.target.value);
  const handleRankChange = (e) => setRank(e.target.value);

  // Determine the rank category for display
  const getRankCategory = (video) => {
    if (!video || typeof video !== "object") {
      return { label: "Unknown", color: "#6c757d" }; // Gray color for undefined cases
    }

    if (video.rank) {
      if (video.rank === "Excellent")
        return { label: "Excellent", color: "#28a745" };
      if (video.rank === "Very Good")
        return { label: "Very Good", color: "#ffc107" };
      if (video.rank === "Good") return { label: "Good", color: "#dc3545" };
    }

    const score = video.trendingScore || 0;
    if (score >= 15) return { label: "Excellent", color: "#28a745" };
    if (score >= 8) return { label: "Very Good", color: "#ffc107" };
    return { label: "Good", color: "#dc3545" };
  };

  // Format the date (e.g., "Feb 20, 2024")
  const formatDate = (dateStr) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-6 bg-[var(--color-bg)] min-h-screen">
      <div className="container mx-auto">
        {/* Filter Card */}
        <div className="card mb-6 p-4">
          <div className="flex flex-wrap gap-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block mb-1 font-bold">Niche</label>
              <select
                value={niche}
                onChange={handleNicheChange}
                className="select w-full"
              >
                <option value="all">All</option>
                {niches.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block mb-1 font-bold">Sort By</label>
              <select
                value={sort}
                onChange={handleSortChange}
                className="select w-full"
              >
                <option value="rank">Trending Score</option>
                <option value="new">Newest</option>
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block mb-1 font-bold">Rank</label>
              <select
                value={rank}
                onChange={handleRankChange}
                className="select w-full"
              >
                <option value="All">All</option>
                <option value="Excellent">Excellent</option>
                <option value="Very Good">Very Good</option>
                <option value="Good">Good</option>
              </select>
            </div>
          </div>
        </div>

        {/* Video Cards */}
        {loading ? (
          <p className="text-center">Loading trending videos...</p>
        ) : (
          <div className="flex flex-wrap gap-6 justify-start">
            {videos.map((video) => {
              const rankObj = getRankCategory(video);
              return (
                <div
                  key={video._id}
                  className="card w-[300px] p-4 bg-[var(--color-white)]"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-muted">
                      {formatDate(video.createdAt)}
                    </div>
                    <div
                      className="text-xs text-white px-2 py-1 rounded-full"
                      style={{ backgroundColor: rankObj.color }}
                    >
                      {rankObj.label}
                    </div>
                  </div>
                  <h3 className="text-lg text-black mb-0">{video.title}</h3>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingTopics;
