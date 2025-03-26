import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const TrendingTopics = () => {
  const [videos, setVideos] = useState([]);
  const [niche, setNiche] = useState("all");
  const [niches, setNiches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("latest");
  const navigate = useNavigate(); // Initialize navigate

  const dateOptions = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "This Week", value: "thisWeek" },
    { label: "Last Month", value: "lastMonth" },
    { label: "Old", value: "old" },
    { label: "Latest", value: "latest" },
  ];

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

  const getDateRangeParams = (range) => {
    const today = new Date();
    let startDate, endDate;
    switch (range) {
      case "today": {
        startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);
        break;
      }
      case "yesterday": {
        endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 1);
        break;
      }

      case "thisWeek": {
        const firstDay = new Date(today);
        firstDay.setDate(today.getDate() - today.getDay());
        startDate = new Date(
          firstDay.getFullYear(),
          firstDay.getMonth(),
          firstDay.getDate()
        );
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        break;
      }
      case "lastMonth": {
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      }
      case "old": {
        startDate = new Date("1970-01-01");
        endDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        break;
      }
      case "latest":
      default:
        break;
    }
    return { startDate, endDate };
  };

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (niche && niche !== "all") params.append("niche", niche);

    if (dateRange && dateRange !== "latest") {
      const { startDate, endDate } = getDateRangeParams(dateRange);
      console.log("Date Range Params:", { startDate, endDate });
      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());
    }
    return params.toString();
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const queryString = buildQueryString();
      console.log("Query String:", queryString);
      const { data } = await axios.get(
        `http://localhost:5000/api/videos?${queryString}`
      );

      let filteredVideos = data;

      if (dateRange && dateRange !== "latest") {
        const { startDate, endDate } = getDateRangeParams(dateRange);
        filteredVideos = data.filter((video) => {
          const created = new Date(video.createdAt);
          if (endDate) {
            return created >= startDate && created < endDate;
          }
          return created >= startDate;
        });
      }

      const sortedVideos = filteredVideos.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setVideos(sortedVideos);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, [niche, dateRange]);

  const handleNicheChange = (e) => setNiche(e.target.value);
  const handleDateRangeChange = (e) => setDateRange(e.target.value);

  const formatDate = (dateStr) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  // When clicking a topic, navigate to the CustomScriptForm page with the topic as state.
  const handleTopicClick = (videoTitle) => {
    navigate("/generate", { state: { topic: videoTitle } });
  };

  return (
    <div className="p-6 bg-[var(--color-bg)] min-h-screen">
      <div className="container mx-auto">
        <div className="card border-2 mb-6 p-4 rounded-lg bg-white">
          <div className="flex flex-wrap gap-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block mb-1 font-bold text-sm">Niche</label>
              <select
                value={niche}
                onChange={handleNicheChange}
                className="w-full px-3 py-2 border-black bg-white border-[1px] focus:outline-none shadow-sm text-sm font-bold"
              >
                <option value="all">All</option>
                {niches.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block mb-1 font-bold text-sm">Date Range</label>
              <select
                value={dateRange}
                onChange={handleDateRangeChange}
                className="w-full px-3 py-2 border-black bg-white border-[1px] focus:outline-none shadow-sm text-sm font-bold"
              >
                {dateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-center">Loading trending videos...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-5">
            {videos.map((video) => (
              <div
                key={video._id}
                onClick={() => handleTopicClick(video.title)}
                className="cursor-pointer card border-2 p-4 bg-[var(--color-white)] w-full rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-white px-2 py-1 rounded-lg bg-[#4A4A4A]">
                    {video.niche}
                  </div>
                  <div className="text-xs text-white px-2 py-1 rounded-lg bg-[#4A4A4A]">
                    {formatDate(video.createdAt)}
                  </div>
                </div>
                <h3 className="text-semibold text-base mb-0">{video.title}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingTopics;
