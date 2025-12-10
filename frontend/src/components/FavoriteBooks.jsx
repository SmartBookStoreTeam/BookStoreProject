import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const FavoriteBooks = () => {
  const [bookCount, setBookCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [soldCount, setSoldCount] = useState(0);

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  useEffect(() => {
    if (inView) {
      let book = 0,
        user = 0,
        sold = 0;
      const interval = setInterval(() => {
        book = Math.min(book + 20, 800);
        user = Math.min(user + 15, 550);
        sold = Math.min(sold + 30, 1200);
        setBookCount(book);
        setUserCount(user);
        setSoldCount(sold);
        if (book === 800 && user === 550 && sold === 1200)
          clearInterval(interval);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [inView]);

  return (
    <div
      ref={ref}
      className="bg-white dark:bg-zinc-900 transition-colors duration-300"
    >
      <div className="container mx-auto px-6 md:px-20 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Side */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
            <img
              className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] object-contain rounded-2xl"
              src={assets.groupBooks}
              alt="Books Collection"
            />
          </div>

          {/* Right Side */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-6 transition-colors duration-300">
              Find Your Favorite <br />{" "}
              <span className="text-indigo-500 dark:text-indigo-400 transition-colors duration-300">
                Book Here!
              </span>
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-[16px] leading-relaxed mb-8 max-w-2xl transition-colors duration-300">
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quo ad
              non reprehenderit. Reiciendis illo justo incidunt distinctio
              exercitationem officiis dicta dolores dolorem ea! Non saepe,
              voluptatum cupiditate beatae in dolore!
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8 max-w-md mx-auto lg:mx-0">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1 transition-colors duration-300">
                  {bookCount}+
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  Book Listing
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 mb-1 transition-colors duration-300">
                  {userCount}+
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  Register User
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1 transition-colors duration-300">
                  {soldCount}+
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  Books Sold
                </div>
              </div>
            </div>

            <Link
              to={"/explore"}
              className="inline-block bg-indigo-500 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 cursor-pointer text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg dark:shadow-indigo-900/50 hover:shadow-xl"
            >
              Explore Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoriteBooks;
