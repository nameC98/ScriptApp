import { useState, useEffect } from "react";

function Subscription() {
  const [subscription, setSubscription] = useState(null);
  const [tokens, setTokens] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/subscription");
      const data = await response.json();
      setSubscription(data.subscription);
      setTokens(data.tokens);
    } catch {
      setError("Failed to fetch subscription details.");
    }
  };

  const handleTokenPurchase = async () => {
    try {
      const response = await fetch("/api/purchase-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Optionally send info on how many tokens to purchase.
        body: JSON.stringify({ purchaseAmount: 10 }), // e.g., $1 = 10 tokens
      });
      const data = await response.json();
      setTokens(data.tokens);
    } catch {
      setError("Failed to purchase tokens.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Subscription Details
        </h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {subscription ? (
          <div className="space-y-4">
            <p>
              <span className="font-semibold">Plan:</span> {subscription.plan}
            </p>
            <p>
              <span className="font-semibold">Monthly Tokens:</span> {tokens}
            </p>
            <button
              onClick={handleTokenPurchase}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition duration-200"
            >
              Purchase Additional Tokens
            </button>
          </div>
        ) : (
          <p className="text-center">Loading subscription details...</p>
        )}
      </div>
    </div>
  );
}

export default Subscription;
