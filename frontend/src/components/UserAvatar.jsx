import { useState } from "react";

const UserAvatar = ({ user, size = 96, className = "" }) => {
  const [imgError, setImgError] = useState(false);
  const firstLetter = user?.name?.charAt(0)?.toUpperCase();

  if (user?.avatar && !imgError) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        referrerPolicy="no-referrer"
        className={`rounded-full object-cover border border-indigo-500 dark:border-indigo-400 ${className}`}
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-linear-to-br from-indigo-500 to-purple-600
      text-white flex items-center justify-center font-bold ${className}`}
      style={{ width: size, height: size }}
    >
      {firstLetter}
    </div>
  );
};

export default UserAvatar;
