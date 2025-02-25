import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function PromptCard({ prompt, onBookmarkToggle }) {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  // Initialize local state based on whether the prompt is bookmarked by this user
  const [isBookmarked, setIsBookmarked] = useState(
    prompt.favoriteUsers && prompt.favoriteUsers.includes(userId)
  );

  // When the prompt's favoriteUsers prop changes externally, update local state
  useEffect(() => {
    setIsBookmarked(
      prompt.favoriteUsers && prompt.favoriteUsers.includes(userId)
    );
  }, [prompt.favoriteUsers, userId]);

  const truncateText = (text, length = 100) =>
    text.length > length ? text.substring(0, length) + "..." : text;

  const handleBookmark = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/scripts/prompts/${prompt._id}/bookmark`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );
      const data = await response.json();
      console.log("Bookmark toggled:", data);

      // Determine the new bookmark state from the response
      const newBookmarkState =
        data.prompt.favoriteUsers && data.prompt.favoriteUsers.includes(userId);
      setIsBookmarked(newBookmarkState);

      // If a callback was provided (e.g., when on the Favorites page),
      // notify the parent. For example, if unbookmarked, the parent can remove this prompt.
      if (onBookmarkToggle) {
        onBookmarkToggle(prompt._id, newBookmarkState);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  return (
    <div className="rounded-lg shadow-md p-4 flex flex-col h-full bg-white">
      {prompt.is_admin && prompt.image && (
        <img
          src={prompt.image}
          alt={prompt.title || "Prompt"}
          className="w-full h-32 object-cover rounded-md mb-3"
        />
      )}
      <div className="flex-1">
        <h2 className="text-xl font-bold mb-1">
          {prompt.title || prompt.style || "Prompt"}
        </h2>
        <p className="text-sm text-gray-600 mb-2">
          {prompt.niche} &bull; {prompt.style}
        </p>
        <p className="text-sm text-gray-500">
          {truncateText(prompt.promptTemplate)}
        </p>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => navigate(`/prompts/${prompt._id}`)}
          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
        >
          View
        </button>
        <button
          onClick={handleBookmark}
          className={`py-1 px-3 rounded text-sm border border-blue-500 ${
            isBookmarked
              ? "bg-blue-500 text-white"
              : "text-blue-500 hover:bg-blue-500 hover:text-white"
          }`}
        >
          Bookmark
        </button>
      </div>
    </div>
  );
}

PromptCard.propTypes = {
  prompt: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string,
    style: PropTypes.string,
    niche: PropTypes.string,
    promptTemplate: PropTypes.string.isRequired,
    is_admin: PropTypes.bool,
    image: PropTypes.string,
    favoriteUsers: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  // Optional callback that lets the parent know when a bookmark is toggled.
  // For example, the Favorites view can remove a prompt if it's unbookmarked.
  onBookmarkToggle: PropTypes.func,
};

export default PromptCard;
