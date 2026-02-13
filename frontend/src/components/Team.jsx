import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function Team() {
  const { t, i18n } = useTranslation();

  const teamMembers = [
    {
      name: "Ibrahim Reda",
      github: "ibredahim",
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Samy Elsayed",
      github: "SamyElsayed00",
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Ziad Fawzy",
      github: "zmFAWZI",
      color: "from-orange-500 to-red-500",
    },
    {
      name: "Ziad Hany",
      github: "ZiadHany99259",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="mt-16 pt-8 border-t border-gray-200 dark:border-zinc-700">
      {/* Header */}
      <h2
        dir={i18n.dir()}
        className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-4"
      >
        {t("Our Team")}
      </h2>

      {/* Subtitle */}
      <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
        {i18n.language === "ar"
          ? "فريق من المطورين الشغوفين بإنشاء تجارب رقمية استثنائية"
          : "A passionate team of developers creating exceptional digital experiences"}
      </p>

      {/* Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {teamMembers.map((member, index) => {
          const TeamCard = () => {
            const [imageError, setImageError] = useState(false);

            return (
              <a
                href={`https://github.com/${member.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div
                  key={index}
                  className="group bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-zinc-700 overflow-hidden relative cursor-pointer"
                >
                  {/* Gradient background on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  ></div>

                  <div className="relative z-10 text-center">
                    {/* Avatar with GitHub profile image or fallback */}
                    <div
                      className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${member.color} rounded-full p-1 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
                    >
                      {!imageError ? (
                        <img
                          src={`https://github.com/${member.github}.png`}
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover bg-white"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white text-3xl font-bold">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                      {member.name}
                    </h3>

                    {/* GitHub username with icon */}
                    <div className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                      {/* GitHub SVG Icon */}
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium group-hover:underline">
                        @{member.github}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            );
          };

          return <TeamCard key={index} />;
        })}
      </div>
    </div>
  );
}
