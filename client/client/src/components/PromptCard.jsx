import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

function PromptCard({ prompt, onBookmarkToggle }) {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  // Local state to track whether this prompt is bookmarked by the user
  const [isBookmarked, setIsBookmarked] = useState(
    prompt.favoriteUsers && prompt.favoriteUsers.includes(userId)
  );

  // Update local state when prompt.favoriteUsers changes externally.
  useEffect(() => {
    setIsBookmarked(
      prompt.favoriteUsers && prompt.favoriteUsers.includes(userId)
    );
  }, [prompt.favoriteUsers, userId]);

  const truncateText = (text, length = 100) =>
    text.length > length ? text.substring(0, length) + "..." : text;

  const handleBookmark = async () => {
    // Optimistic update: toggle bookmark state immediately.
    const optimisticNewState = !isBookmarked;
    setIsBookmarked(optimisticNewState);

    // Create an optimistic copy of the prompt with updated favoriteUsers.
    const optimisticFavoriteUsers = optimisticNewState
      ? [...(prompt.favoriteUsers || []), userId]
      : (prompt.favoriteUsers || []).filter((u) => u !== userId);
    const optimisticPrompt = {
      ...prompt,
      favoriteUsers: optimisticFavoriteUsers,
    };
    // Inform the parent immediately so the change appears in filtered lists.
    if (onBookmarkToggle) {
      onBookmarkToggle(optimisticPrompt);
    }
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
      // Use the updated prompt from the API response.
      const updatedPrompt = data.prompt;
      const newBookmarkState =
        updatedPrompt.favoriteUsers &&
        updatedPrompt.favoriteUsers.includes(userId);
      setIsBookmarked(newBookmarkState);
      // Update parent state with the confirmed prompt data.
      if (onBookmarkToggle) {
        onBookmarkToggle(updatedPrompt);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      setIsBookmarked(!optimisticNewState);
      if (onBookmarkToggle) {
        onBookmarkToggle(prompt);
      }
    }
  };

  return (
    <div className="card border-2 h-full flex flex-col p-4">
      {prompt.is_admin && prompt.image && (
        <img
          src={prompt.image}
          alt={prompt.title || "Prompt"}
          className="w-full h-32 object-cover rounded-md mb-3"
        />
      )}
      <div className="flex-1">
        <h2 className="text-xl font-bold mb-1">{prompt.title || "Prompt"}</h2>
        <p className="text-sm font-bold text-[var(--color-gray-dark)] mb-2">
          {prompt.niche}
        </p>
        <p className="text-sm text-[var(--color-gray-dark)]">
          <ReactMarkdown>{truncateText(prompt.promptTemplate)}</ReactMarkdown>
        </p>
      </div>
      <div className="flex justify-between items-center mt-4">
        {/* View Button */}
        <button
          onClick={() => navigate(`/prompts/${prompt._id}`)}
          className="btn"
        >
          View
        </button>
        {/*Bookmark Button*/}
        <button
          onClick={handleBookmark}
          className={`btn ${isBookmarked && "active-filter"}`}
        >
          {isBookmarked ? "Bookmarked" : "Bookmark"}
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
  onBookmarkToggle: PropTypes.func,
};

export default PromptCard;
