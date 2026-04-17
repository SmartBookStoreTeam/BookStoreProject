import { useTranslation } from "react-i18next";
import { BookHeart, Users, Target, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Team from "../components/Team";

const AboutUs = () => {
  const { t, i18n } = useTranslation();
  const [booksCount, setBooksCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [publishersCount, setPublishersCount] = useState(0);

  const { ref: statsRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  // Animate numbers when section comes into view
  useEffect(() => {
    if (inView) {
      let books = 0,
        users = 0,
        publishers = 0;
      const interval = setInterval(() => {
        books = Math.min(books + 30, 1200);
        users = Math.min(users + 12, 500);
        publishers = Math.min(publishers + 3, 100);
        setBooksCount(books);
        setUsersCount(users);
        setPublishersCount(publishers);
        if (books === 1200 && users === 500 && publishers === 100)
          clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [inView]);

  const features = [
    {
      icon: BookHeart,
      titleKey: "our Mission",
      descKey:
        "We strive to make reading accessible to everyone by providing a comprehensive digital library that brings together commercial books and books published by our distinguished community.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      titleKey: "our Community",
      descKey:
        "We believe in the power of community. Join thousands of readers and writers who share their love of books and exchange knowledge.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Target,
      titleKey: "our Goal",
      descKey:
        "Our goal is to create a space where anyone can find their favorite book or share their literary creations with the world.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Sparkles,
      titleKey: "why Choose Us",
      descKey:
        "We offer a seamless buying and reading experience, 24/7 support, and an active community of book lovers from around the world.",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block mb-6">
            <div className="relative">
              <div className="absolute"></div>
              <h1 className="relative text-5xl md:text-6xl font-bold text-grey-700 dark:text-white">
                {t("Join Our Community")}
              </h1>
            </div>
          </div>

          <p
            dir={i18n.dir()}
            className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            {t(
              "Your favorite platform to discover, buy, and share books with a reading-loving community.",
            )}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 cursor-pointer">
          {/* eslint-disable-next-line no-unused-vars */}
          {features.map((feature, index) => (
            <div
              key={feature.titleKey}
              className="group relative bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 dark:border-zinc-700 overflow-hidden"
            >
              {/* Background Gradient Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
              ></div>

              <div className="relative z-10">
                <div
                  className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-500`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                <h3
                  dir={i18n.dir()}
                  className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300"
                >
                  {t(feature.titleKey)}
                </h3>

                <p
                  dir={i18n.dir()}
                  className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg"
                >
                  {t(feature.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Community Stats */}
        <div
          ref={statsRef}
          className="bg-indigo-600 dark:bg-indigo-900 rounded-3xl p-12 shadow-2xl mb-16"
        >
          <h2
            dir={i18n.dir()}
            className="text-3xl md:text-4xl font-bold text-white text-center mb-12"
          >
            {t("Community in Numbers")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: booksCount, labelKey: "Books Available" },
              { number: usersCount, labelKey: "Active Readers" },
              { number: publishersCount, labelKey: "Publishers" },
              // eslint-disable-next-line no-unused-vars
            ].map((stat, index) => (
              <div key={stat.labelKey} className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-indigo-100 dark:text-indigo-200 mb-3">
                  {stat.number}+
                </div>
                <div dir={i18n.dir()} className="text-lg text-indigo-100">
                  {t(stat.labelKey)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2
            dir={i18n.dir()}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6"
          >
            {t("Join Our Community")}
          </h2>

          <p
            dir={i18n.dir()}
            className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto"
          >
            {i18n.language === "ar" ? (
              <>
                ابدأ رحلتك مع{" "}
                <Link
                  to="/"
                  className="font-bold text-indigo-600 dark:text-indigo-200 hover:underline"
                >
                  Bookfly
                </Link>{" "}
                اليوم واكتشف عالماً من الكتب والمعرفة
              </>
            ) : (
              <>
                Start your journey with{" "}
                <Link
                  to="/"
                  className="font-bold text-indigo-600 dark:text-indigo-200 hover:underline"
                >
                  Bookfly
                </Link>{" "}
                today and discover a world of books and knowledge
              </>
            )}
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/shop"
              className="touch-area px-8 py-4 bg-indigo-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              {t("Explore Books Now")}
            </Link>
          </div>
        </div>

        {/* Team Section */}
        <Team />
      </div>
    </div>
  );
};

export default AboutUs;
