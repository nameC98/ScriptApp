import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaTrash, FaDownload, FaEdit, FaCopy, FaSpinner } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "./Modal";
import ReactMarkdown from "react-markdown";

function ScriptDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [script, setScript] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rephraseLoading, setRephraseLoading] = useState(false);

  // Modal state for rephrase preview, edit, and style selection
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);

  // New state for editing the current script
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // New state for storing available prompts (for the script’s niche)
  const [availablePrompts, setAvailablePrompts] = useState([]);

  // Fetch the script details
  const fetchScript = async (scriptId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/scripts/${scriptId}`
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      setScript(data);
    } catch (err) {
      console.error("Error fetching script:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScript(id);
  }, [id]);

  // When the style modal opens, fetch prompts for the current script's niche
  useEffect(() => {
    if (showStyleModal && script) {
      fetchPrompts();
    }
  }, [showStyleModal, script]);

  const fetchPrompts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/scripts/prompts`);
      if (!response.ok) throw new Error("Failed to fetch prompts");
      const data = await response.json();
      // Filter prompts by the script's niche (case-insensitive)
      const filtered = data.filter(
        (p) => p.niche.toLowerCase() === script.niche.toLowerCase()
      );
      setAvailablePrompts(filtered);
    } catch (err) {
      console.error("Error fetching prompts:", err);
      toast.error(err.message);
    }
  };

  // Mark the script as used (if status is unused)
  const markScriptUsed = async () => {
    if (script.status === "unused") {
      try {
        const response = await fetch(
          `http://localhost:5000/api/scripts/${script._id}/mark-used`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!response.ok) throw new Error("Failed to update script status");
        const updatedScript = await response.json();
        setScript(updatedScript);
        toast.success("Script marked as used");
      } catch (err) {
        console.error("Error marking script as used:", err);
        toast.error("Error marking script as used");
      }
    }
  };

  // Download the script as a text file
  const handleDownload = async () => {
    if (!script) return;
    const element = document.createElement("a");
    const file = new Blob([script.content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${script.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    await markScriptUsed();
  };

  // Copy the script content to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script.content);
      toast.success("Script copied to clipboard!");
      await markScriptUsed();
    } catch (err) {
      console.error("Failed to copy script:", err);
      toast.error("Failed to copy script");
    }
  };

  // Open the style modal for rephrase preview
  const openStyleModal = () => {
    setAvailablePrompts([]); // Reset any previous prompts
    setShowStyleModal(true);
  };

  // When a prompt card is clicked, use its style to generate a rephrase preview
  const handleSelectPrompt = async (prompt) => {
    console.log(prompt);
    setRephraseLoading(true);
    try {
      const userId = "67af2392fdbd996fca933a22"; // Replace with actual user ID
      const response = await fetch(
        `http://localhost:5000/api/scripts/rephrase-preview`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            scriptId: script._id,
            style: prompt.style,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to generate rephrase preview");
      const data = await response.json();
      setPreviewTitle(data.script.title);
      setPreviewContent(data.script.content);
      setShowPreviewModal(true);
      setShowStyleModal(false);
    } catch (err) {
      console.error("Error generating rephrase preview:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setRephraseLoading(false);
    }
  };

  // Accept rephrased script and save it
  const acceptRephrasedScript = async () => {
    try {
      const userId = "67af2392fdbd996fca933a22"; // Replace with actual user ID
      const response = await fetch(
        `http://localhost:5000/api/scripts/rephrase-save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            scriptId: script._id,
            title: previewTitle,
            content: previewContent,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to save rephrased script");
      const data = await response.json();
      toast.success("Rephrased script accepted and saved!");
      setShowPreviewModal(false);
      navigate(`/scripts/${data.script._id}`);
    } catch (err) {
      console.error("Error saving rephrased script:", err);
      toast.error(err.message);
    }
  };

  // Cancel the rephrase preview
  const cancelRephrasedScript = () => {
    toast.info("Rephrased script discarded.");
    setShowPreviewModal(false);
  };

  // Open the Edit modal with current script details
  const handleEdit = () => {
    setEditTitle(script.title);
    setEditContent(script.content);
    setShowEditModal(true);
  };

  // Save the edits to the current script
  const handleAcceptEdit = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/scripts/${script._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editTitle,
            content: editContent,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to update script");
      const updatedScript = await response.json();
      setScript(updatedScript);
      toast.success("Script updated successfully");
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating script:", err);
      toast.error(err.message);
    }
  };

  // Delete the script
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this script?")) return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/scripts/${script._id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }
      toast.success("Script deleted successfully");
      navigate("/myscripts");
    } catch (err) {
      console.error("Error deleting script:", err);
      setError(err.message);
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-300">
        <p className="text-2xl font-semibold text-gray-800">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-300">
        <p className="text-2xl font-semibold text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 py-8">
      <ToastContainer />
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        {/* Header with title and delete button */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
              {script.title}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {script.niche.charAt(0).toUpperCase() + script.niche.slice(1)}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  script.status === "used"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {script.status === "used" ? "Used" : "Unused"}
              </span>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600 transition-colors"
            title="Delete Script"
          >
            <FaTrash size={28} />
          </button>
        </div>

        {/* Script Content */}
        <div
          className="prose max-w-none mb-8"
          style={{ whiteSpace: "pre-wrap" }}
        >
          <ReactMarkdown>{script.content}</ReactMarkdown>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition-all"
          >
            <FaDownload size={18} />
            <span>Download Script</span>
          </button>
          <button
            onClick={openStyleModal}
            disabled={rephraseLoading}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition-all disabled:opacity-50"
          >
            <FaEdit size={18} />
            <span>{rephraseLoading ? "Rephrasing..." : "Rephrase Script"}</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition-all"
          >
            <FaCopy size={18} />
            <span>Copy Script</span>
          </button>
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition-all"
          >
            <FaEdit size={18} />
            <span>Edit Script</span>
          </button>
        </div>
      </div>

      {/* Modal for Style Selection (Display cards for available prompt styles) */}
      {showStyleModal && (
        <Modal onClose={() => setShowStyleModal(false)}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Choose a Rephrase Style
            </h2>
            <p className="mb-4">
              {rephraseLoading
                ? "Rephrasing, please wait..."
                : `Select one of the available prompt styles for the `}
              <strong>{script.niche}</strong> niche:
            </p>
            {rephraseLoading ? (
              <div className="flex justify-center items-center h-24">
                <FaSpinner className="animate-spin text-4xl text-blue-500" />
              </div>
            ) : availablePrompts.length > 0 ? (
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
                    <p className="text-sm text-gray-600">
                      {prompt.promptTemplate.substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No prompt templates found for this niche.</p>
            )}
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setShowStyleModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal for Rephrase Preview */}
      {showPreviewModal && (
        <Modal onClose={cancelRephrasedScript}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Rephrased Script Preview
            </h2>
            <div className="mb-4">
              <input
                type="text"
                value={previewTitle}
                onChange={(e) => setPreviewTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Script Title"
              />
            </div>
            <div className="mb-4">
              <textarea
                value={previewContent}
                onChange={(e) => setPreviewContent(e.target.value)}
                className="w-full h-48 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Script Content"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelRephrasedScript}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={acceptRephrasedScript}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal for Editing the Current Script */}
      {showEditModal && (
        <Modal onClose={() => setShowEditModal(false)} customClass="max-w-3xl">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Edit Script
            </h2>
            <div className="mb-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Script Title"
              />
            </div>
            <div className="mb-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-96 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Script Content"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptEdit}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ScriptDetailPage;
