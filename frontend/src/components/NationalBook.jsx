import { assets } from "../assets/assets";


const NationalBook = () => {
  return (
    <div className="bg-yellow-100 mb-10">
      <div className="container mx-auto px-6 md:px-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-bold mb-3 text-gray-900">2025 National Book Awards for Fiction Shortlist</h1>
            <button className="bg-indigo-500 hover:bg-indigo-600 cursor-pointer text-white font-semibold py-2 px-6 rounded-lg transition duration-200 transform hover:scale-105 shadow-lg">
              Explore Now
            </button>
          </div>
          <img src={assets.award} alt="Award" className="w-[300px] h-[300px]"/>
        </div>
      </div>
    </div>
  );
};

export default NationalBook;
