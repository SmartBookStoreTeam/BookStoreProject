import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, token } = useAuth();

  if (!token) return <Navigate to="/login" />; 
  if (user.role !== "admin") return <Navigate to="/" />; 

  return children;
};

export default ProtectedRoute;
