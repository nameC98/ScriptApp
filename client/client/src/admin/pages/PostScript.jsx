import { useState } from "react";

function PostScript() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [niche, setNiche] = useState("");
  const [style, setStyle] = useState("");
  const [snippet, setSnippet] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Assuming admin userId is stored in localStorage (or fetched from context)
  const userId = localStorage.getItem("userId");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    if (!title || !content || !niche || !style) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/admin-sripts",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            title,
            content,
            niche,
            snippet,
            style,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to post script");
      }
      setSuccess("Script posted successfully!");
      // Clear the form fields
      setTitle("");
      setContent("");
      setNiche("");
      setSnippet("");
      setStyle("");
      setError("");
      // Optionally redirect or refresh list
      // navigate("/admin/scripts");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-center py-12">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-3xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Post New Script</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {success && (
          <p className="text-green-500 mb-4 text-center">{success}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            {/* Title Field */}
            <div>
              <label className="block text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter script title"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            {/* Content Field */}
            <div>
              <label className="block text-gray-700">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter full script content"
                rows="6"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:border-blue-300"
              ></textarea>
            </div>
            {/* Niche Field */}
            <div>
              <label className="block text-gray-700">
                Niche <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="Enter niche (e.g., tech, lifestyle)"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            {/* Style Field */}
            <div>
              <label className="block text-gray-700">
                Style <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="Enter style (e.g., informative, casual)"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            {/* Snippet Field (optional) */}
            <div>
              <label className="block text-gray-700">Snippet (optional)</label>
              <input
                type="text"
                value={snippet}
                onChange={(e) => setSnippet(e.target.value)}
                placeholder="Enter a short snippet/summary"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              >
                Post Script
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostScript;
