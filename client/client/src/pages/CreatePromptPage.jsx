import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreatePromptPage() {
  const [niche, setNiche] = useState("");
  const [style, setStyle] = useState("");
  const [promptTemplate, setPromptTemplate] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!niche || !style || !promptTemplate) {
      setError("Please fill in all fields.");
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
      const data = await response.json();
      navigate("/prompts"); // Redirect to PromptsPage after creation
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-[#EEF5FF] min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4">Create New Prompt</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
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
    </div>
  );
}

export default CreatePromptPage;
