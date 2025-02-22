import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Optionally, call your backend to verify the session or update subscription status.
    console.log("Session ID:", sessionId);
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100 p-6">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Subscription Successful!</h2>
        <p>Your subscription has been activated.</p>
        {sessionId && (
          <p className="mt-4 text-sm text-gray-600">Session ID: {sessionId}</p>
        )}
      </div>
    </div>
  );
}

export default SubscriptionSuccess;
