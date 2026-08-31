// src/components/Header.jsx
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // remove auth flag so next open requires password again
    sessionStorage.removeItem("isAuthenticated");
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-16 bg-gray-900 text-gray-200 shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <img src={logo} alt="App Logo" className="h-10 w-auto" />
      </div>

      <div className="flex items-center gap-3">
        {/* optional place for other header items */}

        <button
          onClick={handleLogout}
          className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm transition"
          title="Logout"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
