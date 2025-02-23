import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";

function CustomScriptForm() {
  const [niche, setNiche] = useState("");
  const [length, setLength] = useState("");
  const [topic, setTopic] = useState("");
  const [channel, setChannel] = useState("");
  const [selectedPromptStyle, setSelectedPromptStyle] = useState("");
  const [generatedScript, setGeneratedScript] = useState(null);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  // Modal state for prompt style selection
  const [showPromptStyleModal, setShowPromptStyleModal] = useState(false);
  const [availablePrompts, setAvailablePrompts] = useState([]);
  const userId2 = localStorage.getItem("userId");

  const navigate = useNavigate();

  // When the form is submitted, first check if the user's subscription is active.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!niche || !length || !topic || !selectedPromptStyle) {
      setError(
        "Please fill out all required fields and select a prompt style."
      );
      return;
    }

    // Check user's subscription status before generating the script.
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

    // Prepare the payload – note that style now comes from our prompt selection.
    const payload = {
      userId: userId2, // Replace with dynamic user ID if needed
      niche,
      title: topic,
      style: selectedPromptStyle,
      length:
        length === "short"
          ? "1-2 minutes"
          : length === "medium"
          ? "3-5 minutes"
          : "6+ minutes",
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

  // Open the prompt style modal.
  const openPromptStyleModal = () => {
    if (!niche) {
      setError("Please select a niche before choosing a prompt style.");
      return;
    }
    setAvailablePrompts([]);
    setShowPromptStyleModal(true);
    fetchPrompts();
  };

  // Fetch available prompt templates from the backend, filtered by the selected niche.
  const fetchPrompts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/scripts/prompts");
      if (!response.ok) throw new Error("Failed to fetch prompt templates");
      const data = await response.json();
      const filtered = data.filter(
        (p) => p.niche.toLowerCase() === niche.toLowerCase()
      );
      setAvailablePrompts(filtered);
    } catch (err) {
      console.error("Error fetching prompts:", err);
      setError(err.message);
    }
  };

  // When a prompt card is clicked, save its style and close the modal.
  const handleSelectPrompt = (prompt) => {
    console.log("Selected prompt:", prompt);
    setSelectedPromptStyle(prompt.style);
    setShowPromptStyleModal(false);
  };

  return (
    <div className="h-[90vh] text-gray-500 nav text-[13px] bg-[#EEF5FF] flex items-center justify-center p-6">
      <div className="bg-white shadow-md rounded-lg sm:p-8 py-[1rem] px-4 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-500">
          Generate Script
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Niche */}
          <div>
            <label
              htmlFor="niche"
              className="block text-sm font-medium text-gray-700"
            >
              Niche:
            </label>
            <select
              id="niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0"
            >
              <option value="">Select Niche</option>
              <option value="tech">Tech</option>
              <option value="gaming">Gaming</option>
              <option value="travel">Travel</option>
              <option value="finance">Finance</option>
              <option value="lifestyle">Lifestyle</option>
            </select>
          </div>

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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0"
            />
          </div>

          {/* YouTube Channel (optional) */}
          <div>
            <label
              htmlFor="channel"
              className="block text-sm font-medium text-gray-700"
            >
              YouTube Channel (optional):
            </label>
            <select
              id="channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0"
            >
              <option value="">Select Channel</option>
              <option value="MKBHD">MKBHD</option>
              <option value="Casey Neistat">Casey Neistat</option>
              <option value="Linus Tech Tips">Linus Tech Tips</option>
            </select>
          </div>

          {/* Prompt Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prompt Style:
            </label>
            <div className="flex items-center mt-1">
              <input
                type="text"
                value={selectedPromptStyle}
                readOnly
                placeholder="No prompt style selected"
                className="flex-1 w-[20px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-0"
              />
              <button
                type="button"
                onClick={openPromptStyleModal}
                className="ml-3  gradient-button  text-white font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                {selectedPromptStyle ? "Change Prompt" : "Select Prompt"}
              </button>
            </div>
          </div>

          {/* Generate Script Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full gradient-button text-white font-semibold py-3 rounded-md transition duration-200"
            >
              {isGenerating ? "Generating..." : "Generate Script"}
            </button>
          </div>
        </form>

        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </div>

      {/* Modal for Prompt Style Selection */}
      {showPromptStyleModal && (
        <Modal onClose={() => setShowPromptStyleModal(false)}>
          <div className="p-6 nav text-[13px]">
            <h2 className="sm:text-2xl text-sm text-black/70 font-bold mb-4 text-gray-600">
              Choose a Prompt Style for {niche}
            </h2>
            {availablePrompts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availablePrompts.map((prompt) => (
                  <div
                    key={prompt._id}
                    className="border p-4 rounded-lg hover:shadow-lg cursor-pointer"
                    onClick={() => handleSelectPrompt(prompt)}
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      {prompt.style}
                    </h3>
                    <p className="text-[12px] text-gray-600">
                      {prompt.promptTemplate}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No prompt templates found for this niche.</p>
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
    </div>
  );
}

export default CustomScriptForm;
