// src/admin/AdminPrompts.js
import { useState, useEffect } from "react";

const BASE_URL = "http://localhost:5000/api/scripts";

function AdminPrompts() {
  const [prompts, setPrompts] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    niche: "",
    style: "",
    promptTemplate: "",
  });
  const [loading, setLoading] = useState(false);

  // Filter states
  const [filterNiche, setFilterNiche] = useState("");
  const [filterStyle, setFilterStyle] = useState("");

  // Fetch all prompt templates from the server
  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/scripts/prompts`);
      const data = await res.json();
      setPrompts(data);
    } catch (error) {
      console.error("Error fetching prompts:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log("Prompts:", prompts);

  useEffect(() => {
    fetchPrompts();
  }, []);

  // Handle input changes for the prompt form
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission: create new or update existing prompt
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id, niche, style, promptTemplate } = formData;
    if (!niche || !style || !promptTemplate) {
      alert("Please fill in all fields.");
      return;
    }
    console.log("Submitting prompt:", formData);
    try {
      let res;
      if (id) {
        res = await fetch(`${BASE_URL}/prompt/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ niche, style, promptTemplate }),
        });
      } else {
        res = await fetch(`http://localhost:5000/api/admin/prompt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ niche, style, promptTemplate }),
        });
      }
      const result = await res.json();
      console.log("Server response:", result);
      if (res.ok) {
        alert(result.message);
        setFormData({ id: null, niche: "", style: "", promptTemplate: "" });
        fetchPrompts();
      } else {
        alert(result.error || "Error saving prompt.");
      }
    } catch (error) {
      console.error("Error submitting prompt:", error);
      alert("Error submitting prompt.");
    }
  };

  // Populate the form for editing
  const handleEdit = (prompt) => {
    setFormData({
      id: prompt._id,
      niche: prompt.niche,
      style: prompt.style,
      promptTemplate: prompt.promptTemplate,
    });
  };

  // Delete a prompt template
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prompt?")) return;
    try {
      const res = await fetch(`${BASE_URL}/prompt/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (res.ok) {
        alert(result.message);
        fetchPrompts();
      } else {
        alert(result.error || "Error deleting prompt.");
      }
    } catch (error) {
      console.error("Error deleting prompt:", error);
      alert("Error deleting prompt.");
    }
  };

  // Cancel editing and reset the form
  const handleCancelEdit = () => {
    setFormData({ id: null, niche: "", style: "", promptTemplate: "" });
  };

  // Filter prompts based on niche and style AND only those with admin flag true
  const filteredPrompts = prompts.filter((prompt) => {
    // Only include admin prompts
    if (!prompt.is_admin) return false;
    const matchesNiche = prompt.niche
      .trim()
      .toLowerCase()
      .includes(filterNiche.trim().toLowerCase());
    const matchesStyle = prompt.style
      .trim()
      .toLowerCase()
      .includes(filterStyle.trim().toLowerCase());
    return matchesNiche && matchesStyle;
  });

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-3xl font-bold mb-6">Prompt Management</h1>
      {/* Filter Section */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-2">Filter by Niche</label>
          <input
            type="text"
            value={filterNiche}
            onChange={(e) => setFilterNiche(e.target.value)}
            placeholder="Enter niche..."
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Filter by Style</label>
          <input
            type="text"
            value={filterStyle}
            onChange={(e) => setFilterStyle(e.target.value)}
            placeholder="Enter style..."
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">
            {formData.id
              ? "Edit Prompt Template"
              : "Create New Prompt Template"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Niche</label>
              <input
                type="text"
                name="niche"
                value={formData.niche}
                onChange={handleInputChange}
                placeholder="Enter niche"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Style</label>
              <input
                type="text"
                name="style"
                value={formData.style}
                onChange={handleInputChange}
                placeholder="Enter style"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Prompt Template
              </label>
              <textarea
                name="promptTemplate"
                value={formData.promptTemplate}
                onChange={handleInputChange}
                placeholder="Enter prompt template"
                rows="4"
                className="w-full border border-gray-300 rounded px-3 py-2"
              ></textarea>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                {formData.id ? "Update Prompt" : "Create Prompt"}
              </button>
              {formData.id && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        {/* List Section */}
        <div className="bg-white shadow rounded-lg p-6 overflow-x-auto">
          <h2 className="text-2xl font-semibold mb-4">
            Existing Prompt Templates
          </h2>
          {loading ? (
            <p>Loading prompts...</p>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2">Niche</th>
                  <th className="px-4 py-2">Style</th>
                  <th className="px-4 py-2">Template</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrompts.map((prompt) => (
                  <tr key={prompt._id} className="border-b">
                    <td className="px-4 py-2">{prompt.niche}</td>
                    <td className="px-4 py-2">{prompt.style}</td>
                    <td className="px-4 py-2">
                      {prompt.promptTemplate.length > 50
                        ? prompt.promptTemplate.substring(0, 50) + "..."
                        : prompt.promptTemplate}
                    </td>
                    <td className="px-4 py-2 flex space-x-2">
                      <button
                        onClick={() => handleEdit(prompt)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(prompt._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPrompts.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-2 text-center">
                      No prompt templates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPrompts;
