import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { FaBolt } from "react-icons/fa";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function BoostTokens() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userTokens, setUserTokens] = useState(0);

  const userId = localStorage.getItem("userId") || "";

  useEffect(() => {
    const fetchUserTokens = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/scripts/user/${userId}`
        );
        const data = await response.json();
        setUserTokens(data.tokens || 0);
      } catch (err) {
        console.error("Failed to fetch user tokens:", err);
      }
    };
    fetchUserTokens();
  }, [userId]);

  const handleBoost = async () => {
    if (userTokens >= 5) return;
    setError("");
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/subscription/boost-tokens",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create token boost session");
      }

      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        console.error("Stripe checkout error:", stripeError);
        setError("Failed to redirect to checkout.");
      }
    } catch (err) {
      console.error("Boost tokens error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[90vh] nav bg-[#EEF5FF] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl border-2 border-gray-200 p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 flex items-center justify-center text-gray-600 gap-2">
          <FaBolt className="text-gray-600 " />
          Boost Your Tokens
        </h1>
        <p className="text-gray-600 mb-6">
          Need more tokens before your monthly cycle renews? Boost your tokens
          instantly!
        </p>

        {error && (
          <div className="text-red-500 border border-red-300 rounded p-2 mb-4">
            {error}
          </div>
        )}

        {userTokens >= 5 ? (
          <p className="text-green-600 font-semibold mb-4">
            You have sufficient tokens ({userTokens}). Boosting is unavailable.
          </p>
        ) : (
          <button
            onClick={handleBoost}
            disabled={loading}
            className="gradient-button hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-md shadow w-full transition-colors"
          >
            {loading ? "Processing..." : "Boost Tokens"}
          </button>
        )}

        <p className="text-sm text-gray-500 mt-4">
          *Available only for active subscribers
        </p>
      </div>
    </div>
  );
}
