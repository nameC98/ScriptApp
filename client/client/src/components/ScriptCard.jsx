import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const nicheColors = {
  tech: "bg-blue-200 text-blue-800",
  gaming: "bg-purple-200 text-purple-800",
  travel: "bg-yellow-200 text-yellow-800",
  finance: "bg-green-200 text-green-800",
  lifestyle: "bg-pink-200 text-pink-800",
  default: "bg-gray-200 text-gray-800",
};

function ScriptCard({ script }) {
  const navigate = useNavigate();

  // Navigate to the details page when the card is clicked
  const handleCardClick = () => {
    navigate(`/scripts/${script._id}`);
  };

  // Prevent card click when clicking the rephrase button
  const handleModify = (e) => {
    e.stopPropagation();
    alert("Modification process triggered for script ID: " + script._id);
  };

  // Prevent card click when clicking the download button, then trigger download
  const handleDownload = (e) => {
    e.stopPropagation();
    // Replace with your actual download logic or endpoint
    window.open(`/api/download-script/${script._id}`, "_blank");
  };

  return (
    <div
      className="bg-white shadow-lg rounded-lg  p-3 hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between h-full cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Title & Snippet */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 libre-caslon-display-regular">
          {script.title}
        </h3>
        <p className="mt-2 text-gray-600 font-serif ">{script.snippet}....</p>
      </div>

      {/* Footer: Badges on the left, Buttons on the right */}
      <div className="mt-6 flex justify-between items-center">
        <div className="flex space-x-2">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              nicheColors[script.niche] || nicheColors.default
            }`}
          >
            {script.niche.charAt(0).toUpperCase() + script.niche.slice(1)}
          </span>
          {script.isAdmin && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-200 text-indigo-800">
              Admin
            </span>
          )}
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              script.status === "used"
                ? "bg-yellow-200 text-yellow-800"
                : "bg-green-200 text-green-800"
            }`}
          >
            {script.status === "used" ? "Used" : "Unused"}
          </span>
        </div>

        {/* Action Button: Admin scripts only allow Download; non-admin follow normal logic */}
        {script.isAdmin ? (
          <button
            onClick={handleDownload}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold text-[12px] px-4 py-2 font-serif rounded-lg transition duration-200"
          >
            Download
          </button>
        ) : script.status === "used" ? (
          <button
            onClick={handleModify}
            className="bg-[#3E54A3] hover:bg-blue-600 text-white font-semibold text-[12px] font-serif px-4 py-2 rounded-lg transition duration-200"
          >
            Rephrase
          </button>
        ) : (
          <button
            onClick={handleDownload}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold text-[12px] px-4 py-2 font-serif rounded-lg transition duration-200"
          >
            Download
          </button>
        )}
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
    isAdmin: PropTypes.bool, // indicates if this script was posted by an admin
  }).isRequired,
};

export default ScriptCard;
