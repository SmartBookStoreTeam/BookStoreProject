import "../css/loading.css";
import { useTranslation } from "react-i18next";
const pages = [1, 2, 3, 4, 5];
const Loading = ({
  loading,
  error,
  height,
  animate,
  status = "loading",
  transparent = false,
}) => {
  const { i18n } = useTranslation();
  const ltr = i18n.dir() === "ltr";
  return (
    <div
      className={`${height} flex flex-col items-center justify-center ${
        transparent ? "bg-transparent" : "bg-gray-50 dark:bg-zinc-900"
      }`}
    >
      {/* Loader */}
      <div className="text-center mb-4">
        <div className="relative inline-block">
          <div
            className={`loader mx-auto 
    ${!animate ? "no-animation" : ""}
    ${status === "error" ? "loader-error no-animation" : ""}
  `}
          >
            <div>
              <ul>
                {pages.map((_, index) => (
                  <li key={index}>
                    <svg fill="currentColor" viewBox="0 0 90 120">
                      <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                    </svg>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Overlay */}
          {status === "error" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="select-none translate-y-0">
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="32" cy="32" r="30" fill="transparent" />
                  <circle cx="22" cy="24" r="4" fill="black" />
                  <circle cx="42" cy="24" r="4" fill="black" />
                  <path
                    d="M20 44 C28 36, 36 36, 44 44"
                    stroke="black"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Texts */}
      <div className="flex flex-col items-center gap-1">
        <p
          style={{
            background:
              "linear-gradient(90deg, #9ca3af 0%, #ffffff 50%, #9ca3af 100%)",
            backgroundSize: "200% auto",
            color: "transparent",
            direction: i18n.dir(),
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            animation: animate
              ? `textShimmer 1.5s linear infinite ${ltr ? "reverse" : ""}`
              : "none",
            display: "inline-block",
          }}
          className="text-gray-600 dark:text-gray-200 text-lg font-medium"
        >
          {loading}
        </p>

        <style>
          {`
    @keyframes textShimmer {
      0% { background-position: 0% center; }
      100% { background-position: 200% center; }
    }
  `}
        </style>

        {status === "error" && (
          <p className="text-lg font-medium text-red-500" dir={i18n.dir()}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
export default Loading;
