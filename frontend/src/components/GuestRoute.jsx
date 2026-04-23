import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading height="h-screen" />;
  }

  if (user) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "author") return <Navigate to="/author-dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;
