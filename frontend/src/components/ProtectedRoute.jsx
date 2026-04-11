import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute — blocks unauthenticated users.
 * Pass allowedRoles to restrict further (defaults to admin only).
 * Usage:
 *   <ProtectedRoute>              → admin only  (legacy behaviour)
 *   <ProtectedRoute roles={["admin","author"]}>  → both
 */
const ProtectedRoute = ({ children, roles = ["admin"] }) => {
  const { user, token } = useAuth();
  const location = useLocation();

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
