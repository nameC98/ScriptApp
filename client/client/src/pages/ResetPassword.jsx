import { useState } from "react";
import { resetPassword } from "../services/authService";
import { useNavigate, useSearchParams } from "react-router-dom";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromURL = searchParams.get("token") || "";
  const [token, setToken] = useState(tokenFromURL);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Optionally, if token exists in URL, you might hide the token input:
  const tokenInputVisible = !tokenFromURL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await resetPassword({ token, newPassword });
      setMessage(data.message);
      // Optionally navigate to login after a delay:
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && (
          <p className="text-green-500 text-center mb-4">{message}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tokenInputVisible && (
            <input
              type="text"
              name="token"
              placeholder="Enter your reset token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          )}
          <input
            type="password"
            name="newPassword"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition duration-200"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
