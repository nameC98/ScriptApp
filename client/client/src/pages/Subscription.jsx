import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { FaCheck } from "react-icons/fa";

// Load Stripe with your Publishable Key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const userId2 = localStorage.getItem("userId") || "";

export default function Subscription() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle Subscribe / Checkout with Stripe
  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "http://localhost:5000/api/subscription/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userId2 }),
        }
      );

      const data = await response.json();
      // If there's an error from the server, display it
      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
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
      console.error("Subscription error:", err);
      setError(err.message || "An error occurred during subscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[90vh] nav text-[13px] bg-gray-100 flex items-center justify-center p-6">
      {/* Outer container to center the card */}
      <div className="relative w-80 bg-gray-900 text-white rounded-xl shadow-2xl py-[6rem] px-6">
        {/* Corner circles */}
        <div className="absolute top-0 left-0 m-3 w-2 h-2 border border-gray-700 rounded-full"></div>
        <div className="absolute top-0 right-0 m-3 w-2 h-2 border border-gray-700 rounded-full"></div>
        <div className="absolute bottom-0 left-0 m-3 w-2 h-2 border border-gray-700 rounded-full"></div>
        <div className="absolute bottom-0 right-0 m-3 w-2 h-2 border border-gray-700 rounded-full"></div>

        {/* PRO badge */}
        <span className="absolute top-4 right-4 bg-yellow-600 text-xs font-bold px-2 py-1 rounded-full uppercase">
          Pro
        </span>

        {/* Plan Name */}
        <h2 className="text-xl font-bold mb-2">Unlimited Plan</h2>

        {/* Price */}
        <p className="text-3xl font-extrabold mb-1">
          $10.00
          <span className="text-lg font-normal"> /month</span>
        </p>

        {/* Error Message */}
        {error && (
          <p className="text-red-400 text-sm my-2 border border-red-400 p-2 rounded">
            {error}
          </p>
        )}

        {/* Upgrade/Subscribe Button */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full mt-4 bg-white nav  font-bold text-gray-900  py-2 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {loading ? "Processing..." : "Upgrade Plan"}
        </button>

        {/* Features */}
        <ul className="mt-6 space-y-3 text-sm">
          <li className="flex items-start">
            <FaCheck className="text-green-400 nav  mr-2 mt-1" />
            Unlimited script downloads
          </li>
          <li className="flex items-start">
            <FaCheck className="text-green-400 nav  mr-2 mt-1" />
            100 tokens monthly for generating & rephrasing
          </li>
          <li className="flex items-start">
            <FaCheck className="text-green-400 nav  mr-2 mt-1" />
            No hidden fees
          </li>
          <li className="flex items-start">
            <FaCheck className="text-green-400  nav  mr-2 mt-1" />
            Cancel anytime
          </li>
        </ul>
      </div>
    </div>
  );
}
