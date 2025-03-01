import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function PromptDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/scripts/prompts/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch prompt details");
        }
        const data = await response.json();
        setPrompt(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompt();
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/scripts/prompts/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete prompt");
      }
      navigate("/prompts");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading prompt details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Prompt not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#EEF5FF] min-h-screen p-4">
      <div className="container mx-auto bg-white p-6 rounded-lg shadow-md">
        {prompt.is_admin && prompt.image && (
          <img
            src={prompt.image}
            alt={prompt.title || "Prompt"}
            className="w-full h-48 object-cover rounded mb-4"
          />
        )}
        <h1 className="text-3xl font-bold mb-2">
          {prompt.title || prompt.style || "Prompt Details"}
        </h1>
        <p className="text-gray-600 mb-4">
          <strong>Niche:</strong> {prompt.niche} | <strong>Style:</strong>{" "}
          {prompt.style}
        </p>
        <div className="prose mb-6">
          <p>{prompt.promptTemplate}</p>
        </div>
        {/* If the logged-in user is the creator, show Edit and Delete options */}
        {prompt.created_by === userId && (
          <div className="flex gap-4">
            <button
              onClick={() => navigate(`/edit-prompt/${prompt._id}`)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PromptDetailPage;
