import { assets } from "../assets/assets";
import { Search, MoreHorizontal } from "lucide-react";

const LandingExplore = () => {
  return (
    <div className="bg-[#E9D5FF] dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-20 py-12">
        <div className="flex items-center dark:bg-gray-900 justify-between md:flex-row flex-col-reverse gap-8 md:gap-0">
          <div className="w-full md:w-1/2">
            <h1 className="text-2xl md:text-3xl text-[#1C2024] dark:text-indigo-100 font-bold mb-6 transition-colors duration-300">
              Find Your Favorite — 1200+ Books Available
            </h1>
            <div className="relative flex items-center w-full max-w-md">
              <Search
                className="absolute left-4 text-zinc-400 dark:text-zinc-500 transition-colors duration-300"
                size={20}
              />
              <input
                type="text"
                placeholder="Search for a book..."
                className="w-full px-10 py-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 transition-all duration-300"
              />
              <MoreHorizontal
                className="absolute right-4 text-zinc-400 dark:text-zinc-500 transition-colors duration-300"
                size={20}
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <img
              src={assets.landingBooks}
              alt="Books"
              className="w-[250px] h-[250px] md:w-[300px] md:h-[300px] object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingExplore;
