import { useState, useEffect, useRef, useCallback } from "react";
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
  BookOpen,
  Globe,
  Loader,
} from "lucide-react";
import {
  Worker,
  Viewer,
  ScrollMode,
  SpecialZoomLevel,
  ViewMode,
} from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import toast from "react-hot-toast";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import api from "../api/api";
import Loading from "./Loading";
import RateModal from "./RateModal";
import AuthModal from "./AuthModal";
import { useTranslation } from "react-i18next";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../context/AuthContext";
import "../pdfViewerFullscreen.css";
import { getImageSrc } from "../utils/imageUtils";

// Number of pages a guest / logged-in unpurchased user can view freely
const PREVIEW_PAGE_LIMIT = 20;

const PdfViewer = ({
  book: initialBook,
  pdfFile,
  externalToolbarApiRef,
  hideHeader = false,
  initialPage = 0,
  onPageChange: parentOnPageChange,
}) => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [book, setBook] = useState(initialBook || null);
  const [error, setError] = useState(null);
  const [showHeader, setShowHeader] = useState(false);
  const { addToCart, cartItems, isBookPurchased } = useCart();
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const isPurchased = !!(book && isBookPurchased(book._id || book.id));

  // Use the isAuthorized prop passed from parent (which handles admin/author status)
  // or fall back to local purchase check if not provided

  // State for page tracking
  const [currentPage, setCurrentPage] = useState(initialPage + 1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const [translationPopup, setTranslationPopup] = useState({
    visible: false,
    text: "",
    x: 0,
    y: 0,
    status: "idle",
    translatedText: "",
  });

  // Default to dual page in landscape, single page in portrait
  const [viewMode, setViewMode] = useState(() => {
    const isPortrait = window.innerHeight >= window.innerWidth;
    return isPortrait ? ViewMode.SinglePage : ViewMode.DualPage;
  });

  const lastOrientationRef = useRef(window.innerHeight >= window.innerWidth);

  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const isCurrentlyPortrait = window.innerHeight >= window.innerWidth;
        const wasPortrait = lastOrientationRef.current;

        if (wasPortrait !== isCurrentlyPortrait) {
          const targetMode = isCurrentlyPortrait
            ? ViewMode.SinglePage
            : ViewMode.DualPage;
          if (viewerApiRef.current) {
            viewerApiRef.current.switchViewMode(targetMode);
          }
          setViewMode(targetMode);
        }
        lastOrientationRef.current = isCurrentlyPortrait;
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  const handleToggleViewMode = useCallback(() => {
    const nextMode =
      viewMode === ViewMode.SinglePage
        ? ViewMode.DualPage
        : ViewMode.SinglePage;
    if (viewerApiRef.current) {
      viewerApiRef.current.switchViewMode(nextMode);
    }
    setViewMode(nextMode);
  }, [viewMode]);

  // Initialize page navigation plugin
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage, jumpToNextPage, jumpToPreviousPage } =
    pageNavigationPluginInstance;

  const prevBtnSlotRef = useRef(null);
  const nextBtnSlotRef = useRef(null);
  const zoomInSlotRef = useRef(null);
  const zoomOutSlotRef = useRef(null);
  const switchSidebarSlotRef = useRef(null);

  const clickSlotButton = (ref) => {
    const btn = ref.current?.querySelector("button");
    if (btn) btn.click();
  };

  // Initialize the plugin instance
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => {
      // If not purchased, don't show any sidebar tabs
      if (!isPurchased) return [];

      // If purchased, filter out attachments (index 2)
      // and keep Thumbnails (0) and Bookmarks (1)
      return defaultTabs.filter((_, index) => index !== 2);
    },
    // eslint-disable-next-line no-unused-vars
    renderToolbar: (ToolbarSlot) => (
      <div style={{ display: "none" }}>
        <ToolbarSlot>
          {(slots) => {
            const {
              ZoomIn,
              ZoomOut,
              SwitchSidebar,
              GoToNextPage,
              GoToPreviousPage,
            } = slots;
            return (
              <div className="hidden">
                {ZoomIn && (
                  <div ref={zoomInSlotRef}>
                    <ZoomIn />
                  </div>
                )}
                {ZoomOut && (
                  <div ref={zoomOutSlotRef}>
                    <ZoomOut />
                  </div>
                )}
                {SwitchSidebar && (
                  <div ref={switchSidebarSlotRef}>
                    <SwitchSidebar />
                  </div>
                )}
                {GoToPreviousPage && (
                  <div ref={prevBtnSlotRef}>
                    <GoToPreviousPage />
                  </div>
                )}
                {GoToNextPage && (
                  <div ref={nextBtnSlotRef}>
                    <GoToNextPage />
                  </div>
                )}
              </div>
            );
          }}
        </ToolbarSlot>
      </div>
    ),
  });

  useEffect(() => {
    if (!externalToolbarApiRef) return;
    externalToolbarApiRef.current = {
      prev: () => {
        if (jumpToPreviousPage) jumpToPreviousPage();
        else clickSlotButton(prevBtnSlotRef);
      },
      next: () => {
        if (jumpToNextPage) jumpToNextPage();
        else clickSlotButton(nextBtnSlotRef);
      },
      zoomIn: () => clickSlotButton(zoomInSlotRef),
      zoomOut: () => clickSlotButton(zoomOutSlotRef),
      toggleSidebar: () => clickSlotButton(switchSidebarSlotRef),
      zoomReset: () => viewerApiRef.current?.zoom(SpecialZoomLevel.PageWidth),
      toggleSingleTwo: () => handleToggleViewMode(),
    };

    return () => {
      externalToolbarApiRef.current = null;
    };
  }, [
    externalToolbarApiRef,
    jumpToNextPage,
    jumpToPreviousPage,
    handleToggleViewMode,
  ]);

  // Show appropriate modal when page limit is reached
  useEffect(() => {
    const isPurchased = book && isBookPurchased(book._id || book.id);
    if (currentPage > PREVIEW_PAGE_LIMIT && !isPurchased) {
      if (jumpToPage) jumpToPage(PREVIEW_PAGE_LIMIT - 1); // 0-indexed, enforce blocking

      if (!user) {
        setShowAuthModal(true);
      } else {
        setShowAddToCartModal(true);
      }
    }
  }, [currentPage, jumpToPage, book, isBookPurchased, user]);

  const viewerRef = useRef(null);
  const blurLogicRef = useRef();
  blurLogicRef.current = (pageIndex) => {
    const isPurchased = book && isBookPurchased(book._id || book.id);
    return !isPurchased && pageIndex >= PREVIEW_PAGE_LIMIT;
  };

  const viewerApiRef = useRef(null);
  const apiPlugin = useRef({
    install: (pluginFunctions) => {
      viewerApiRef.current = pluginFunctions;
    },
    renderPageLayer: (renderProps) => {
      const isBlurred = blurLogicRef.current(renderProps.pageIndex);
      return isBlurred ? (
        <div className="absolute inset-0 z-20 backdrop-blur-[12px] bg-zinc-900/10" />
      ) : (
        <></>
      );
    },
  }).current;

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

      // Remove all padding/margin when in fullscreen
      if (document.fullscreenElement) {
        document.fullscreenElement.style.padding = "0";
        document.fullscreenElement.style.margin = "0";
      }
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  // Force re-calculate zoom when fullscreen or viewMode changes
  useEffect(() => {
    let timeoutId;
    const applyZoom = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (viewerApiRef.current) {
          // Make both single and dual page modes fill the screen width
          viewerApiRef.current.zoom(SpecialZoomLevel.PageWidth);
        }
      }, 150);
    };

    applyZoom();

    window.addEventListener("resize", applyZoom);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", applyZoom);
    };
  }, [isFullScreen, viewMode]);

  // Handle Text Selection for Translation
  useEffect(() => {
    const handleMouseUp = (e) => {
      const popupEl = document.getElementById("translation-popup");
      if (popupEl && popupEl.contains(e.target)) return;

      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text && text.length > 0) {
          try {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Calculate coordinates relative to the PDF viewer container
            const viewerRect = viewerRef.current
              ? viewerRef.current.getBoundingClientRect()
              : { left: 0, top: 0, width: 0, height: 0 };

            setTranslationPopup({
              visible: true,
              text,
              x: rect.left - viewerRect.left + rect.width / 2,
              y: rect.top - viewerRect.top - 10,
              status: "idle",
              translatedText: "",
            });
          } catch (err) {
            console.error("Error getting selection", err);
          }
        } else {
          setTranslationPopup((prev) =>
            prev.visible ? { ...prev, visible: false } : prev,
          );
        }
      }, 50);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  const handleTranslate = async (e) => {
    e.stopPropagation();
    if (!translationPopup.text) return;
    setTranslationPopup((prev) => ({ ...prev, status: "loading" }));

    try {
      // Detect if text contains Arabic characters
      const isArabic = /[\u0600-\u06FF]/.test(translationPopup.text);
      const targetLang = isArabic ? "en" : "ar";

      // Using Google Translate public api (free, reliable, accurate)
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(translationPopup.text)}`;
      const res = await fetch(url);
      const data = await res.json();
      const result = data[0].map((item) => item[0]).join("");

      setTranslationPopup((prev) => ({
        ...prev,
        status: "success",
        translatedText: result,
      }));
    } catch (error) {
      console.error("Translation error:", error);
      setTranslationPopup((prev) => ({
        ...prev,
        status: "error",
        translatedText: t("Translation failed"),
      }));
    }
  };

  // Update page title
  useEffect(() => {
    if (book?.title) document.title = `${book.title} : ${t("Bookfly Store")}`;
    return () => {
      document.title = t("Bookfly Store - Buy your favorite books online");
    };
  }, [book, t]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await api.get(`/books/${bookId}`);
        const bookData = response.data?.data || response.data;

        // Fetch the signed S3 preview URL (public route — works for guests too)
        if (bookData?.pdf) {
          try {
            const pdfResponse = await api.get(`/books/${bookId}/preview`);
            if (pdfResponse.data?.success && pdfResponse.data?.data?.url) {
              bookData.pdfUrl = pdfResponse.data.data.url;
            }
          } catch (pdfErr) {
            console.error("Error fetching PDF URL:", pdfErr);
          }
        }

        setBook(bookData);
      } catch (err) {
        console.error("Error fetching book:", err);
        setError(t("Failed to load book data"));
      }
    };

    if (bookId) fetchBook();
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
        item._id === book.id,
    );

  const handleAddToCart = async (bookToAdd) => {
    // If already in cart, navigate to checkout
    if (isBookInCart) {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      navigate("/checkout", { state: { books: cartItems } });
      return;
    }

    // Otherwise, add to cart
    const result = await addToCart(bookToAdd);
    if (result?.success) {
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

      setTimeout(() => {
        toast(
          (tToast) => (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-sm font-medium">
                {t("Do you want to checkout?")}
              </span>
              <button
                onClick={() => {
                  toast.dismiss(tToast.id);
                  navigate(!user ? "/cart" : "/checkout", {
                    state: { books: [bookToAdd] },
                  });
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition duration-200 cursor-pointer"
              >
                {t("Go to Checkout")}
              </button>
            </div>
          ),
          {
            duration: 5000,
            style: {
              direction: i18n.dir(),
              background: "#333",
              color: "#fff",
            },
          },
        );
      }, 1500);
    }
  };

  const handleCloseClick = () => {
    // Check if user has already been asked to rate this book (user-specific)
    const userId = user?._id || user?.id || "guest";
    const storageKey = `ratedBooks_${userId}`;
    const ratedBooks = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const hasRated = ratedBooks.includes(bookId);

    if (!hasRated) {
      setShowRateModal(true);
    } else {
      // If already rated/skipped, just navigate back
      navigate(-1);
    }
  };

  const handleRateSubmit = async (rating) => {
    try {
      await api.post(`/books/${bookId}/rate`, {
        rating,
        userId: user?._id || user?.id,
      });

      // Mark this book as rated for this user
      const userId = user?._id || user?.id || "guest";
      const storageKey = `ratedBooks_${userId}`;
      const ratedBooks = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (!ratedBooks.includes(bookId)) {
        ratedBooks.push(bookId);
        localStorage.setItem(storageKey, JSON.stringify(ratedBooks));
      }

      toast.success(t("Thank you for your rating!"), {
        duration: 2000,
        style: {
          background: "#333",
          color: "#fff",
          direction: i18n.dir(),
        },
      });
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      navigate(-1);
    }
  };

  const handleRateClose = () => {
    setShowRateModal(false);
    navigate(-1);
  };
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
        text.trim(),
      )
    ) {
      return "rtl";
    }
    return "ltr";
  };
  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-zinc-900">
      <style>{`
        .rpv-default-layout__toolbar,
        .rpv-default-layout__header { 
          display: none !important; 
          height: 0 !important; 
        }
        .rpv-default-layout__main { border-top: none !important; }
      `}</style>
      {/* Simple Header - Hidden in full screen or if hideHeader is true */}
      {!isFullScreen && !hideHeader && (
        <header
          dir="rtl"
          className="relative flex-none w-full z-50 bg-zinc-800 border-b border-gray-700"
        >
          <div className="flex items-center  px-2 md:py-2 md:px-3">
            {/* Close Button - Shows Rate Modal */}
            <div className="touch-area flex-none flex justify-start">
              <button
                onClick={handleCloseClick}
                aria-label={t("Close")}
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
                {/* Hide cart buttons for purchased books */}
                {!isBookPurchased(book?._id || book?.id) && (
                  <>
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
                  </>
                )}
              </div>
            </nav>
          </div>
        </header>
      )}

      {/* PDF Content */}
      <div
        className="flex-1 min-h-0 w-full overflow-hidden bg-zinc-900 relative flex flex-col"
        ref={viewerRef}
      >
        {/* Rate Modal - Moved inside for Fullscreen visibility */}
        <RateModal
          isOpen={showRateModal}
          onClose={handleRateClose}
          onSubmit={handleRateSubmit}
          bookTitle={book?.title || ""}
        />
        {/* Auth Modal — shown to guests who reach the page limit */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          title="Please login or create an account to continue reading"
          icon={
            <BookOpen className="w-16 h-16 mx-auto text-indigo-600 dark:text-indigo-400" />
          }
        />

        {/* Add to Cart Modal — shown to logged-in users who haven't purchased */}
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
                    {t("Later")}
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

        {book.pdf || pdfFile ? (
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <div className="absolute inset-0 flex flex-col">
              {isFullScreen && (
                <button
                  onClick={toggleFullScreen}
                  className="touch-area cursor-pointer absolute top-14 left-4 z-[70] p-2 bg-black/40 text-white rounded-full hover:bg-zinc-400 transition-colors backdrop-blur-sm"
                  aria-label="Exit Full Screen"
                >
                  <X size={24} />
                </button>
              )}

              {/* Floating Page Counter in Fullscreen */}
              {isFullScreen && totalPages > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black/60 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium border border-white/10 select-none pointer-events-none">
                  {currentPage} / {totalPages}
                </div>
              )}
              {/* Add blur effect */}
              <div className="flex-1 min-h-0 relative w-full transition-all duration-300">
                <Viewer
                  fileUrl={pdfFile || book.pdfUrl || getImageSrc(book.pdf)}
                  plugins={[
                    defaultLayoutPluginInstance,
                    pageNavigationPluginInstance,
                    apiPlugin,
                  ]}
                  defaultScale={SpecialZoomLevel.PageWidth}
                  viewMode={viewMode}
                  theme={{
                    theme: "dark",
                  }}
                  renderTextLayer={false}
                  renderAnnotationLayer={true}
                  onDocumentLoad={(e) => {
                    const numPages = e.doc.numPages;
                    setTotalPages(numPages);

                    // Save page count to localStorage for BookDetails
                    localStorage.setItem(
                      `book_${bookId}_pages`,
                      numPages.toString(),
                    );

                    // Manually jump to initialPage to ensure it syncs correctly on load
                    if (initialPage >= 0 && jumpToPage) {
                      setTimeout(() => jumpToPage(initialPage), 50);
                    }
                  }}
                  onPageChange={(e) => {
                    const newPage = e.currentPage;
                    setCurrentPage(newPage + 1);
                    if (parentOnPageChange) parentOnPageChange(newPage);
                  }}
                  initialPage={initialPage}
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

        {/* Translation Popup Overlay - restricted inside PDF scope */}
        {translationPopup.visible && (
          <div
            id="translation-popup"
            className={
              translationPopup.status === "idle"
                ? "absolute z-[70] transform -translate-x-1/2 -translate-y-full pb-3 shadow-2xl transition-all duration-300 pointer-events-auto"
                : "absolute inset-0 z-[80] flex items-center justify-center bg-black/60 pointer-events-auto animate-in fade-in duration-200"
            }
            style={
              translationPopup.status === "idle"
                ? {
                    left: `${translationPopup.x}px`,
                    top: `${translationPopup.y}px`,
                  }
                : {}
            }
            onMouseDown={
              translationPopup.status === "idle"
                ? (e) => e.stopPropagation()
                : undefined
            }
            onClick={
              translationPopup.status !== "idle"
                ? () =>
                    setTranslationPopup((prev) => ({ ...prev, visible: false }))
                : undefined
            }
          >
            {translationPopup.status === "idle" ? (
              <button
                onClick={handleTranslate}
                className="cursor-pointer touch-area bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-full shadow-lg flex items-center justify-center transform hover:scale-105 active:scale-95 transition-all outline-none border-2 border-indigo-300 dark:border-indigo-800"
                title={t("Translate selected text")}
              >
                <Globe size={22} />
              </button>
            ) : (
              <div
                className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 p-5 md:p-6 rounded-2xl shadow-2xl w-11/12 max-w-lg relative animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() =>
                    setTranslationPopup((prev) => ({ ...prev, visible: false }))
                  }
                  className="cursor-pointer absolute top-4 left-3 p-2 mb-4 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white rounded-md dark:hover:bg-white/10 transition-colors"
                  title={t("Close translation")}
                >
                  <X size={20} />
                </button>

                <div dir="rtl" className="flex flex-col gap-4 mt-6">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-base font-semibold mb-2">
                    <Globe size={20} />
                    <span>{t("Translation")}</span>
                  </div>

                  {translationPopup.status === "loading" ? (
                    <div
                      dir={i18n.dir()}
                      className="text-gray-600 dark:text-gray-300 flex items-center gap-3 py-6 justify-center"
                    >
                      <Loader
                        size={26}
                        className="animate-spin text-indigo-500"
                      />
                      <span className="text-base font-medium">
                        {t("Translating...")}
                      </span>
                    </div>
                  ) : translationPopup.status === "success" ? (
                    <p className="text-gray-900 dark:text-white text-base md:text-lg leading-relaxed max-h-[60vh] overflow-y-auto fancy-scrollbar select-text pb-2">
                      {translationPopup.translatedText}
                    </p>
                  ) : (
                    <p className="text-red-500 dark:text-red-400 text-base font-medium py-4 text-center">
                      {translationPopup.translatedText}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals synced with pages/PdfViewer style */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Please login or create an account to continue reading"
        icon={
          <BookOpen className="w-16 h-16 mx-auto text-indigo-600 dark:text-indigo-400" />
        }
      />

      {showAddToCartModal && book && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-xl max-w-sm w-full border border-gray-200 dark:border-zinc-700 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-3 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                <FaCartPlus size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("Enjoying")}
                </h3>
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-300">
                  {book.title}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t("Would you like to add this book to your cart now?")}
              </p>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setShowAddToCartModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                >
                  {t("Later")}
                </button>
                <button
                  onClick={() => {
                    handleAddToCart(book);
                    setShowAddToCartModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 cursor-pointer"
                >
                  {isBookInCart ? t("Go to Checkout") : t("Add to Cart")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
