import { assets } from "../assets/assets";

const NationalBook = () => {
  return (
    <div className="bg-yellow-100 dark:bg-zinc-800 transition-colors duration-300 ">
      <div className="container mx-auto px-6 md:px-20 py-8">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-0">
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-[24px] md:text-[28px] font-bold mb-6 text-gray-900 dark:text-gray-100 transition-colors duration-300">
              2025 National Book Awards for Fiction Shortlist
            </h1>
            <button className="bg-indigo-500 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 cursor-pointer text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg dark:shadow-indigo-900/50 hover:shadow-xl">
              Explore Now
            </button>
          </div>
          {/* Award Image */}
          <div className="flex-1 flex justify-center md:justify-end">
            <img 
              src={assets.award} 
              alt="Award" 
              className="w-[250px] h-[250px] md:w-[300px] md:h-[300px] object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NationalBook;