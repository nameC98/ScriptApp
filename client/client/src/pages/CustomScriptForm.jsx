import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Modal from "../components/Modal";

function CustomScriptForm() {
  const [length, setLength] = useState("");
  const [topic, setTopic] = useState("");
  const [channel, setChannel] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState(null); // now stores the full prompt object
  const [generatedScript, setGeneratedScript] = useState(null);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  // Modal states for prompt selection and prompt view
  const [showPromptStyleModal, setShowPromptStyleModal] = useState(false);
  const [availablePrompts, setAvailablePrompts] = useState([]);
  const [viewingPrompt, setViewingPrompt] = useState(null);
  // New filtering states for the popup
  const [filterType, setFilterType] = useState("all"); // "all", "my", or "favorites"
  const [selectedNiche, setSelectedNiche] = useState("all");

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userId2 = userId; // for consistency

  // Fetch available prompt templates from the backend.
  const fetchPrompts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/scripts/prompts");
      if (!response.ok) throw new Error("Failed to fetch prompt templates");
      const data = await response.json();
      setAvailablePrompts(data);
    } catch (err) {
      console.error("Error fetching prompts:", err);
      setError(err.message);
    }
  };

  // Handle form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!length || !topic || !selectedPrompt) {
      setError(
        "Please fill out all required fields and select a prompt style."
      );
      return;
    }

    try {
      const statusResponse = await fetch(
        `http://localhost:5000/api/subscription/status?userId=${userId2}`
      );
      const statusData = await statusResponse.json();
      if (statusData.subscriptionStatus !== "active") {
        setError("Please activate your plan to generate a script.");
        return;
      }
    } catch (err) {
      console.error("Error checking subscription status:", err);
      setError("Error checking subscription status.");
      return;
    }

    setIsGenerating(true);

    const payload = {
      userId: userId2,
      title: topic,
      promptTemplate: selectedPrompt.promptTemplate, // using the selected prompt's template
      style: selectedPrompt.style, // include style to satisfy the model requirements
      length:
        length === "short"
          ? "1-2 minutes"
          : length === "medium"
          ? "3-5 minutes"
          : "6+ minutes",
      niche: selectedPrompt.niche || "General",
    };

    console.log("Payload being sent:", payload);

    try {
      const response = await fetch(
        "http://localhost:5000/api/scripts/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error generating script");
      }
      setGeneratedScript(data.script);
      setShowPromptStyleModal(false);
      navigate(`/scripts/${data.script._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Open the prompt style modal, reset filters, and fetch prompts.
  const openPromptStyleModal = () => {
    setFilterType("all");
    setSelectedNiche("all");
    setAvailablePrompts([]);
    setShowPromptStyleModal(true);
    fetchPrompts();
  };

  // Handle niche filter changes.
  const handleNicheFilterChange = (e) => {
    setSelectedNiche(e.target.value);
  };

  // Compute unique niches from the available prompts.
  const uniqueNiches = [
    "all",
    ...new Set(availablePrompts.filter((p) => p.niche).map((p) => p.niche)),
  ];

  // Compute filtered prompts based on filterType and selectedNiche.
  let filteredPrompts = availablePrompts.filter((prompt) => {
    let passesFilter = true;
    if (filterType === "all") {
      passesFilter = prompt.is_admin;
    } else if (filterType === "my" && userId) {
      passesFilter =
        prompt.created_by && prompt.created_by.toString() === userId;
    } else if (filterType === "favorites" && userId) {
      passesFilter =
        prompt.favoriteUsers && prompt.favoriteUsers.includes(userId);
    }
    if (selectedNiche !== "all" && prompt.niche) {
      const nicheRegex = new RegExp(selectedNiche.trim(), "i");
      passesFilter = passesFilter && nicheRegex.test(prompt.niche);
    }
    return passesFilter;
  });

  // Optionally, sort the filtered prompts (most recent first).
  filteredPrompts.sort(
    (a, b) =>
      new Date(b.createdAt || b.updatedAt) -
      new Date(a.createdAt || a.updatedAt)
  );

  // Component to display a prompt as a card with "Select" and "View" options.
  const PromptCard = ({ prompt, onSelect, onView }) => {
    const shortText =
      prompt.promptTemplate.length > 100
        ? prompt.promptTemplate.substring(0, 100) + "..."
        : prompt.promptTemplate;
    return (
      <div className="border p-4 rounded-lg hover:shadow-xl transition-shadow flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">{prompt.style}</h3>
          <p className="text-[12px] text-gray-600">{shortText}</p>
          {prompt.niche && (
            <span className="text-xs text-gray-500 block mt-1">
              Niche: {prompt.niche}
            </span>
          )}
        </div>
        <div className="mt-3 flex justify-end space-x-2">
          <button
            onClick={() => onSelect(prompt)}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors"
          >
            Select
          </button>
          <button
            onClick={() => onView(prompt)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors"
          >
            View
          </button>
        </div>
      </div>
    );
  };

  PromptCard.propTypes = {
    prompt: PropTypes.shape({
      _id: PropTypes.string,
      promptTemplate: PropTypes.string.isRequired,
      style: PropTypes.string.isRequired,
      niche: PropTypes.string,
      created_by: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      is_admin: PropTypes.bool,
      favoriteUsers: PropTypes.arrayOf(PropTypes.string),
      createdAt: PropTypes.string,
      updatedAt: PropTypes.string,
    }).isRequired,
    onSelect: PropTypes.func.isRequired,
    onView: PropTypes.func.isRequired,
  };

  // When a prompt is selected.
  const handleSelectPrompt = (prompt) => {
    console.log("Selected prompt:", prompt);
    setSelectedPrompt(prompt);
    setShowPromptStyleModal(false);
  };

  return (
    <div className="h-[90vh] text-gray-500 nav text-[13px] bg-[#EEF5FF] flex items-center justify-center p-6">
      <div className="bg-white shadow-md rounded-lg sm:p-8 py-6 px-4 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-700">
          Generate Script
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Script Length */}
          <div>
            <label
              htmlFor="length"
              className="block text-sm font-medium text-gray-700"
            >
              Script Length:
            </label>
            <select
              id="length"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            >
              <option value="">Select Length</option>
              <option value="short">Short (1-2 minutes)</option>
              <option value="medium">Medium (3-5 minutes)</option>
              <option value="long">Long (6+ minutes)</option>
            </select>
          </div>

          {/* Topic/Title */}
          <div>
            <label
              htmlFor="topic"
              className="block text-sm font-medium text-gray-700"
            >
              Topic/Title:
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic or title"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            />
          </div>

          {/* YouTube Channel (optional) */}

          {/* Prompt Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prompt Style:
            </label>
            <div className="flex items-center mt-1">
              <input
                type="text"
                value={selectedPrompt ? selectedPrompt.promptTemplate : ""}
                readOnly
                placeholder="No prompt style selected"
                className="flex-1 w-[20px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
              />
              <button
                type="button"
                onClick={openPromptStyleModal}
                className="ml-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                {selectedPrompt ? "Change Prompt" : "Select Prompt"}
              </button>
            </div>
          </div>

          {/* Generate Script Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold py-3 rounded-md transition duration-200"
            >
              {isGenerating ? "Generating..." : "Generate Script"}
            </button>
          </div>
        </form>

        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </div>

      {/* Modal for Prompt Style Selection */}
      {showPromptStyleModal && (
        <Modal
          onClose={() => setShowPromptStyleModal(false)}
          customClass="max-w-8xl"
          marginClass="my-8"
        >
          <div className="p-6 nav text-[13px]">
            <h2 className="sm:text-2xl text-sm text-gray-700 font-bold mb-4">
              Choose a Prompt Style
            </h2>
            {/* Filtering Options */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm ${
                    filterType === "all"
                      ? "bg-blue-500 text-white"
                      : "bg-[#EEF5FF] font-bold text-black"
                  }`}
                >
                  All Prompts
                </button>
                <button
                  onClick={() => setFilterType("my")}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm ${
                    filterType === "my"
                      ? "bg-blue-500 text-white"
                      : "bg-[#EEF5FF] font-bold text-black"
                  }`}
                >
                  My Prompts
                </button>
                <button
                  onClick={() => setFilterType("favorites")}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm ${
                    filterType === "favorites"
                      ? "bg-blue-500 text-white"
                      : "bg-[#EEF5FF] font-bold text-black"
                  }`}
                >
                  Favorites
                </button>
              </div>
              {/* Niche Filter Dropdown */}
              <div>
                <select
                  value={selectedNiche}
                  onChange={handleNicheFilterChange}
                  className="px-3 py-2 border text-xs sm:text-sm rounded-full bg-[#EEF5FF] focus:outline-none shadow-sm"
                >
                  {uniqueNiches.map((niche, index) => (
                    <option key={index} value={niche}>
                      {niche === "all" ? "All Niches" : niche}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Prompts Grid */}
            {filteredPrompts.length === 0 ? (
              <p className="text-center text-gray-500">
                No prompt templates match the selected criteria.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPrompts.map((prompt) => (
                  <PromptCard
                    key={prompt._id}
                    prompt={prompt}
                    onSelect={handleSelectPrompt}
                    onView={(prompt) => setViewingPrompt(prompt)}
                  />
                ))}
              </div>
            )}
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setShowPromptStyleModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Separate Modal for Viewing Full Prompt */}
      {viewingPrompt && (
        <Modal
          onClose={() => setViewingPrompt(null)}
          customClass="max-w-4xl h-[80vh]"
          marginClass="my-4"
        >
          <div className="p-6 nav text-[13px]">
            <h2 className="sm:text-2xl text-sm text-gray-700 font-bold mb-4">
              {viewingPrompt.style} Prompt Details
            </h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {viewingPrompt.promptTemplate}
            </p>
            {viewingPrompt.niche && (
              <p className="text-xs text-gray-500 mt-2">
                Niche: {viewingPrompt.niche}
              </p>
            )}
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setViewingPrompt(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CustomScriptForm;
