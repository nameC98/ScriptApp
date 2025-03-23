import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

// Using only gray scale colors for the niche badge (you can adjust as needed)
const nicheColors = {
  tech: "bg-[var(--color-gray-light)] text-[var(--color-gray-dark)]",
  gaming: "bg-[var(--color-gray-light)] text-[var(--color-gray-dark)]",
  travel: "bg-[var(--color-gray-light)] text-[var(--color-gray-dark)]",
  finance: "bg-[var(--color-gray-light)] text-[var(--color-gray-dark)]",
  lifestyle: "bg-[var(--color-gray-light)] text-[var(--color-gray-dark)]",
  default: "bg-[var(--color-gray-light)] text-[var(--color-gray-dark)]",
};

function ScriptCard({ script }) {
  const navigate = useNavigate();

  // Navigate to the details page when the card is clicked
  const handleCardClick = () => {
    navigate(`/scripts/${script._id}`);
  };

  // Prevent card click when clicking the modify or download buttons
  const handleModify = (e) => {
    e.stopPropagation();
    alert("Modification process triggered for script ID: " + script._id);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    window.open(`/api/download-script/${script._id}`, "_blank");
  };

  return (
    <div
      className="card border-2 cursor-pointer flex flex-col justify-between h-full"
      onClick={handleCardClick}
    >
      <div>
        <h3 className="text-bold text-base">{script.title}</h3>
        <p className="mt-2 text-muted text-small">{script.snippet}....</p>
      </div>
      <div className="mt-6 flex justify-between items-center">
        <div className="flex space-x-2">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              nicheColors[script.niche] || nicheColors.default
            }`}
          >
            {script.niche.charAt(0).toUpperCase() + script.niche.slice(1)}
          </span>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              script.status === "used"
                ? "bg-[var(--color-gray-dark)] text-[var(--color-white)]"
                : "bg-[var(--color-gray-light)] text-[var(--color-gray-dark)]"
            }`}
          >
            {script.status === "used" ? "Used" : "Unused"}
          </span>
        </div>
        {/* Uncomment and adjust the following buttons if needed */}
        {/*
        <div className="flex space-x-2">
          <button onClick={handleDownload} className="btn">
            Download
          </button>
          <button onClick={handleModify} className="btn">
            Modify
          </button>
        </div>
        */}
      </div>
    </div>
  );
}

ScriptCard.propTypes = {
  script: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    snippet: PropTypes.string.isRequired,
    niche: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    isAdmin: PropTypes.bool,
  }).isRequired,
};

export default ScriptCard;
