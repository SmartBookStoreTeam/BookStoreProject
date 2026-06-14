import Carousel from "./Carousel";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { getBooks } from "../api/booksApi";
import { useCart } from "../hooks/useCart";
import Loading from "./Loading";
import { useGlobalLoading } from "../context/LoadingContext";
import { getImageSrc } from "../utils/imageUtils";


const Releases = () => {
  const { t } = useTranslation();
  const { userBooks } = useCart();
  const [apiBooks, setApiBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setIsLoading } = useGlobalLoading();

  // Sync local loading with global loading bar
  useEffect(() => {
    setIsLoading(loading);

    // Cleanup: reset loading when component unmounts
    return () => {
      setIsLoading(false);
    };
  }, [loading, setIsLoading]);

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const books = await getBooks();
        if (books && (books.data || books.length > 0)) {
          const booksData = books.data || books;
          setApiBooks(booksData);
        }
      } catch (error) {
        console.error(t("Error fetching books:"), error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [t]);

  // Combine API books with user books
  const storeBooks =
    Array.isArray(apiBooks) && apiBooks.length > 0 ? apiBooks : [];
  const safeUserBooks = Array.isArray(userBooks) ? userBooks : [];

  const allBooks = [
    ...storeBooks.map((book) => ({ ...book, type: "regular" })),
    ...safeUserBooks.map((book) => {
      // Add proper image handling for user books
      const imageSrc =
        book.images && book.images.length > 0
          ? getImageSrc(book.images[0])
          : null;
      return {
        ...book,
        type: "user",
        img: imageSrc || book.img,
      };
    }),
  ].slice(0, 7);

  return (
    <div
      id="releases"
      className="bg-white dark:bg-zinc-900 transition-colors duration-300 py-8"
    >
      <div className="w-full max-w-337.5 mx-auto px-4 relative">
        <h1 className="text-2xl font-bold text-center p-5 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          {t("New Releases")}
        </h1>
        {loading ? (
          <Loading
            loading={t("Loading New Releases...")}
            height="h-96"
            animate={true}
          />
        ) : allBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-700">
            <p className="text-lg font-medium">
              {t("No books found in")} {t("New Releases")}
            </p>
          </div>
        ) : (
          <Carousel books={allBooks} />
        )}
      </div>
    </div>
  );
};

export default Releases;
