/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCartPlus, FaShoppingCart } from "react-icons/fa";
import {
  ArrowLeft,
  X,
  Menu,
  ShoppingCart,
  Home,
  Store,
  Maximize,
  Minimize,
  Download as DownloadIcon,
  Printer as PrintIcon,
} from "lucide-react";
import {
  Worker,
  Viewer,
  ScrollMode,
  SpecialZoomLevel,
} from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import toast from "react-hot-toast";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import axios from "axios";
import Loading from "../components/Loading";
import { useTranslation } from "react-i18next";
import { useCart } from "../hooks/useCart";

const PdfViewer = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHeader, setShowHeader] = useState(false);
  const { addToCart, cartItems } = useCart();
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);

  // State for page tracking
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Initialize page navigation plugin
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  // Initialize the plugin instance
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar: (Toolbar) => (
      <Toolbar>
        {(slots) => {
          const {
            CurrentPageInput,
            Download,
            EnterFullScreen,
            GoToNextPage,
            GoToPreviousPage,
            NumberOfPages,
            Print,
            Zoom,
            ZoomIn,
            ZoomOut,
          } = slots;
          return (
            <div className="flex items-center touch-area justify-center w-full">
              <div className="hidden sm:flex ml-5 px-1">
                <ZoomOut />
              </div>
              <div className="hidden sm:flex px-1">
                <Zoom />
              </div>
              <div className="hidden sm:flex px-1">
                <ZoomIn />
              </div>
              <div className="px-1 ml-auto">
                <GoToPreviousPage />
              </div>
              <div className="px-1 w-16">
                <CurrentPageInput />
              </div>
              <div className="px-1 text-white">
                / <NumberOfPages />
              </div>
              <div className="px-1">
                <GoToNextPage />
              </div>
              <div className="px-1 ml-auto">
                <EnterFullScreen />
              </div>
              <div className="px-1">
                <button
                  onClick={() => setShowAddToCartModal(true)}
                  className="rpv-core__minimal-button"
                  aria-label="Download"
                >
                  <DownloadIcon size={20} />
                </button>
              </div>
              <div className="px-1">
                <button
                  onClick={() => setShowAddToCartModal(true)}
                  className="p-2 rounded-md text-white hover:bg-white/10 cursor-pointer"
                  aria-label="Print"
                >
                  <PrintIcon size={20} />
                </button>
              </div>
            </div>
          );
        }}
      </Toolbar>
    ),
  });

  // Appends header to the third page and jump back to page 2
  useEffect(() => {
    if (currentPage >= 3) {
      setShowAddToCartModal(true);
      // Jump back to page 2 (index 1) when modal appears
      if (jumpToPage) {
        jumpToPage(1); // 0-indexed, so 1 = page 2
      }
    }
  }, [currentPage, jumpToPage]);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const viewerRef = useRef(null);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (viewerRef.current) {
        viewerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `http://localhost:5000/api/books/${bookId}`
        );
        setBook(response.data);
      } catch (err) {
        console.error("Error fetching book:", err);
        setError(t("Failed to load book data"));
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchBook();
    }
  }, [bookId, t]);

  // Check if book is already in cart
  const isBookInCart =
    book &&
    cartItems &&
    cartItems.some(
      (item) =>
        item.id === book.id ||
        item._id === book._id ||
        item.id === book._id ||
        item._id === book.id
    );

  const handleAddToCart = (bookToAdd) => {
    // If already in cart, navigate to checkout
    if (isBookInCart) {
      navigate("/checkout", { state: { books: cartItems } });
      return;
    }

    // Otherwise, add to cart
    const result = addToCart(bookToAdd);
    if (result.success) {
      toast.success(`${t("Added")} "${bookToAdd.title}" ${t("to Cart")}!`, {
        duration: 1500,
        style: {
          background: "#333",
          color: "#fff",
          direction: i18n.dir(),
          width: "fit-content",
          maxWidth: "90vw",
          minWidth: "200px",
          padding: "12px 16px",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      });
    }
  };
  if (loading) {
    return (
      <div className="relative">
        <button
          dir="ltr"
          className="group touch-area absolute top-5 left-5 cursor-pointer flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-[12px] text-gray-900 dark:text-white text-base transition-transform duration-300 hover:bg-gray-200 dark:hover:bg-white/20 hover:-translate-x-1 w-auto justify-center"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-all" />
          <span>{t("Back")}</span>
        </button>
        <Loading
          loading={t("Loading book...")}
          height="h-[100vh]"
          animate={true}
        />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="relative">
        <button
          dir="ltr"
          className="group touch-area absolute top-5 left-5 cursor-pointer flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-[12px] text-gray-900 dark:text-white text-base transition-transform duration-300 hover:bg-gray-200 dark:hover:bg-white/20 hover:-translate-x-1 w-auto justify-center"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-all" />
          <span>{t("Back")}</span>
        </button>
        <Loading
          error={t("Failed to load book!")}
          height="h-[100vh]"
          animate={true}
          status="error"
        />
      </div>
    );
  }
  const getAutoDir = (text = "") => {
    if (
      /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF]/.test(
        text.trim()
      )
    ) {
      return "rtl";
    }
    return "ltr";
  };
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-indigo-800 dark:bg-zinc-800">
      {/* Simple Header*/}
      <header
        dir="rtl"
        className="fixed top-0 left-0 right-0 z-50 bg-zinc-800 border-b border-gray-700"
      >
        <div className="flex items-center py-1 px-2 md:py-2 md:px-3">
          {/* Back Button */}
          <div className="touch-area flex-none flex justify-start">
            <button
              onClick={() => navigate(-1)}
              aria-label={t("Go back")}
              className="touch-area flex items-center gap-2 px-2 py-2 border border-white/20 rounded-full text-white hover:scale-95 hover:bg-white/20 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <X size={18} className="md:w-5 md:h-5" />
            </button>
          </div>

          {/* Book Title*/}
          <div className="flex-1 flex justify-center min-w-0 px-2">
            <h2
              dir={getAutoDir(book.title)}
              className="touch-area  text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600 text-sm sm:text-base md:text-xl font-semibold text-center truncate w-full"
            >
              {book.title}
            </h2>
          </div>
          {/* Menu Toggle */}
          <div className="flex-none flex justify-end items-center gap-2">
            <button
              onClick={toggleFullScreen}
              className="touch-area p-1.5 md:p-2 rounded-full border border-white/20 text-white hover:bg-white/20 transition-all duration-300 active:scale-95 cursor-pointer"
              aria-label={
                isFullScreen ? t("Exit Full Screen") : t("Enter Full Screen")
              }
            >
              {isFullScreen ? (
                <Minimize size={18} className="md:w-5 md:h-5" />
              ) : (
                <Maximize size={18} className="md:w-5 md:h-5" />
              )}
            </button>
            <button
              onClick={() => setShowHeader(!showHeader)}
              className="touch-area p-1.5 md:p-2 rounded-full  border border-white/20 text-white hover:bg-white/20 transition-all duration-300 active:scale-95 cursor-pointer"
              aria-label={showHeader ? t("Hide Menu") : t("Show Menu")}
              aria-expanded={showHeader}
            >
              {showHeader ? (
                <X
                  size={18}
                  className="md:w-5 md:h-5 transition-all duration-300"
                />
              ) : (
                <Menu
                  size={18}
                  className="md:w-5 md:h-5 transition-all duration-300"
                />
              )}
            </button>
          </div>
        </div>

        {/* Dropdown Navigation*/}
        <div
          className={`absolute top-full left-0 right-0 overflow-hidden transition-all duration-300 z-40 ${
            showHeader
              ? "max-h-96 sm:max-h-40 opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <nav dir="ltr" className="bg-zinc-900/95 border-t border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-6 p-4">
              <button
                onClick={() => {
                  navigate("/");
                  setShowHeader(false);
                }}
                className="touch-area px-4 py-2 text-indigo-200 hover:text-indigo-400 hover:bg-white/10 rounded-lg transition-all duration-300 text-center active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Home size={20} />
                  {t("Home")}
                </div>
              </button>
              <button
                onClick={() => {
                  navigate("/shop");
                  setShowHeader(false);
                }}
                className="touch-area px-4 py-2 text-indigo-200 hover:text-indigo-400 hover:bg-white/10 rounded-lg transition-all duration-300 text-center active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Store size={20} />
                  {t("Shop")}
                </div>
              </button>
              <button
                onClick={() => handleAddToCart(book)}
                className="touch-area px-4 py-2 text-indigo-200 hover:text-indigo-400 hover:bg-white/10 rounded-lg transition-all duration-300 text-center active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {isBookInCart ? (
                    <>
                      <FaShoppingCart size={20} />
                      {t("Go to Checkout")}
                    </>
                  ) : (
                    <>
                      <FaCartPlus size={20} />
                      {t("Add to Cart")}
                    </>
                  )}
                </div>
              </button>
              <button
                onClick={() => {
                  navigate("/cart");
                  setShowHeader(false);
                }}
                className="touch-area px-4 py-2 text-indigo-200 hover:text-indigo-400 hover:bg-white/10 rounded-lg transition-all duration-300 text-center active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart size={20} />
                  {t("View Cart")}
                </div>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* PDF Content */}
      <div
        className="flex-1 w-full overflow-hidden bg-zinc-900 relative pt-8 md:pt-10"
        ref={viewerRef}
      >
        {/* Add to Cart Modal */}
        {showAddToCartModal && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-xl max-w-sm w-full border border-gray-200 dark:border-zinc-700 transform transition-all scale-100 opacity-100">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-3  text-indigo-600 dark:text-indigo-400">
                  <FaCartPlus size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t("Enjoying")}
                  </h3>
                  <span className="touch-area text-xl font-bold text-indigo-600 dark:text-indigo-300">
                    {book.title}
                    {getAutoDir(book.title) === "rtl" ? "؟" : "?"}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {t("Would you like to add this book to your cart now?")}
                </p>
                <div className="flex gap-3 w-full mt-2">
                  <button
                    onClick={() => setShowAddToCartModal(false)}
                    className="touch-area flex-1 px-4 py-2 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                  >
                    {t("Maybe Later")}
                  </button>
                  <button
                    onClick={() => {
                      handleAddToCart(book);
                      setShowAddToCartModal(false);
                    }}
                    className="touch-area flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 cursor-pointer"
                  >
                    {isBookInCart ? t("Go to Checkout") : t("Add to Cart")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {book.pdf ? (
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <div className="w-full h-full pt-[10px] relative">
              {isFullScreen && (
                <button
                  onClick={toggleFullScreen}
                  className="touch-area fixed top-22 left-15 z-50 p-2 bg-black/50 hover:translate-y-[-5px] hover:bg-black/70 rounded-full text-white transition-all duration-300 cursor-pointer"
                >
                  <X size={24} />
                </button>
              )}
              {/* Add blur effect when modal is shown on page 3 */}
              <div
                className={`w-full h-full transition-all duration-300 ${
                  showAddToCartModal ? "blur-md" : ""
                }`}
              >
                <Viewer
                  fileUrl={book.pdf || "error"}
                  plugins={[
                    defaultLayoutPluginInstance,
                    pageNavigationPluginInstance,
                  ]}
                  defaultScale={SpecialZoomLevel.PageWidth}
                  theme={{
                    theme: "dark",
                  }}
                  onDocumentLoad={(e) => setTotalPages(e.doc.numPages)}
                  onPageChange={(e) => setCurrentPage(e.currentPage + 1)} // currentPage is 0-indexed
                />
              </div>
            </div>
          </Worker>
        ) : (
          <div
            dir={getAutoDir(t("No PDF file found for this book"))}
            className="flex flex-col items-center gap-6 text-gray-300 p-16 bg-zinc-800 border border-zinc-700/30 rounded-2xl"
          >
            <p>{t("No PDF file found for this book")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
