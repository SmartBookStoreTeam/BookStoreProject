import { assets } from "../assets/assets";


const NationalBook = () => {
  return (
    <div className="bg-yellow-100 mb-10">
      <div className="container mx-auto px-4 sm:px-6 md:px-20 py-6 md:py-0">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-0">
          <div className="text-center md:text-left w-full md:w-auto">
            <h1 className="text-lg sm:text-xl md:text-[24px] font-bold mb-3 text-gray-900">
              2025 National Book Awards for Fiction Shortlist
            </h1>
            <button className="bg-indigo-500 hover:bg-indigo-600 cursor-pointer text-white font-semibold py-2 px-6 rounded-lg transition duration-200 transform hover:scale-105 shadow-lg">
              Explore Now
            </button>
          </div>
          <img 
            src={assets.award} 
            alt="Award" 
            className="w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px] object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default NationalBook;
