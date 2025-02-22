import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { FaBolt } from "react-icons/fa";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function BoostTokens() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Assume you store userId in localStorage
  const userId = localStorage.getItem("userId") || "";

  const handleBoost = async () => {
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-4 flex items-center justify-center gap-2">
          <FaBolt className="text-yellow-500" />
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

        <button
          onClick={handleBoost}
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-md shadow w-full transition-colors"
        >
          {loading ? "Processing..." : "Boost Tokens"}
        </button>
        <p className="text-sm text-gray-500 mt-4">
          *Available only for active subscribers
        </p>
      </div>
    </div>
  );
}
