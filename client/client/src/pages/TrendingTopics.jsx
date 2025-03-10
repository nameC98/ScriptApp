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

    // Ensure we check `video.rank`
    if (video.rank) {
      if (video.rank === "Excellent")
        return { label: "Excellent", color: "#28a745" };
      if (video.rank === "Very Good")
        return { label: "Very Good", color: "#ffc107" };
      if (video.rank === "Good") return { label: "Good", color: "#dc3545" };
    }

    // Fallback based on trendingScore
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
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* Attractive & Responsive Filter Card */}
      <div
        style={{
          backgroundColor: "#f7f7f7",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Niche
            </label>
            <select
              value={niche}
              onChange={handleNicheChange}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            >
              <option value="all">All</option>
              {niches.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Sort By
            </label>
            <select
              value={sort}
              onChange={handleSortChange}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            >
              <option value="rank">Trending Score</option>
              <option value="new">Newest</option>
            </select>
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Rank
            </label>
            <select
              value={rank}
              onChange={handleRankChange}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            >
              <option value="All">All</option>
              <option value="Excellent">Excellent</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
            </select>
          </div>
        </div>
      </div>

      {/* Video Cards: Left-aligned, showing title with badge and created date in header */}
      {loading ? (
        <p>Loading trending videos...</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            justifyContent: "flex-start",
          }}
        >
          {videos.map((video) => {
            const rankObj = getRankCategory(video);
            return (
              <div
                key={video._id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  width: "300px",
                  padding: "15px",
                  backgroundColor: "#fff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ fontSize: "0.8em", color: "#555" }}>
                    {formatDate(video.createdAt)}
                  </div>
                  <div
                    style={{
                      background: rankObj.color,
                      color: "#fff",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "0.8em",
                    }}
                  >
                    {rankObj.label}
                  </div>
                </div>
                <h3 style={{ margin: "0", color: "black" }}>{video.title}</h3>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrendingTopics;
