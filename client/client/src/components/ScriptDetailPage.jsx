import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaDownload,
  FaEdit,
  FaCopy,
  FaSpinner,
  FaSyncAlt,
} from "react-icons/fa";
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

  // Modal states
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);

  // Editing state
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // Available prompts state
  const [availablePrompts, setAvailablePrompts] = useState([]);
  const userId2 = localStorage.getItem("userId");

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

  useEffect(() => {
    if (showStyleModal && script) {
      fetchPrompts();
    }
  }, [showStyleModal, script]);

  const fetchPrompts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/scripts/prompts");
      if (!response.ok) throw new Error("Failed to fetch prompts");
      const data = await response.json();
      const filtered = data.filter(
        (p) => p.niche.toLowerCase() === script.niche.toLowerCase()
      );
      setAvailablePrompts(filtered);
    } catch (err) {
      console.error("Error fetching prompts:", err);
      toast.error(err.message);
    }
  };

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

  const openStyleModal = () => {
    setAvailablePrompts([]);
    setShowStyleModal(true);
  };

  const handleSelectPrompt = async (prompt) => {
    try {
      const statusResponse = await fetch(
        `http://localhost:5000/api/subscription/status?userId=${userId2}`
      );
      const statusData = await statusResponse.json();
      if (statusData.subscriptionStatus !== "active") {
        toast.error("Please activate your plan to rephrase a script.");
        return;
      }
    } catch (err) {
      console.error("Error checking subscription status for rephrase:", err);
      toast.error("Error checking subscription status.");
      return;
    }

    setRephraseLoading(true);
    try {
      const userId = userId2;
      const response = await fetch(
        "http://localhost:5000/api/scripts/rephrase-preview",
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

  const acceptRephrasedScript = async () => {
    try {
      const userId = userId2;
      const response = await fetch(
        "http://localhost:5000/api/scripts/rephrase-save",
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

  const cancelRephrasedScript = () => {
    toast.info("Rephrased script discarded.");
    setShowPreviewModal(false);
  };

  const handleEdit = () => {
    setEditTitle(script.title);
    setEditContent(script.content);
    setShowEditModal(true);
  };

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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
        <p className="text-xl sm:text-2xl font-bold text-gray-800">
          Loading...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
        <p className="text-xl sm:text-2xl font-bold text-yellow-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 py-8 px-4">
      <ToastContainer />
      <div className="relative max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-8">
        {/* Header Section with Buttons Overlay */}
        <div className="relative mb-6 border-b pb-4">
          {/* Buttons Overlay: Added flex-wrap for responsiveness */}
          <div className="absolute top-0 left-0 flex flex-wrap gap-2 p-2 z-10 bg-white/80 rounded-b">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded shadow transition-all text-xs"
            >
              <FaDownload size={14} />
              <span>Download</span>
            </button>
            <button
              onClick={openStyleModal}
              disabled={rephraseLoading}
              className="flex items-center gap-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded shadow transition-all text-xs disabled:opacity-50"
            >
              <FaSyncAlt size={14} />
              <span>Rephrase</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded shadow transition-all text-xs"
            >
              <FaCopy size={14} />
              <span>Copy</span>
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded shadow transition-all text-xs"
            >
              <FaEdit size={14} />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 bg-yellow-600 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded shadow transition-all text-xs"
              title="Delete Script"
            >
              <FaTrash size={14} />
              <span>Delete</span>
            </button>
          </div>
          {/* Title with top padding to avoid overlap */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 pt-16 break-words">
            {script.title}
          </h1>
          {/* Additional Header Details */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
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

        {/* Script Content */}
        <div
          className="prose max-w-none mb-8"
          style={{ whiteSpace: "pre-wrap" }}
        >
          <ReactMarkdown>{script.content}</ReactMarkdown>
        </div>
      </div>

      {/* Modal for Style Selection */}
      {showStyleModal && (
        <Modal onClose={() => setShowStyleModal(false)}>
          <div className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
              Choose a Rephrase Style
            </h2>
            <p className="mb-4">
              {rephraseLoading
                ? "Rephrasing, please wait..."
                : `Select one of the available prompt styles for the ${script.niche} niche:`}
            </p>
            {rephraseLoading ? (
              <div className="flex justify-center items-center h-24">
                <FaSpinner className="animate-spin text-4xl text-green-500" />
              </div>
            ) : availablePrompts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availablePrompts.map((prompt) => (
                  <div
                    key={prompt._id}
                    className="border p-4 rounded-lg hover:shadow-lg cursor-pointer"
                    onClick={() => handleSelectPrompt(prompt)}
                  >
                    <h3 className="text-lg font-bold mb-2">{prompt.style}</h3>
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
          <div className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
              Rephrased Script Preview
            </h2>
            <div className="mb-4">
              <input
                type="text"
                value={previewTitle}
                onChange={(e) => setPreviewTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Script Title"
              />
            </div>
            <div className="mb-4">
              <textarea
                value={previewContent}
                onChange={(e) => setPreviewContent(e.target.value)}
                className="w-full h-48 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal for Editing the Current Script */}
      {showEditModal && (
        <Modal
          onClose={() => setShowEditModal(false)}
          customClass="max-w-full sm:max-w-3xl"
        >
          <div className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
              Edit Script
            </h2>
            <div className="mb-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Script Title"
              />
            </div>
            <div className="mb-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-60 sm:h-96 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-green-600 transition-colors"
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
