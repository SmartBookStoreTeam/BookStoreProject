import { Link, useNavigate } from "react-router-dom";
import { useNavigation } from "../context/NavigationContext";

const SafeLink = ({ to, onClick, children, ...props }) => {
  const { requestNavigation } = useNavigation();
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();

    // Call original onClick if provided
    if (onClick) {
      onClick(e);
    }

    // Check if navigation is allowed
    const allowed = requestNavigation(to);
    if (allowed) {
      navigate(to);
    }
  };

  return (
    <Link to={to} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
};

export default SafeLink;
