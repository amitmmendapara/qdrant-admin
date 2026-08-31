// src/pages/LoginPage.jsx
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

import logo from "../assets/qdrant-login-logo.svg";

const STATIC_PASSWORD = "_HmcJh+O^l@h"; // <-- your static password

const LoginPage = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // read redirect path from query param, default to "/"
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirectTo") || "/";

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // static password check
    if (password === STATIC_PASSWORD) {
      // use sessionStorage so the auth is removed when the tab/window is closed
      sessionStorage.setItem("isAuthenticated", "true");
      toast.success("Login successful");
      navigate(redirectTo, { replace: true });
    } else {
      toast.error("Incorrect password");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-200 p-4">
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
            zIndex: 9999,
          },
        }}
      />
      <div className="flex flex-1 flex-col items-center justify-center w-full max-w-md ">
        <div className="text-center">
          <img src={logo} alt="Logo" className="w-36 mb-6 mx-auto" />
        </div>
        <div className=" bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-semibold mb-4 text-center">
            Enter Password
          </h1>

          <form onSubmit={handleSubmit}>
            <label className="block mb-2 text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full border px-3 py-2 rounded mb-4 focus:outline-none"
              autoFocus
              required
            />

            <button
              type="submit"
              className="w-full py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
              disabled={loading}
            >
              {loading ? "Checking..." : "Open"}
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Your session is stored in <code>sessionStorage</code> and will be
            cleared when you close this tab or window. You’ll need to re-enter
            your password next time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
