import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { FaCheck } from "react-icons/fa";

// Load Stripe with your Publishable Key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const userId2 = localStorage.getItem("userId") || "";

export default function Subscription() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <div className="mt-10 bg-[#EEF5FF] flex items-center   justify-center p-6">
      <div className="flex flex-col md:flex-row items-center border-[2px] bg-white rounded-xl l max-w-5xl w-full p-8 space-y-6 md:space-y-0 md:space-x-12">
        {/* Subscription Plan Card */}
        <div className="relative w-full md:w-1/2 bg-gray-900 text-white rounded-xl shadow-2xl py-12 px-8">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 m-3 w-2 h-2 border border-gray-700 rounded-full"></div>
          <div className="absolute top-0 right-0 m-3 w-2 h-2 border border-gray-700 rounded-full"></div>
          <div className="absolute bottom-0 left-0 m-3 w-2 h-2 border border-gray-700 rounded-full"></div>
          <div className="absolute bottom-0 right-0 m-3 w-2 h-2 border border-gray-700 rounded-full"></div>

          {/* Plan Badge */}
          <span className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-xs font-bold px-2 py-1 rounded-full uppercase">
            Pro
          </span>

          <h2 className="text-2xl font-bold mb-3">Unlimited Plan</h2>
          <p className="text-4xl font-extrabold mb-3">
            $10.00<span className="text-lg font-normal"> /month</span>
          </p>

          {error && (
            <p className="text-red-400 text-sm my-2 border border-red-400 p-2 rounded">
              {error}
            </p>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full mt-4 bg-white text-black font-bold py-3 rounded-md transition-colors hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Upgrade Plan"}
          </button>
        </div>

        {/* Feature List */}
        <div className="w-full md:w-1/2">
          <ul className="space-y-4 text-sm text-gray-700">
            <li className="flex items-start">
              <FaCheck className="text-green-500 mr-2 mt-1" />
              Unlimited script downloads
            </li>
            <li className="flex items-start">
              <FaCheck className="text-green-500 mr-2 mt-1" />
              100 tokens monthly for generating &amp; rephrasing
            </li>
            <li className="flex items-start">
              <FaCheck className="text-green-500 mr-2 mt-1" />
              No hidden fees
            </li>
            <li className="flex items-start">
              <FaCheck className="text-green-500 mr-2 mt-1" />
              Cancel anytime
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
