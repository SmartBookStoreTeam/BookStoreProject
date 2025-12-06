import { assets } from "../assets/assets";
import { Search, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

const Landing = () => {
  const bookImages = [
    assets.landingBook1,
    assets.landingBook2,
    assets.landingBook3,
    assets.landingBook4,
  ];

  return (
    <div className="bg-zinc-200">
      <section className="relative flex items-center justify-center min-h-screen overflow-hidden">
        <div className="container mx-auto px-6 md:px-20 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
            {/* Text Content */}
            <div className="w-full lg:max-w-xl text-center lg:text-left space-y-6 flex flex-col justify-center order-2 lg:order-1">
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-indigo-950 leading-tight">
                Buy and sell your books{" "}
                <span className="text-indigo-500">for the best prices</span>
              </h1>

              <p className="text-indigo-950 text-base sm:text-lg leading-relaxed">
                Find and read more you'll love, and keep track of the books you
                want to read. Be part of the world's largest community of book
                lovers on Goodreads.
              </p>

              {/* Search bar */}
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

            {/* Animated Book Stack */}
            <div className="relative flex items-center justify-center w-full lg:w-[500px] h-[300px] sm:h-[350px] lg:h-[420px] overflow-visible order-1 lg:order-2">
              {bookImages.map((img, i) => {
                const finalRotation = i * 2;
                const finalOffset = i * 25;
                const startX = (i - 1.5) * 160;

                return (
                  <motion.img
                    key={i}
                    src={img}
                    alt={`Book ${i + 1}`}
                    initial={{
                      x: startX,
                      y: 0,
                      rotate: 0,
                      scale: 0.9,
                    }}
                    animate={{
                      x: [startX, 0, finalOffset],
                      y: [0, 0, 0],
                      rotate: [0, 0, finalRotation],
                      scale: [0.9, 1, 1],
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.2,
                      ease: "easeInOut",
                      times: [0, 0.5, 1],
                    }}
                    className="absolute w-[180px] h-[260px] sm:w-[220px] sm:h-[320px] lg:w-[260px] lg:h-[380px] object-cover rounded-xl shadow-lg"
                    style={{
                      zIndex: bookImages.length - i,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
