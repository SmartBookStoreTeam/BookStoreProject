import { assets } from "../assets/assets";
import { Search, MoreHorizontal } from "lucide-react";

const LandingExplore = () => {
  return (
    <div className="bg-[#E9D5FF]">
      <div className="container mx-auto px-6 md:px-20 py-12">
        <div className="flex items-center justify-between md:flex-row flex-col-reverse">
          <div>
            <h1 className="text-2xl text-[#1C2024] font-bold mb-3">
              Find Your Favorite — 1200+ Books Available
            </h1>
            <div className="relative flex items-center w-full max-w-md mx-auto lg:mx-0">
              <Search className="absolute left-4 text-zinc-400" size={20} />
              <input
                type="text"
                placeholder="Search for a book..."
                className="w-full px-10 py-3 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm sm:text-base"
              />
              <MoreHorizontal
                className="absolute right-4 text-zinc-400"
                size={20}
              />
            </div>
          </div>
          <img
            src={assets.landingBooks}
            alt="Books"
            className="w-75 h-75"
          />
        </div>
      </div>
    </div>
  );
};

export default LandingExplore;
