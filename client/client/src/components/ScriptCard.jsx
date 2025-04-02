import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

// Mapping niche names (in lowercase) to image paths in the public folder.
const nicheImages = {
  "self improvement": "/images/self-improvement.jpg",
  tech: "/images/tech.jpg",
  gaming: "/images/gaming.jpg",
  travel: "/images/travel.jpg",
  finance: "/images/finance.jpg",
  lifestyle: "/images/lifestyle.jpg",
  default: "/images/default.jpg",
};

// Star component renders a star with a lightgray background and a gradient-filled portion.
const Star = ({ fill, id }) => (
  <svg viewBox="0 0 20 20" className="w-4 h-4">
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="gold" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
      <clipPath id={`${id}-clip`}>
        <rect x="0" y="0" width={`${fill * 20}`} height="20" />
      </clipPath>
    </defs>
    <path
      d="M10 15l-5.878 3.09L5.64 12.545 1 8.454l6.061-.882L10 2l2.939 5.572L19 8.454l-4.64 4.091 1.518 5.545z"
      fill="lightgray"
    />
    <path
      d="M10 15l-5.878 3.09L5.64 12.545 1 8.454l6.061-.882L10 2l2.939 5.572L19 8.454l-4.64 4.091 1.518 5.545z"
      fill={`url(#${id})`}
      clipPath={`url(#${id}-clip)`}
    />
  </svg>
);
Star.propTypes = {
  fill: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired,
};
// StarRating component: renders 5 stars with unique gradient IDs.
const StarRating = ({ rating, idPrefix }) => {
  if (rating === undefined || rating === null) return null;

  const stars = [];
  for (let i = 0; i < 5; i++) {
    const fill = Math.min(1, Math.max(0, rating - i));
    stars.push(<Star key={i} fill={fill} id={`${idPrefix}-star-${i}`} />);
  }
  return <div className="flex">{stars}</div>;
};

StarRating.propTypes = {
  rating: PropTypes.number,
  idPrefix: PropTypes.string.isRequired,
};

function ScriptCard({ script }) {
  const navigate = useNavigate();

  const nicheKey = script.niche.toLowerCase();
  const imageSrc = nicheImages[nicheKey] || nicheImages.default;

  const formattedDate = new Date(script.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleCardClick = () => {
    navigate(`/scripts/${script._id}`);
  };

  const handleAction = (e) => {
    e.stopPropagation();
    if (script.status.toLowerCase() === "used") {
      navigate(`/scripts/${script._id}/rephrase`);
    } else {
      navigate(`/scripts/${script._id}/get`);
    }
  };
  // Do not default rating to 5 – if there's no rating, hide the stars.
  const ratingValue = script.rating;
  return (
    <div
      className="bg-white border-2 rounded-lg overflow-hidden shadow-lg cursor-pointer flex flex-col h-full"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={imageSrc}
          alt={script.niche}
          className="w-full h-40 object-cover"
        />
        {/* Top overlay: niche badge and status badge */}
        <div className="absolute top-2 left-0 w-full px-2 flex justify-between items-center">
          <div className="flex gap-2">
            <span className="bg-white bg-opacity-80 text-xs font-semibold px-2 py-1 rounded shadow">
              {script.niche}
            </span>
          </div>
          <div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded shadow ${
                script.status.toLowerCase() === "used"
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              {script.status.toLowerCase() === "used" ? "Used" : "Unused"}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4 flex-1">
        <h3 className="text-lg font-bold">{script.title}</h3>
        <p className="mt-2 text-gray-600 text-sm">
          {script.snippet && script.snippet.length > 100
            ? script.snippet.substring(0, 100) + "..."
            : script.snippet}
        </p>
      </div>
      {/* Bottom container placed below content */}
      <div className="p-2 flex justify-between items-center border-t">
        <div className="flex items-center">
          {ratingValue != null && (
            <>
              <StarRating rating={ratingValue} idPrefix={script._id} />
              <span className="ml-2 text-sm font-semibold text-gray-700">
                {ratingValue.toFixed(1)}
              </span>
            </>
          )}
        </div>
        <button
          onClick={handleAction}
          className="flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded"
        >
          <span>
            {script.status.toLowerCase() === "used" ? "Rephrase" : "Get Script"}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

ScriptCard.propTypes = {
  script: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    snippet: PropTypes.string,
    niche: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    rating: PropTypes.number,
    isAdmin: PropTypes.bool,
  }).isRequired,
};

export default ScriptCard;
