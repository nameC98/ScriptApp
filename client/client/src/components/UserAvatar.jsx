import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avator from "../assets/man.png";

function UserAvatar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef();

  const handleAvatarClick = () => {
    setOpen((prev) => !prev);
  };

  const handleSignOut = () => {
    // Remove token from localStorage (or any auth storage) and navigate to login
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar image (you can replace the URL with an actual user avatar) */}
      <img
        src={Avator}
        alt="User Avatar"
        className="w-10 h-10 rounded-full cursor-pointer"
        onClick={handleAvatarClick}
      />
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg p-4">
          <button
            onClick={handleSignOut}
            className="w-full text-left text-[#3E54A3] font-semibold"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default UserAvatar;
