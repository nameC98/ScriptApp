import { useState } from "react";
import { forgotPassword } from "../services/authService";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await forgotPassword({ email });
      setMessage(data.message);
      setResetToken(data.resetToken);
    } catch (err) {
      setError(err.message || "Failed to send reset link");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && (
          <p className="text-green-500 text-center mb-4">{message}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition duration-200"
          >
            Send Reset Link
          </button>
        </form>
        {resetToken && (
          <div className="mt-4 p-4 border rounded">
            <p className="text-sm text-gray-600 mb-2">
              For development, click the link below to reset your password:
            </p>
            <Link
              to={`/reset-password?token=${encodeURIComponent(resetToken)}`}
              className="text-blue-500 hover:underline break-all"
            >
              Reset Password Link
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
