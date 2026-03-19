import { assets } from "../assets/assets";
import { Search, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getBooks, searchBooks } from "../api/booksApi";
import { getImageSrc } from "../utils/imageUtils";

// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
const Landing = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);
  const [displayedText, setDisplayedText] = useState("");
  const [displayedText2, setDisplayedText2] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [books, setBooks] = useState([]);
  const [landingBookImages, setLandingBookImages] = useState([]);
  const [landingImagesAvailable, setLandingImagesAvailable] = useState(false);

  const fullText = t("landingIntro", "Buy and sell your books online");
  const fullText2 = t("landingIntro2", "for the best prices");

  // Fetch landing images from available books
  useEffect(() => {
    let cancelled = false;

    const pickImage = (book) => {
      const candidate =
        book?.image ||
        book?.img ||
        (Array.isArray(book?.images) && book.images.length > 0
          ? book.images[0]
          : null);
      return getImageSrc(candidate);
    };

    const shuffle = (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const fetchLandingBooks = async () => {
      try {
        if (!cancelled) {
          setLandingImagesAvailable(false);
        }

        // If backend is down/slow, hide images and show centered text only
        const withTimeout = (promise, ms) =>
          Promise.race([
            promise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("timeout")), ms),
            ),
          ]);

        const res = await withTimeout(
          getBooks({ page: 1, pageSize: 24, sort: "-createdAt" }),
          2500,
        );

        // `getBooks` may return mock fallback even when backend is down.
        // Treat that as "backend unavailable" for landing images.
        if (res?.fallback) {
          throw new Error("backend-fallback");
        }

        const list = Array.isArray(res?.data) ? res.data : [];
        if (list.length === 0) {
          throw new Error("no-books");
        }
        const active = list.filter((b) => b?.isActive !== false);

        const imgs = shuffle(active.map(pickImage).filter(Boolean));
        if (imgs.length === 0) {
          throw new Error("no-images");
        }

        if (!cancelled) {
          setLandingBookImages(imgs.slice(0, 4));
          setLandingImagesAvailable(true);
        }
      } catch (e) {
        console.error("Error loading landing book images:", e);
        if (!cancelled) {
          setLandingImagesAvailable(false);
          setLandingBookImages([]);
        }
      }
    };

    fetchLandingBooks();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch books from API based on search term (Autocomplete)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim()) {
        try {
          const response = await searchBooks({ q: searchTerm, limit: 5 });
          const booksData = Array.isArray(response.data) ? response.data : [];

          // Map the books to the format needed for autocomplete
          const formattedBooks = booksData.map((book) => ({
            id: book._id || book.id,
            img:
              book.img ||
              book.image ||
              (book.images && book.images.length > 0
                ? book.images[0].base64 || book.images[0].url || book.images[0]
                : null) ||
              assets.placeholderBook ||
              assets.book1,
            title: book.title,
            author: book.author,
            category: book.category,
          }));

          setBooks(formattedBooks);
        } catch (error) {
          console.error("Error searching books:", error);
          setBooks([]);
        }
      } else {
        setBooks([]);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowDropdown(false);
    if (searchTerm.trim()) {
      // Navigate to shop page with search query
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      // Just navigate to shop page if no search term
      navigate("/shop");
    }
  };

  const handleBookClick = (bookId) => {
    setShowDropdown(false);
    setSearchTerm("");
    navigate(`/book/${bookId}`);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(value.trim().length > 0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Check if animation has already been shown in this session
    const animationShown = sessionStorage.getItem(
      "landingTypingAnimationShown",
    );

    if (animationShown) {
      // If animation was shown before, display text immediately
      setDisplayedText(fullText);
      setDisplayedText2(fullText2);
      setHasAnimated(true);
    } else {
      // First time in session, reset for animation
      setDisplayedText("");
      setDisplayedText2("");
      setCurrentIndex(0);
      setHasAnimated(false);
    }
  }, [i18n.language, fullText, fullText2]);

  useEffect(() => {
    // Only animate if not animated yet
    if (hasAnimated) return;

    //type the first text
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + fullText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 40);

      return () => clearTimeout(timeout);
    }
    //type the second text
    else if (currentIndex < fullText.length + fullText2.length) {
      const index2 = currentIndex - fullText.length;
      const timeout = setTimeout(() => {
        setDisplayedText2((prev) => prev + fullText2[index2]);
        setCurrentIndex((prev) => prev + 1);
      }, 40);

      return () => clearTimeout(timeout);
    }
    // Animation completed, mark it in session storage
    else if (currentIndex === fullText.length + fullText2.length) {
      sessionStorage.setItem("landingTypingAnimationShown", "true");
      setHasAnimated(true);
    }
  }, [currentIndex, fullText, fullText2, hasAnimated]);
  return (
    <div className="bg-zinc-200 dark:bg-zinc-900 transition-colors duration-300">
      <section className="relative flex items-center dark:bg-zinc-900 justify-center min-h-screen">
        <div className="w-full max-w-337.5 mx-auto px-4 py-12">
          <div
            className={`flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 ${
              !landingImagesAvailable ? "justify-center" : ""
            }`}
          >
            {/* Text Content */}
            <div
              className={`w-full text-center space-y-6 flex flex-col justify-center order-2 lg:order-1 ${
                landingImagesAvailable ? "lg:max-w-xl lg:text-left" : "max-w-2xl"
              }`}
            >
              <h1 className="relative text-4xl sm:text-5xl lg:text-[56px] font-bold text-indigo-950 dark:text-indigo-100 leading-tight transition-colors duration-300">
                {/* Invisible placeholder to reserve space */}
                <span className="invisible" aria-hidden="true">
                  {fullText}{" "}
                  <span className="text-indigo-500 dark:text-indigo-400">
                    {fullText2}
                  </span>
                </span>

                {/* Visible typing text overlaid on top */}
                <span
                  dir={i18n.dir()}
                  className="absolute top-0 left-0 right-0 text-center lg:text-left"
                >
                  {displayedText}{" "}
                  <span
                    dir={i18n.dir()}
                    className="text-indigo-500 dark:text-indigo-400 transition-colors duration-300"
                  >
                    {displayedText2}
                  </span>
                </span>
              </h1>

              <p
                dir={i18n.dir()}
                className="text-indigo-950 dark:text-indigo-200 text-base sm:text-lg leading-relaxed transition-colors duration-300"
              >
                {t(
                  "landingParagraph",
                  "Find and read more you'll love, and keep track of the books you want to read. Be part of the world's largest community of book lovers on Goodreads.",
                )}
              </p>

              {/* Search bar with autocomplete */}
              <div
                ref={searchContainerRef}
                className="relative w-full max-w-md mx-auto lg:mx-0"
              >
                <form
                  onSubmit={handleSearch}
                  className="touch-area relative flex items-center"
                >
                  <Search
                    className="absolute left-4 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors duration-300 pointer-events-none z-10"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder={`${t("Search for a book")}...`}
                    dir={i18n.dir()}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => {
                      if (searchTerm.trim().length > 0) {
                        setShowDropdown(true);
                      }
                    }}
                    className="w-full px-10 py-3 bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 focus:hover:bg-white dark:focus:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 transition-all duration-300"
                  />
                  <button
                    type="submit"
                    className="absolute right-4 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors duration-300 cursor-pointer z-10"
                    aria-label="Search"
                  >
                    <MoreHorizontal size={20} />
                  </button>
                </form>

                {/* Autocomplete Dropdown */}
                {showDropdown && books.length > 0 && (
                  <div
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "#818cf8 transparent",
                    }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
                  >
                    {books.map((book) => (
                      <div
                        key={book.id}
                        onClick={() => handleBookClick(book.id)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors border-b border-zinc-200 dark:border-zinc-700 last:border-b-0"
                      >
                        {/* Book Image */}
                        <img
                          src={book.img}
                          alt={book.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                        {/* Book Info */}
                        <div className="flex-1 min-w-0">
                          <h4
                            dir="auto"
                            className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 whitespace-normal"
                          >
                            {book.title}
                          </h4>
                          <p
                            dir="auto"
                            className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-normal"
                          >
                            {book.author}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {showDropdown &&
                  searchTerm.trim().length > 0 &&
                  books.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-lg p-4 z-50">
                      <p
                        dir={i18n.dir()}
                        className="text-sm text-zinc-600 dark:text-zinc-400 text-center"
                      >
                        {t("No books found")}
                      </p>
                    </div>
                  )}
              </div>
            </div>

            {/* Animated Book Stack */}
            {landingImagesAvailable && (
              <div className="relative flex items-center justify-center w-full lg:w-125 h-75 sm:h-87.5 lg:h-105 overflow-visible order-1 lg:order-2">
                {landingBookImages.map((img, i) => {
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
                      className="absolute w-45 h-65 sm:w-55 sm:h-80 lg:w-65 lg:h-95 object-cover rounded-xl shadow-lg dark:shadow-zinc-800/50 transition-shadow duration-300"
                      style={{
                        zIndex: landingBookImages.length - i,
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
