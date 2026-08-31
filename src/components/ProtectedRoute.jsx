// src/components/ProtectedRoute.jsx
import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";

const isAuthenticated = () => {
  // read from sessionStorage so session ends when tab/window is closed
  return sessionStorage.getItem("isAuthenticated") === "true";
};

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  if (isAuthenticated()) {
    return children ?? null;
  }
  return (
    <Navigate
      to={`/login?redirectTo=${encodeURIComponent(location.pathname)}`}
      replace
    />
  );
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
