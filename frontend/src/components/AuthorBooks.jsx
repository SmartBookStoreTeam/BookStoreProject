import { useState, useEffect } from "react";
import { useCart } from "../hooks/useCart";
import { useTranslation } from "react-i18next";
import Carousel from "./Carousel";
import { getBooks } from "../api/booksApi";
import Loading from "./Loading";

const AuthorBooks = ({ authorName, excludeBookId = null, title = null }) => {
  const { userBooks } = useCart();
  const { t, i18n } = useTranslation();
  const [authorBooks, setAuthorBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to normalize image format
  const normalizeBookImage = (book) => {
    // If book already has image or img property as string, use it
    if (typeof book.image === "string") return book;
    if (typeof book.img === "string") return book;

    // Handle images array
    if (book.images && Array.isArray(book.images) && book.images.length > 0) {
      const firstImage = book.images[0];

      // If it's an object with base64, preview, or url
      if (typeof firstImage === "object") {
        book.image =
          firstImage.base64 ||
          firstImage.preview ||
          firstImage.url ||
          firstImage;
      } else if (typeof firstImage === "string") {
        book.image = firstImage;
      }
    }

    return book;
  };

  useEffect(() => {
    const fetchAuthorBooks = async () => {
      try {
        setLoading(true);

        // Fetch books from API
        const response = await getBooks();
        const apiBooks = response.books || response || [];

        // Filter API books by author name
        const filteredApiBooks = apiBooks.filter(
          (book) => book.author?.toLowerCase() === authorName?.toLowerCase()
        );

        // Filter userBooks by author name
        const filteredUserBooks = userBooks.filter(
          (book) => book.author?.toLowerCase() === authorName?.toLowerCase()
        );

        // Combine both sources
        let combinedBooks = [...filteredApiBooks, ...filteredUserBooks];

        // Remove duplicates based on id or _id
        const uniqueBooks = combinedBooks.filter(
          (book, index, self) =>
            index ===
            self.findIndex(
              (b) => (b._id && b._id === book._id) || (b.id && b.id === book.id)
            )
        );

        // Exclude specific book if provided
        let finalBooks = uniqueBooks;
        if (excludeBookId) {
          finalBooks = uniqueBooks.filter(
            (book) =>
              book._id !== excludeBookId &&
              book.id !== excludeBookId &&
              book.id !== parseInt(excludeBookId)
          );
        }

        // Normalize images for all books
        const normalizedBooks = finalBooks.map(normalizeBookImage);

        setAuthorBooks(normalizedBooks);
      } catch (error) {
        console.error("Error fetching author books:", error);
        setAuthorBooks([]);
      } finally {
        setLoading(false);
      }
    };

    if (authorName) {
      fetchAuthorBooks();
    }
  }, [authorName, userBooks, excludeBookId]);

  if (loading) {
    return <Loading loading={t("Loading author books...")} height="h-96" animate={true} />;
  }

  // Don't render if no books found
  if (authorBooks.length === 0) {
    return null;
  }

  return (
    <div>
      <h2
        dir={i18n.dir()}
        className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-200 mb-6"
      >
        {title || `${t("More books by")} ${authorName}`}
      </h2>
      <Carousel books={authorBooks} carouselId={`author-${authorName}`} />
    </div>
  );
};

export default AuthorBooks;
