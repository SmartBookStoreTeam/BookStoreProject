import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading height="h-screen" />;
  }

  // If user is already logged in, redirect them to the home page
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;
