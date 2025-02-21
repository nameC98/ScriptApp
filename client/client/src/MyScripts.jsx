import { useState, useEffect } from "react";
import ScriptCard from "./components/ScriptCard";

function MyScripts() {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Retrieve the logged-in user's ID from localStorage
  const userId = localStorage.getItem("userId");

  console.log(userId);

  useEffect(() => {
    const fetchMyScripts = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/scripts/my-scripts/${userId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch your scripts");
        }
        const data = await response.json();
        setScripts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchMyScripts();
    } else {
      setError("User ID not found. Please log in.");
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Scripts</h1>
      {scripts.length === 0 ? (
        <p>You havent created any scripts yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {scripts.map((script) => (
            <ScriptCard key={script._id} script={script} />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyScripts;
