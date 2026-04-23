/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, forwardRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCartPlus, FaShoppingCart } from "react-icons/fa";
import {
  X,
  Menu,
  ShoppingCart,
  Home,
  Store,
  Maximize,
  Minimize,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Globe,
  Loader,
  Grid3X3,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist";
import toast from "react-hot-toast";
import api from "../api/api";
import { updateReadingProgress } from "../api/ordersApi";
import Loading from "../components/Loading";
import RateModal from "../components/RateModal";
import AuthModal from "../components/AuthModal";
import { useTranslation } from "react-i18next";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../context/AuthContext";
import { getImageSrc } from "../utils/imageUtils";
import "../css/flipbook.css";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

const PREVIEW_PAGE_LIMIT = 5;

const FlipPage = forwardRef(
  (
    { image, pageNumber, isBlurred, isCover, isBack, bookTitle, coverSrc, onFlipTo },
    ref,
  ) => {
    const src = typeof image === "string" ? image : image?.src;
    const links = image && typeof image === "object" ? image.links || [] : [];

    return (
      <div
        ref={ref}
        className="flipbook-page"
        data-density={isCover || isBack ? "hard" : "soft"}
      >
        <div
          className={`flipbook-page-inner${isCover ? " is-cover" : ""}${isBack ? " is-back-cover" : ""}`}
        >
          {isCover ? (
            <div className="flipbook-cover">
              {coverSrc && (
                <img
                  src={coverSrc}
                  alt={bookTitle}
                  className="flipbook-cover-image"
                />
              )}
              <div className="flipbook-cover-overlay">
                <h2 className="flipbook-cover-title">{bookTitle}</h2>
              </div>
            </div>
          ) : isBack ? (
            <div className="flipbook-back-cover">
              <BookOpen size={40} />
              <p>— ✦ —</p>
            </div>
          ) : (
            <>
              {src ? (
                <>
                  <img
                    src={src}
                    alt={`Page ${pageNumber}`}
                    className="flipbook-page-image"
                    draggable={false}
                  />
                  {!isBlurred &&
                    links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url || "#"}
                        target={link.url ? "_blank" : undefined}
                        rel={link.url ? "noopener noreferrer" : undefined}
                        title={link.url || `Go to page ${link.targetPage}`}
                        className="flipbook-pdf-link"
                        style={{
                          position: "absolute",
                          left: `${link.left}%`,
                          top: `${link.top}%`,
                          width: `${link.width}%`,
                          height: `${link.height}%`,
                          zIndex: 10,
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (link.url) {
                            window.open(link.url, "_blank");
                          } else if (link.targetPage && onFlipTo) {
                            onFlipTo(link.targetPage);
                          }
                        }}
                      >
                        <span className="sr-only">Link</span>
                      </a>
                    ))}
                </>
              ) : (
                <div className="flipbook-page-loading">
                  <Loader className="animate-spin" size={28} />
                </div>
              )}
              {isBlurred && <div className="flipbook-page-blur" />}
              <div className="flipbook-page-number">{pageNumber}</div>
            </>
          )}
        </div>
      </div>
    );
  },
);
FlipPage.displayName = "FlipPage";

