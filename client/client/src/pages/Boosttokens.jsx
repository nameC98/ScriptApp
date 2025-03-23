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
    <div className=" flex   mt-10 items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-xl border border-gray-200 p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left Side: Text Information */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <h1 className="text-3xl font-bold flex items-center justify-center md:justify-start text-gray-700 gap-2">
              <FaBolt className="text-gray-600" />
              Boost Your Tokens
            </h1>
            <p className="text-gray-600">
              Need more tokens before your monthly cycle renews? Boost your
              tokens instantly!
            </p>
            {error && (
              <div className="text-red-500 border border-red-300 rounded p-2">
                {error}
              </div>
            )}
          </div>

          {/* Right Side: Boost Button */}
          <div className="flex-1 flex flex-col items-center gap-4">
            {userTokens >= 5 ? (
              <p className="text-green-600 font-semibold">
                You have sufficient tokens ({userTokens}). Boosting is
                unavailable.
              </p>
            ) : (
              <button
                onClick={handleBoost}
                disabled={loading}
                className="w-full md:w-auto bg-[#4A4A4A] text-white font-semibold py-3 px-8 rounded-md shadow transition-colors"
              >
                {loading ? "Processing..." : "Boost Tokens"}
              </button>
            )}
            <p className="text-sm text-gray-500">
              *Available only for active subscribers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
