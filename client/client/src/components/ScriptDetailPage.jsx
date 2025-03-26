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

// Helper function to reflow text (preserving paragraph breaks)
const reflowText = (rawText) => {
  return rawText
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\n/g, " "))
    .join("\n\n");
};

// Helper function to strip common Markdown syntax from text
const stripMarkdown = (text) => {
  return (
    text
      // Remove bold (both ** and __)
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      // Remove italics (both * and _)
      .replace(/(\*|_)(.*?)\1/g, "$2")
      // Remove inline code blocks
      .replace(/`(.*?)`/g, "$1")
      // Remove strikethrough
      .replace(/~~(.*?)~~/g, "$1")
  );
};

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

  // Available prompts and filtering state
  const [availablePrompts, setAvailablePrompts] = useState([]);
  const [filterType, setFilterType] = useState("all"); // "all", "my", or "favorites"
  const [selectedNiche, setSelectedNiche] = useState("all");
  const userId2 = localStorage.getItem("userId");

  // Define the default prompt for "No Style" option
  const defaultPrompt = {
    _id: "none",
    style: "No Style",
    promptTemplate:
      "Rephrase the following script preserving its original meaning:",
  };

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

  // Fetch available prompts when style modal is opened
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
      // Store all prompts; filtering will be handled in the UI
      setAvailablePrompts(data);
    } catch (err) {
      console.error("Error fetching prompts:", err);
      toast.error(err.message);
    }
  };

  // Compute unique niches from the available prompts
  const uniqueNiches = [
    "all",
    ...new Set(availablePrompts.filter((p) => p.niche).map((p) => p.niche)),
  ];

  // Compute filtered prompts based on filterType and selectedNiche
  let filteredPrompts = availablePrompts.filter((prompt) => {
    let passesFilter = true;
    if (filterType === "all") {
      passesFilter = prompt.is_admin;
    } else if (filterType === "my" && userId2) {
      passesFilter =
        prompt.created_by && prompt.created_by.toString() === userId2;
    } else if (filterType === "favorites" && userId2) {
      passesFilter =
        prompt.favoriteUsers && prompt.favoriteUsers.includes(userId2);
    }
    if (selectedNiche !== "all" && prompt.niche) {
      const nicheRegex = new RegExp(selectedNiche.trim(), "i");
      passesFilter = passesFilter && nicheRegex.test(prompt.niche);
    }
    return passesFilter;
  });

  // Optionally, sort the filtered prompts (most recent first)
  filteredPrompts.sort(
    (a, b) =>
      new Date(b.createdAt || b.updatedAt) -
      new Date(a.createdAt || a.updatedAt)
  );

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

  // Updated handleDownload now strips Markdown formatting
  const handleDownload = async () => {
    if (!script) return;
    // Convert Markdown to plain text
    const plainText = stripMarkdown(script.content);
    const element = document.createElement("a");
    const file = new Blob([plainText], { type: "text/plain" });
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
    // Reset filtering state and available prompts, then open modal
    setFilterType("all");
    setSelectedNiche("all");
    setAvailablePrompts([]);
    setShowStyleModal(true);
  };

  // Updated: Send promptTemplate instead of style.
  const handleSelectPrompt = async (prompt) => {
    console.log("Selected prompt:", prompt);
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
      const response = await fetch(
        "http://localhost:5000/api/scripts/rephrase-preview",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId2,
            scriptId: script._id,
            promptTemplate: prompt.promptTemplate,
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
      const response = await fetch(
        "http://localhost:5000/api/scripts/rephrase-save",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId2,
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

  // Handle niche filter changes for the style modal
  const handleNicheFilterChange = (e) => {
    setSelectedNiche(e.target.value);
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

  // Format the script content before rendering
  const formattedContent = reflowText(script.content);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 py-8 px-4">
      <ToastContainer />
      <div className="relative max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-8">
        {/* Header Section with Buttons Overlay */}
        <div className="relative mb-6 border-b pb-4">
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 pt-16 break-words">
            {script.title}
          </h1>
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
          style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        >
          <ReactMarkdown>{formattedContent}</ReactMarkdown>
        </div>
      </div>

      {/* Modal for Style Selection with Filtering Options */}
      {showStyleModal && (
        <Modal
          onClose={() => setShowStyleModal(false)}
          customClass="max-w-8xl"
          marginClass="my-8"
        >
          <div className="p-6 text-sm">
            <h2 className="sm:text-2xl text-sm text-gray-700 font-bold mb-4">
              Choose a Rephrase Style
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterType("all")}
                  className={`btn ${filterType === "all" && "active-filter"}`}
                >
                  All Prompt
                </button>
                <button
                  onClick={() => setFilterType("my")}
                  className={`btn ${filterType === "my" && "active-filter"}`}
                >
                  My Prompt
                </button>
                <button
                  onClick={() => setFilterType("favorites")}
                  className={`btn ${
                    filterType === "favorites" && "active-filter"
                  }`}
                >
                  Favorites
                </button>
              </div>
              <div>
                <select
                  value={selectedNiche}
                  onChange={handleNicheFilterChange}
                  className="select"
                >
                  {uniqueNiches.map((niche, index) => (
                    <option key={index} value={niche}>
                      {niche === "all" ? "All Niches" : niche}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {rephraseLoading ? (
              <div className="flex justify-center items-center h-24">
                <FaSpinner className="animate-spin text-4xl text-green-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  key="none"
                  className="border p-4 rounded-lg bg-indigo-200 hover:shadow-lg cursor-pointer"
                  onClick={() => handleSelectPrompt(defaultPrompt)}
                >
                  <h3 className="text-lg font-bold mb-2">
                    {defaultPrompt.style}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Rephrase script without any prompt style.
                  </p>
                </div>
                {filteredPrompts.length > 0 ? (
                  filteredPrompts.map((prompt) => (
                    <div
                      key={prompt._id}
                      className="border p-4 rounded-lg bg-white hover:shadow-lg cursor-pointer"
                      onClick={() => handleSelectPrompt(prompt)}
                    >
                      <h3 className="text-lg font-bold mb-2">{prompt.style}</h3>
                      <p className="text-sm text-gray-600">
                        {prompt.promptTemplate.substring(0, 100)}...
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">
                    No prompt templates found matching the selected criteria.
                  </p>
                )}
              </div>
            )}
            <div className="flex justify-end gap-4 mt-4">
              <button onClick={() => setShowStyleModal(false)} className="btn">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                placeholder="Script Title"
              />
            </div>
            <div className="mb-4">
              <textarea
                value={previewContent}
                onChange={(e) => setPreviewContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none h-48"
                placeholder="Script Content"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button onClick={cancelRephrasedScript} className="btn">
                Cancel
              </button>
              <button
                onClick={acceptRephrasedScript}
                className="btn active-filter"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                placeholder="Script Title"
              />
            </div>
            <div className="mb-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none h-60 sm:h-96"
                placeholder="Script Content"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowEditModal(false)} className="btn">
                Cancel
              </button>
              <button onClick={handleAcceptEdit} className="btn active-filter">
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
