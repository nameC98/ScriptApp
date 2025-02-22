function SubscriptionCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-100 p-6">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Subscription Canceled</h2>
        <p>
          Your subscription process was canceled. Please try again if needed.
        </p>
      </div>
    </div>
  );
}

export default SubscriptionCancel;
