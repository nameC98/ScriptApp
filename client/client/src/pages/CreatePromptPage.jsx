import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreatePromptPage() {
  // Manual form states
  const [niche, setNiche] = useState("");
  const [style, setStyle] = useState("");
  const [promptTemplate, setPromptTemplate] = useState("");
  const [manualError, setManualError] = useState("");

  // Automatic generation states
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [autoError, setAutoError] = useState("");
  const [autoLoading, setAutoLoading] = useState(false);

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  // Manual prompt submission handler (unchanged)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!niche || !style || !promptTemplate) {
      setManualError("Please fill in all fields.");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:5000/api/scripts/prompts",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ niche, style, promptTemplate, userId }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to create prompt");
      }
      navigate("/prompts"); // Redirect after successful creation
    } catch (err) {
      setManualError(err.message);
    }
  };

  const handleAutoGenerate = async () => {
    // Only require YouTube URL; use defaults if niche or style are empty.
    if (!youtubeUrl) {
      setAutoError("Please provide a YouTube URL for auto-generation.");
      return;
    }
    setAutoError("");
    setAutoLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/scripts/prompts/from-youtube",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            youtubeUrl,
            niche: niche || "General",
            style: style || "Neutral",
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate prompt from YouTube");
      }
      setGeneratedPrompt(data.prompt.promptTemplate);
      setAutoError("");
    } catch (err) {
      setAutoError(err.message);
    } finally {
      setAutoLoading(false);
    }
  };

  // Copy the generated prompt to the manual form
  const handleUseGeneratedPrompt = () => {
    setPromptTemplate(generatedPrompt);
  };

  return (
    <div className="bg-[#EEF5FF] min-h-screen p-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Manual Prompt Creation Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">
            Create New Prompt (Manual)
          </h1>
          {manualError && <p className="text-red-500 mb-4">{manualError}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Niche</label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter niche (e.g., Tech, Lifestyle)"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Style</label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter style (e.g., Formal, Casual)"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Prompt Template</label>
              <textarea
                value={promptTemplate}
                onChange={(e) => setPromptTemplate(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter the prompt content here"
                rows="4"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
            >
              Create Prompt
            </button>
          </form>
        </div>

        {/* Automatic Prompt Generation Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">
            Auto-Generate Prompt from YouTube
          </h2>
          {autoError && <p className="text-red-500 mb-4">{autoError}</p>}
          <div className="mb-4">
            <label className="block text-gray-700">
              YouTube URL (for automatic generation)
            </label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="Paste YouTube URL here"
            />
          </div>
          <p className="text-gray-700 mb-4">
            Ensure the Niche and Style fields above match your desired output.
          </p>
          <button
            type="button"
            onClick={handleAutoGenerate}
            disabled={autoLoading}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded"
          >
            {autoLoading ? "Generating..." : "Generate Prompt Automatically"}
          </button>
          {generatedPrompt && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Generated Prompt:</h3>
              <textarea
                value={generatedPrompt}
                readOnly
                className="w-full px-3 py-2 border rounded"
                rows="4"
              ></textarea>
              <button
                type="button"
                onClick={handleUseGeneratedPrompt}
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Use Generated Prompt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreatePromptPage;