const PdfViewer = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { addToCart, cartItems, isBookPurchased, purchasedBooks, updatePurchasedBookProgress } = useCart();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageImages, setPageImages] = useState([]);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfReady, setPdfReady] = useState(false);
  // Restore last-read page from DB
  const savedStartPage = (() => {
    if (!purchasedBooks || purchasedBooks.length === 0) return 0;
    const pBook = purchasedBooks.find(b => String(b._id || b.id) === String(bookId));
    return pBook?.lastReadPage || 0;
  })();

  const [currentPage, setCurrentPage] = useState(savedStartPage);
  
  // Ref to ensure we only jump to savedStartPage once
  const hasJumpedRef = useRef(false);

  // Sync flipbook with saved page when it's fully ready
  useEffect(() => {
    if (pdfReady && savedStartPage > 0 && !hasJumpedRef.current) {
      // Small delay to let HTMLFlipBook finish its internal initialization
      const timer = setTimeout(() => {
        if (flipBookRef.current?.pageFlip()) {
          try {
            flipBookRef.current.pageFlip().turnToPage(savedStartPage);
            setCurrentPage(savedStartPage);
            hasJumpedRef.current = true;
          } catch (e) { /* ignore */ }
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pdfReady, savedStartPage]);
  const [totalPages, setTotalPages] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [bookDimensions, setBookDimensions] = useState({ w: 400, h: 560 });

  const flipBookRef = useRef(null);
  const containerRef = useRef(null);
  const viewportRef = useRef(null);
  // Stable ref so the PDF effect never re-runs just because isBookPurchased changed reference
  const purchasedRef = useRef(false);

  // Fetch book data
  useEffect(() => {
    if (!bookId) return;
    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/books/${bookId}`);
        const data = res.data?.data || res.data;
        if (data?.pdf) {
          try {
            const pdfRes = await api.get(`/books/${bookId}/preview`);
            if (pdfRes.data?.success && pdfRes.data?.data?.url)
              data.pdfUrl = pdfRes.data.data.url;
          } catch (e) {
            console.error("PDF URL error:", e);
          }
        }
        setBook(data);
      } catch (e) {
        console.error("Fetch book error:", e);
        setError(t("Failed to load book data"));
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookId, t]);

  // Page title
  useEffect(() => {
    if (book?.title) document.title = `${book.title} : ${t("Bookfly Store")}`;
    return () => {
      document.title = t("Bookfly Store - Buy your favorite books online");
    };
  }, [book, t]);

  // Sync purchased status into the ref whenever book or cart changes (no effect re-run)
  useEffect(() => {
    purchasedRef.current = !!(book && isBookPurchased(book._id || book.id));
  }, [book, isBookPurchased]);

  // Determine if user is authorized to read the full book (purchased, author, or admin)
  const isAuthorized = useMemo(() => {
    if (!book) return false;
    if (isBookPurchased(book._id || book.id)) return true;
    if (user?.role === "admin") return true;
    if (user && book.submittedBy) {
      const authorId = typeof book.submittedBy === 'object' ? book.submittedBy._id || book.submittedBy.id : book.submittedBy;
      if (authorId === user._id || authorId === user.id) return true;
    }
    return false;
  }, [book, isBookPurchased, user]);

  // Automatically close modals if authorized becomes true
  useEffect(() => {
    if (isAuthorized) {
      setShowAddToCartModal(false);
      setShowAuthModal(false);
    }
  }, [isAuthorized]);

  // Render PDF pages to images
  useEffect(() => {
    if (!book?.pdf) return;
    let cancelled = false;
    let currentXhr = null;

    const renderPdf = async () => {
      try {
        const pdfStreamUrl = `/api/books/${bookId}/pdf-stream`;
        const purchased = purchasedRef.current;
        const cacheName = "bookfly-purchased-books";

        let pdfData = null;

        // Try cache for purchased books
        if (purchased) {
          try {
            const cache = await caches.open(cacheName);
            const cachedRes = await cache.match(pdfStreamUrl);
            if (cachedRes) pdfData = new Uint8Array(await cachedRes.arrayBuffer());
          } catch { /* cache unavailable */ }
        }

        // Fetch from server if not in cache
        if (!pdfData) {
          pdfData = await new Promise((resolve, reject) => {
            currentXhr = new XMLHttpRequest();
            currentXhr.open("POST", pdfStreamUrl, true);
            currentXhr.responseType = "arraybuffer";
            currentXhr.withCredentials = true;
            // Track real download progress when Content-Length is known
            currentXhr.onprogress = (e) => {
              if (e.lengthComputable) {
                // Map download to 0–50% so rendering gets the other 50%
                setPdfProgress(Math.round((e.loaded / e.total) * 50));
              }
            };
            currentXhr.onload = () => {
              if (currentXhr.status >= 200 && currentXhr.status < 300) {
                setPdfProgress(50); // download done
                resolve(new Uint8Array(currentXhr.response));
              } else {
                reject(new Error(`PDF fetch failed: ${currentXhr.status}`));
              }
            };
            currentXhr.onerror = () => reject(new Error("Network error fetching PDF"));
            currentXhr.onabort = () => reject(new Error("Request aborted"));
            currentXhr.send();
          });

          // Cache it for next time (purchased only)
          if (purchased) {
            try {
              const cache = await caches.open(cacheName);
              await cache.put(pdfStreamUrl, new Response(pdfData));
            } catch { /* cache write failed, not critical */ }
          }
        }

        if (cancelled) return;
        const doc = await pdfjsLib.getDocument({ data: pdfData }).promise;
        if (cancelled) return;

        const numPages = doc.numPages;
        setTotalPages(numPages);
        localStorage.setItem(`book_${bookId}_pages`, numPages.toString());

        const firstPage = await doc.getPage(1);
        const vp0 = firstPage.getViewport({ scale: 1 });
        setBookDimensions((prev) => ({ ...prev, aspect: vp0.width / vp0.height }));

        // ── Phase 1: Render pages in parallel batches of 4 ───────────────
        const scale = 1.5;
        const BATCH = 4;
        const imgs = new Array(numPages).fill(null);
        setPageImages([...imgs]);

        const renderOnePage = async (i) => {
          if (cancelled) return;
          const page = await doc.getPage(i + 1);
          const vp = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = vp.width;
          canvas.height = vp.height;
          await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
          if (cancelled) return;
          const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.85));
          if (cancelled) return;
          imgs[i] = { src: URL.createObjectURL(blob), links: [] };
          setPageImages([...imgs]);
          // Rendering maps to 50–100% (download was 0–50%)
          setPdfProgress(50 + Math.round(((i + 1) / numPages) * 50));
          // Show the flipbook as soon as page 1 is ready
          if (i === 0 && !cancelled) setPdfReady(true);
        };

        for (let start = 0; start < numPages; start += BATCH) {
          if (cancelled) return;
          const end = Math.min(start + BATCH, numPages);
          await Promise.all(
            Array.from({ length: end - start }, (_, j) => renderOnePage(start + j))
          );
        }
        if (!cancelled) setPdfReady(true);

        // ── Phase 2: Load link annotations silently in background ─────────
        for (let i = 0; i < numPages; i++) {
          if (cancelled) return;
          try {
            const page = await doc.getPage(i + 1);
            const vp = page.getViewport({ scale });
            const annotations = await page.getAnnotations();
            const links = [];
            for (const a of annotations) {
              if (a.subtype !== "Link") continue;
              const rect = vp.convertToViewportRectangle(a.rect);
              const x1 = Math.min(rect[0], rect[2]);
              const y1 = Math.min(rect[1], rect[3]);
              const x2 = Math.max(rect[0], rect[2]);
              const y2 = Math.max(rect[1], rect[3]);
              let url = a.url || null;
              let targetPage = null;
              if (!url && a.dest) {
                try {
                  const dest = typeof a.dest === "string"
                    ? await doc.getDestination(a.dest)
                    : a.dest;
                  if (dest?.[0]) targetPage = (await doc.getPageIndex(dest[0])) + 1;
                } catch { /* silent */ }
              }
              if (url || targetPage) {
                links.push({
                  url, targetPage,
                  left: (x1 / vp.width) * 100,
                  top: (y1 / vp.height) * 100,
                  width: ((x2 - x1) / vp.width) * 100,
                  height: ((y2 - y1) / vp.height) * 100,
                });
              }
            }
            if (links.length > 0 && imgs[i]) {
              imgs[i] = { ...imgs[i], links };
              setPageImages((prev) => {
                const next = [...prev];
                next[i] = imgs[i];
                return next;
              });
            }
          } catch { /* best-effort — silently skip */ }
        }
      } catch (e) {
        if (cancelled) return; // user navigated away — not an error
        console.error("PDF render error:", e);
        toast.error(t("Failed to load PDF. Please try again."), {
          duration: 4000,
          style: { background: "#333", color: "#fff", direction: i18n.dir() },
        });
      }
    };

    renderPdf();
    return () => {
      cancelled = true;
      if (currentXhr) currentXhr.abort();
    };
   
  }, [book, bookId, t, i18n]);

  // Calculate flipbook dimensions
  const calcDimensions = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const availH = rect.height - 80;
    const availW = rect.width - 40;
    const aspect = bookDimensions.aspect || 400 / 560;
    const isPortrait = window.innerWidth < 768;
    const spreadW = isPortrait ? 1 : 2;
    let pageH = availH;
    let pageW = pageH * aspect;
    if (pageW * spreadW > availW) {
      pageW = availW / spreadW;
      pageH = pageW / aspect;
    }
    setBookDimensions((prev) => ({
      ...prev,
      w: Math.round(pageW),
      h: Math.round(pageH),
    }));
  }, [bookDimensions.aspect]);

  useEffect(() => {
    calcDimensions();
  }, [pdfReady, calcDimensions]);
  useEffect(() => {
    window.addEventListener("resize", calcDimensions);
    return () => window.removeEventListener("resize", calcDimensions);
  }, [calcDimensions]);

  // Preview page limit enforcement & Progress sync
  useEffect(() => {
    if (currentPage > PREVIEW_PAGE_LIMIT && !isAuthorized) {
      if (flipBookRef.current)
        flipBookRef.current.pageFlip().turnToPage(PREVIEW_PAGE_LIMIT);
      if (!user) setShowAuthModal(true);
      else setShowAddToCartModal(true);
    }
    
    // Save last page to DB for purchased books (debounced)
    // Only save if currentPage > 0 and it's not the initial load where currentPage is just settling
    if (isAuthorized && currentPage > 0) {
      const timer = setTimeout(() => {
        updateReadingProgress(bookId, currentPage).catch(console.error);
        updatePurchasedBookProgress(bookId, currentPage);
      }, 1000); // 1-second debounce
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, book, user, bookId, isAuthorized]);

  // Fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) viewportRef.current?.requestFullscreen();
    else document.exitFullscreen?.();
  };
  useEffect(() => {
    const h = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  // Navigation
  const flipPrev = () => flipBookRef.current?.pageFlip()?.flipPrev();
  const flipNext = () => flipBookRef.current?.pageFlip()?.flipNext();
  const flipTo = (p) => {
    if (!isAuthorized && p > PREVIEW_PAGE_LIMIT) {
       flipBookRef.current?.pageFlip()?.turnToPage(PREVIEW_PAGE_LIMIT);
       setShowThumbnails(false);
       if (!user) setShowAuthModal(true);
       else setShowAddToCartModal(true);
       return;
    }
    flipBookRef.current?.pageFlip()?.turnToPage(p);
    setShowThumbnails(false);
  };

  // Zoom
  const zoomIn = () => setZoom((z) => Math.min(z + 0.2, 2.5));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));
  const zoomReset = () => setZoom(1);

  // Cart
  const isBookInCart =
    book &&
    cartItems?.some((i) =>
      [i.id, i._id].some((x) => [book.id, book._id].includes(x)),
    );
  const handleAddToCart = async (b) => {
    if (isBookInCart) {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      navigate("/checkout", { state: { books: cartItems } });
      return;
    }
    const result = await addToCart(b);
    if (result?.success) {
      toast.success(`${t("Added")} "${b.title}" ${t("to Cart")}!`, {
        duration: 1500,
        style: { background: "#333", color: "#fff", direction: i18n.dir() },
      });
      setTimeout(() => {
        toast(
          (tT) => (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {t("Do you want to checkout?")}
              </span>
              <button
                onClick={() => {
                  toast.dismiss(tT.id);
                  navigate(!user ? "/cart" : "/checkout", {
                    state: { books: [b] },
                  });
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 cursor-pointer"
              >
                {t("Go to Checkout")}
              </button>
            </div>
          ),
          {
            duration: 5000,
            style: { direction: i18n.dir(), background: "#333", color: "#fff" },
          },
        );
      }, 1500);
    }
  };

  // Close & Rate
  const handleCloseClick = () => {
    const uid = user?._id || user?.id || "guest";
    const rated = JSON.parse(localStorage.getItem(`ratedBooks_${uid}`) || "[]");
    if (!rated.includes(bookId)) setShowRateModal(true);
    else navigate(-1);
  };
  const handleRateSubmit = async (rating) => {
    try {
      await api.post(`/books/${bookId}/rate`, {
        rating,
        userId: user?._id || user?.id,
      });
      const uid = user?._id || user?.id || "guest";
      const key = `ratedBooks_${uid}`;
      const rated = JSON.parse(localStorage.getItem(key) || "[]");
      if (!rated.includes(bookId)) {
        rated.push(bookId);
        localStorage.setItem(key, JSON.stringify(rated));
      }
      toast.success(t("Thank you for your rating!"), {
        duration: 2000,
        style: { background: "#333", color: "#fff", direction: i18n.dir() },
      });
    } catch (e) {
      console.error("Rating error:", e);
    } finally {
      navigate(-1);
    }
  };

  const getAutoDir = (text = "") =>
    /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF]/.test(text.trim())
      ? "rtl"
      : "ltr";

  // Loading states
  if (loading)
    return (
      <div className="relative">
        <button
          dir="ltr"
          className="group absolute top-5 left-5 cursor-pointer flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl text-gray-900 dark:text-white transition-transform duration-300 hover:bg-gray-200 dark:hover:bg-white/20 hover:-translate-x-1"
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

  if (error || !book)
    return (
      <div className="relative">
        <button
          dir="ltr"
          className="group absolute top-5 left-5 cursor-pointer flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl text-gray-900 dark:text-white transition-transform duration-300 hover:bg-gray-200 dark:hover:bg-white/20 hover:-translate-x-1"
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

  const coverSrc = book.coverImage
    ? typeof book.coverImage === "string" && book.coverImage.startsWith("http")
      ? book.coverImage
      : getImageSrc(book.coverImage)
    : null;

  return (
    <div className="flipbook-viewport" ref={viewportRef}>
      {/* Header */}
      {!isFullScreen && (
        <div className="flipbook-header" dir="rtl">
          <button
            className="flipbook-header-btn"
            onClick={handleCloseClick}
            aria-label={t("Close")}
          >
            <X size={18} />
          </button>
          <h2 className="flipbook-header-title" dir={getAutoDir(book.title)}>
            {book.title}
          </h2>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="flipbook-header-btn" onClick={toggleFullScreen}>
              {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
            <button
              className="flipbook-header-btn"
              onClick={() => setShowHeader(!showHeader)}
            >
              {showHeader ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
          {/* Dropdown */}
          <div
            className={`flipbook-dropdown ${showHeader ? "open" : "closed"}`}
          >
            <div className="flipbook-dropdown-items" dir="ltr">
              <button
                className="flipbook-dropdown-item"
                onClick={() => {
                  navigate("/");
                  setShowHeader(false);
                }}
              >
                <Home size={18} />
                {t("Home")}
              </button>
              <button
                className="flipbook-dropdown-item"
                onClick={() => {
                  navigate("/shop");
                  setShowHeader(false);
                }}
              >
                <Store size={18} />
                {t("Shop")}
              </button>
              {!isAuthorized && (
                <>
                  <button
                    className="flipbook-dropdown-item"
                    onClick={() => handleAddToCart(book)}
                  >
                    {isBookInCart ? (
                      <>
                        <FaShoppingCart size={18} />
                        {t("Go to Checkout")}
                      </>
                    ) : (
                      <>
                        <FaCartPlus size={18} />
                        {t("Add to Cart")}
                      </>
                    )}
                  </button>
                  <button
                    className="flipbook-dropdown-item"
                    onClick={() => {
                      navigate("/cart");
                      setShowHeader(false);
                    }}
                  >
                    <ShoppingCart size={18} />
                    {t("View Cart")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Flipbook Area */}
      <div className="flipbook-area" ref={containerRef}>
        {/* PDF Loading */}
        {!pdfReady && book.pdf && (
          <div className="flipbook-loading-screen">
            <div className="flipbook-loading-book" />
            <div className="flipbook-loading-progress">
              <div className="flipbook-loading-bar">
                <div
                  className="flipbook-loading-fill"
                  style={{ width: `${pdfProgress}%` }}
                />
              </div>
              <div dir={i18n.dir()} className="flipbook-loading-text">
                {pdfProgress < 50
                  ? `${t("Downloading book...")} ${pdfProgress * 2}%`
                  : `${t("Loading book...")} ${(pdfProgress - 50) * 2}%`}
              </div>
            </div>
          </div>
        )}

        {/* Book */}
        {pdfReady && pageImages.length > 0 && (
          <>
            <div
              className="flipbook-book-wrapper"
              style={{ transform: `scale(${zoom})` }}
            >
              <HTMLFlipBook
                ref={flipBookRef}
                width={bookDimensions.w}
                height={bookDimensions.h}
                size="fixed"
                minWidth={200}
                maxWidth={800}
                minHeight={280}
                maxHeight={1120}
                showCover={true}
                flippingTime={800}
                usePortrait={window.innerWidth < 768}
                startPage={savedStartPage || 0}
                drawShadow={true}
                maxShadowOpacity={0.5}
                useMouseEvents={true}
                swipeDistance={30}
                showPageCorners={true}
                clickEventForward={false}
                mobileScrollSupport={false}
                onFlip={(e) => setCurrentPage(e.data)}
                className="flipbook-book"
              >
                {/* Cover */}
                <FlipPage
                  isCover
                  bookTitle={book.title}
                  coverSrc={coverSrc}
                  pageNumber={0}
                />
                {/* PDF Pages */}
                {pageImages.map((img, i) => (
                  <FlipPage
                    key={i}
                    image={img}
                    pageNumber={i + 1}
                    isBlurred={!isAuthorized && i >= PREVIEW_PAGE_LIMIT}
                    onFlipTo={flipTo}
                  />
                ))}
                {/* Back Cover */}
                <FlipPage isBack pageNumber={totalPages + 1} />
              </HTMLFlipBook>
            </div>

            {/* Nav Arrows */}
            <button
              className="flipbook-nav-arrow flipbook-nav-prev"
              onClick={flipPrev}
              aria-label={t("Previous")}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              className="flipbook-nav-arrow flipbook-nav-next"
              onClick={flipNext}
              aria-label={t("Next")}
            >
              <ChevronRight size={22} />
            </button>

            {/* Fullscreen Exit */}
            {isFullScreen && (
              <button
                onClick={toggleFullScreen}
                className="absolute top-4 left-4 z-50 p-2 bg-black/40 text-white rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm cursor-pointer"
              >
                <X size={22} />
              </button>
            )}
          </>
        )}

        {!book.pdf && (
          <div className="flex flex-col items-center gap-6 text-gray-300 p-16 bg-zinc-800 border border-zinc-700/30 rounded-2xl">
            <p>{t("No PDF file found for this book")}</p>
          </div>
        )}

        {/* Modals */}
        <RateModal
          isOpen={showRateModal}
          onClose={() => {
            setShowRateModal(false);
            navigate(-1);
          }}
          onSubmit={handleRateSubmit}
          bookTitle={book?.title || ""}
        />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          title="Please login or create an account to continue reading"
          icon={
            <BookOpen className="w-16 h-16 mx-auto text-indigo-600 dark:text-indigo-400" />
          }
        />
        {showAddToCartModal && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-xl max-w-sm w-full border border-gray-200 dark:border-zinc-700">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-3 text-indigo-600 dark:text-indigo-400">
                  <FaCartPlus size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t("Enjoying")}
                  </h3>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-300">
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

        {/* Thumbnails Panel */}
        {showThumbnails && (
          <>
            <div
              className="flipbook-thumbnails-overlay"
              onClick={() => setShowThumbnails(false)}
            />
            <div className="flipbook-thumbnails-panel">
              <div className="flipbook-thumbnails-header">
                <h3>{t("Pages")}</h3>
                <button
                  className="flipbook-thumbnails-close"
                  onClick={() => setShowThumbnails(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flipbook-thumbnails-grid">
                {pageImages.map((img, i) => {
                  const isPurchased = book && isBookPurchased(book._id || book.id);
                  if (!isPurchased && i >= PREVIEW_PAGE_LIMIT) return null;
                  
                  return (
                    img && (
                      <div
                        key={i}
                        className={`flipbook-thumbnail ${currentPage === i + 1 ? "active" : ""}`}
                        onClick={() => flipTo(i + 1)}
                      >
                        <img src={typeof img === "string" ? img : img.src} alt={`${i + 1}`} />
                        <div className="flipbook-thumbnail-number">{i + 1}</div>
                      </div>
                    )
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Toolbar */}
      {pdfReady && (
        <div className="flipbook-toolbar">
          <button
            className="flipbook-toolbar-btn"
            onClick={flipPrev}
            title={t("Previous")}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flipbook-page-indicator">
            <span>{Math.max(1, currentPage)}</span> / {totalPages}
          </div>
          <button
            className="flipbook-toolbar-btn"
            onClick={flipNext}
            title={t("Next")}
          >
            <ChevronRight size={18} />
          </button>
          <div className="flipbook-toolbar-divider" />
          <button
            className="flipbook-toolbar-btn"
            onClick={zoomOut}
            title={t("Zoom Out")}
          >
            <ZoomOut size={17} />
          </button>
          <button
            className="flipbook-toolbar-btn"
            onClick={zoomReset}
            title={t("Reset Zoom")}
          >
            <RotateCcw size={15} />
          </button>
          <button
            className="flipbook-toolbar-btn"
            onClick={zoomIn}
            title={t("Zoom In")}
          >
            <ZoomIn size={17} />
          </button>
          <div className="flipbook-toolbar-divider" />
          <button
            className={`flipbook-toolbar-btn ${showThumbnails ? "active" : ""}`}
            onClick={() => setShowThumbnails(!showThumbnails)}
            title={t("Pages")}
          >
            <Grid3X3 size={17} />
          </button>
          <button
            className="flipbook-toolbar-btn"
            onClick={toggleFullScreen}
            title={
              isFullScreen ? t("Exit Full Screen") : t("Enter Full Screen")
            }
          >
            {isFullScreen ? <Minimize size={17} /> : <Maximize size={17} />}
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
