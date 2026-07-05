/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { submitAuthorBook } from "../../api/adminApi";
import { getCategories } from "../../api/categoriesApi";
import imageCompression from "browser-image-compression";
import {
  BookOpenIcon,
  ClockIcon,
  PencilIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { DollarSign, AlertTriangle, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "../../context/NavigationContext";
import TutorialTour, { TutorialButton } from "../../components/TutorialTour";

/* ─────────────────────────────────────────────
   SignatureModal — canvas-based digital signing
───────────────────────────────────────────── */
const SignatureModal = ({
  bookTitle,
  authorName,
  price,
  onConfirm,
  onCancel,
}) => {
  const canvasRef = useRef(null);
  const pdfAreaRef = useRef(null);
  const sigRef = useRef(null);
  const dragOrigin = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [sigPos, setSigPos] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signature, setSignature] = useState(null);
  const { t, i18n } = useTranslation();

  const [step, setStep] = useState(1);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e1e2e";
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setHasDrawn(true);
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    e?.preventDefault();
    if (!isDrawing) return;
    setIsDrawing(false);
    setSignature(canvasRef.current.toDataURL("image/png"));
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    setHasDrawn(false);
    setSignature(null);
  };

  const handlePreview = async () => {
    setIsPreviewLoading(true);
    try {
      const { previewAuthorBookContract } = await import("../../api/adminApi");
      // Generate contract WITHOUT embedded signature — only the overlay is shown
      const res = await previewAuthorBookContract({
        title: bookTitle,
        price: price || 0,
      });
      setPdfPreviewUrl(res.pdfUrl);
      setSigPos(null);
      setStep(2);
    } catch (err) {
      alert(t("Failed to generate contract preview."));
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Place signature at the "Author Signature:" label position in the PDF
  // PDF: Author Signature label is ~59% from top, ~8% from left (x=50 of 595pt)
  useEffect(() => {
    if (step !== 2) return;
    const frame = pdfAreaRef.current;
    if (!frame) return;
    const { width: w, height: h } = frame.getBoundingClientRect();
    setSigPos({ x: Math.round(w * 0.08), y: Math.round(h * 0.6) });
  }, [step]);

  // Drag: global pointermove / pointerup
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      e.preventDefault();
      const sig = sigRef.current;
      const con = pdfAreaRef.current;
      if (!sig || !con || !dragOrigin.current) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const conR = con.getBoundingClientRect();
      const sigR = sig.getBoundingClientRect();
      let nx = dragOrigin.current.sx + (cx - dragOrigin.current.cx);
      let ny = dragOrigin.current.sy + (cy - dragOrigin.current.cy);
      nx = Math.max(0, Math.min(nx, conR.width - sigR.width));
      ny = Math.max(0, Math.min(ny, conR.height - sigR.height));
      setSigPos({ x: nx, y: ny });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging]);

  const handleSigPointerDown = (e) => {
    e.preventDefault();
    if (!sigRef.current || !pdfAreaRef.current || !sigPos) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    dragOrigin.current = { cx, cy, sx: sigPos.x, sy: sigPos.y };
    setDragging(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        dir={i18n.dir()}
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${
          step === 2 ? "max-w-3xl" : "max-w-lg"
        } overflow-y-auto transition-all`}
        style={step === 2 ? { maxHeight: "95vh" } : {}}
      >
        {/* Header */}
        <div className="bg-indigo-600 dark:bg-indigo-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white dark:text-gray-200">
            <PencilIcon className="h-5 w-5" />
            <h2 className="font-bold text-lg">
              {step === 1 ? t("Digital Signing") : t("Contract Preview")}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-white/70 dark:text-gray-200 hover:text-white dark:hover:text-gray-200 cursor-pointer"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {step === 1 ? (
            <>
              {/* Contract summary */}
              <div className="bg-indigo-50 dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 text-sm text-indigo-800 dark:text-indigo-200 space-y-1">
                <p className="font-semibold text-indigo-900 dark:text-indigo-100">
                  {t("Publishing Contract")}
                </p>
                <p>
                  {t("Book")}: <span className="font-medium">{bookTitle}</span>
                </p>
                <p>
                  {t("Author Name")}:{" "}
                  <span className="font-medium">{authorName}</span>
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-2 leading-relaxed">
                  {t(
                    "By signing, you confirm that you own the copyright of this book and agree to Bookfly's publishing terms including a 20% platform commission.",
                  )}
                </p>
              </div>

              {/* Canvas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t("Draw your signature below")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={150}
                    className="w-full h-[150px] rounded-xl cursor-crosshair touch-none"
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  {!hasDrawn && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none">
                      {t("Sign here...")}
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-400">
                    {t("Use your mouse or finger to draw your signature")}
                  </p>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-600 cursor-pointer font-medium"
                  >
                    {t("Clear")}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="cursor-pointer flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors text-sm"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="button"
                  disabled={!signature || isPreviewLoading}
                  onClick={handlePreview}
                  className="cursor-pointer flex-1 py-2.5 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPreviewLoading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <CheckCircleIcon className="h-4 w-4" />
                  )}
                  {isPreviewLoading
                    ? t("Generating...")
                    : t("Preview Contract")}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Hint bar */}
              <div className="bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800 rounded-lg px-4 py-2 flex items-center gap-2">
                <PencilIcon className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                  {t("Drag your signature to any position on the contract")}
                </p>
              </div>

              {/* PDF + draggable signature overlay — A4 aspect ratio shows full page */}
              <div
                ref={pdfAreaRef}
                className="relative border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 w-full"
                style={{ aspectRatio: "595 / 842" }}
              >
                <iframe
                  src={pdfPreviewUrl}
                  className="w-full h-full border-0"
                  title="Contract Preview"
                />

                {sigPos && (
                  <div
                    ref={sigRef}
                    onPointerDown={handleSigPointerDown}
                    onTouchStart={handleSigPointerDown}
                    style={{
                      position: "absolute",
                      left: sigPos.x,
                      top: sigPos.y,
                      cursor: dragging ? "grabbing" : "grab",
                      userSelect: "none",
                      touchAction: "none",
                      zIndex: 20,
                    }}
                  >
                    {/* Dashed square */}
                    <div
                      style={{
                        border: dragging
                          ? "2px solid #6366f1"
                          : "2px dashed #6366f1",
                        borderRadius: "8px",
                        padding: "6px",
                        background: "rgba(255,255,255,0.93)",
                        backdropFilter: "blur(3px)",
                        boxShadow: dragging
                          ? "0 0 0 3px rgba(99,102,241,0.25),0 4px 14px rgba(0,0,0,0.18)"
                          : "0 2px 8px rgba(0,0,0,0.13)",
                        transition: "border 0.15s,box-shadow 0.15s",
                      }}
                    >
                      <img
                        src={signature}
                        alt="Signature"
                        draggable={false}
                        style={{
                          display: "block",
                          maxHeight: "60px",
                          maxWidth: "160px",
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                    {/* Badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "-9px",
                        right: "-9px",
                        background: "#6366f1",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.28)",
                        pointerEvents: "none",
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M12 2L9 5h2v4H7V7l-3 3 3 3v-2h4v4H9l3 3 3-3h-2v-4h4v2l3-3-3-3v2h-4V5h2z" />
                      </svg>
                    </div>
                    {/* Label */}
                    {!dragging && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-20px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          whiteSpace: "nowrap",
                          fontSize: "10px",
                          color: "#6366f1",
                          fontWeight: 600,
                          background: "rgba(255,255,255,0.88)",
                          borderRadius: "4px",
                          padding: "1px 5px",
                          pointerEvents: "none",
                        }}
                      >
                        ✦ {t("drag to reposition")}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                {t(
                  "Please review your generated contract before final submission.",
                )}
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="cursor-pointer flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors text-sm"
                >
                  {t("Back to Edit Signature")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const con = pdfAreaRef.current;
                    const r = con
                      ? con.getBoundingClientRect()
                      : { width: 1, height: 1 };
                    onConfirm(signature, {
                      xPercent: Math.round((sigPos.x / r.width) * 100),
                      yPercent: Math.round((sigPos.y / r.height) * 100),
                    });
                  }}
                  className="cursor-pointer flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  {t("Publish Book")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   AddAuthorBook — main component
───────────────────────────────────────────── */

const AUTHOR_TOUR_KEY = "author_add_book_tour_done";

const AUTHOR_BOOK_STEPS = [
  {
    target: "#author-tour-header",
    title: "Publish Your Book",
    content: "Welcome! This form lets you submit a book for publication. After filling in the details, an admin will review it before it goes live to readers.",
    placement: "bottom",
  },
  {
    target: "#author-tour-pending-notice",
    title: "Review Process",
    content: "Important: your book won't be immediately visible. It enters a 'Pending' state until our admin team reviews and approves the content.",
    placement: "bottom",
  },
  {
    target: "#author-tour-title",
    title: "Book Title",
    content: "Enter the full title of your book as you want it to appear in the store.",
    placement: "bottom",
  },
  {
    target: "#author-tour-price",
    title: "Set Your Price",
    content: "Set the price in EGP. Note: Bookfly takes a 20% platform commission — you receive 80% of each sale.",
    placement: "bottom",
  },
  {
    target: "#author-tour-category",
    title: "Choose Categories",
    content: "Select all relevant categories. This helps readers find your book through search and filters.",
    placement: "top",
  },
  {
    target: "#author-tour-description",
    title: "Book Description",
    content: "Write an engaging description. This is one of the biggest factors in convincing readers to buy your book!",
    placement: "top",
  },
  {
    target: "#author-tour-cover",
    title: "Cover Image",
    content: "Upload a high-quality cover image (recommended 600x900 px). A great cover dramatically increases click-through rates.",
    placement: "top",
  },
  {
    target: "#author-tour-pdf",
    title: "Upload PDF",
    content: "Upload the full manuscript as a PDF. Readers access it through Bookfly's built-in viewer after purchase.",
    placement: "top",
  },
  {
    target: "#author-tour-submit",
    title: "Submit & Sign",
    content: "Click 'Submit for Review' to open the digital signature step. You'll draw your signature and review a publishing contract before final submission.",
    placement: "top",
  },
];

const AddAuthorBook = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [formData, setFormData] = useState(null); // stores prepared FormData
  const { t, i18n } = useTranslation();
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  const {
    registerBlocker,
    showWarningModal,
    pendingPath,
    confirmLeave,
    cancelLeave,
  } = useNavigation();

  // Register blocker with navigation context
  useEffect(() => {
    registerBlocker(isDirty, null);
    return () => registerBlocker(false, null);
  }, [isDirty, registerBlocker]);

  // Handle navigation context modal
  useEffect(() => {
    if (showWarningModal && pendingPath) {
      setShowLeaveModal(true);
      setPendingNavigation(pendingPath);
    }
  }, [showWarningModal, pendingPath]);

  // Handle browser back button
  useEffect(() => {
    if (!isDirty) return;
    const handlePopState = (e) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.pathname);
      setShowLeaveModal(true);
      setPendingNavigation("back");
    };
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isDirty]);

  // Handle browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleLeave = () => {
    setIsDirty(false);
    setShowLeaveModal(false);
    if (showWarningModal) {
      const path = confirmLeave();
      if (path) navigate(path);
    } else if (pendingNavigation === "back") {
      window.history.go(-2);
    } else if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setPendingNavigation(null);
  };

  const handleStay = () => {
    setShowLeaveModal(false);
    setPendingNavigation(null);
    if (showWarningModal) cancelLeave();
  };

  // Auto-start tour for first-time visitors
  useEffect(() => {
    const seen = localStorage.getItem(AUTHOR_TOUR_KEY);
    if (!seen) {
      const timer = setTimeout(() => setShowTour(true), 700);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  // Step 1: validate + prepare data, then show signature modal
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(e.target);

    if (selectedCategories.length === 0) {
      alert(t("Please select at least one category."));
      return;
    }

    // Compress image
    let compressedImage = null;
    if (data.get("image")?.size > 0) {
      const imageFile = data.get("image");
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      };
      const compressed = await imageCompression(imageFile, options);
      compressedImage = new File([compressed], imageFile.name, {
        type: imageFile.type,
      });
    }

    // Store form state so we can use it after signature
    setFormData({ data, compressedImage });
    setShowSignModal(true);
  };

  // Step 2: user draws + positions signature → submit everything
  const handleSignatureConfirm = async (signatureBase64, sigPosition) => {
    setShowSignModal(false);
    setIsUploading(true);

    try {
      const { data, compressedImage } = formData;
      const bookData = new FormData();

      ["title", "author", "description", "year", "isbn", "edition"].forEach(
        (f) => bookData.append(f, data.get(f)),
      );

      selectedCategories.forEach((id) => bookData.append("categories", id));
      bookData.append("price", parseFloat(data.get("price") || 0));
      bookData.append("signature", signatureBase64);

      // Pass signature position so backend places it at the right spot in the PDF
      if (sigPosition) {
        bookData.append("signatureX", sigPosition.xPercent);
        bookData.append("signatureY", sigPosition.yPercent);
      }

      if (compressedImage)
        bookData.append("image", compressedImage, compressedImage.name);
      if (data.get("pdf")?.size > 0) bookData.append("pdf", data.get("pdf"));

      await submitAuthorBook(bookData);
      setIsDirty(false);
      navigate("/author-dashboard");
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          err.message ||
          t("Failed to submit book"),
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Read form title for the modal
  const [previewTitle, setPreviewTitle] = useState("");

  return (
    <div
      dir={i18n.dir()}
      className="min-h-screen bg-zinc-50  dark:bg-zinc-900 p-6"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {t("Publish New Book")}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1 mt-0.5">
              <ClockIcon className="h-4 w-4 text-amber-500" />
              {t("Your book will be reviewed by admin before going live")}
            </p>
          </div>
        </div>

        {/* Pending notice */}
        <div className="bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-600 rounded-xl px-5 py-3 flex items-start gap-3">
          <ClockIcon className="h-5 w-5 text-amber-500 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {t(
              "After submission, your book will appear as Pending in your dashboard until an admin approves it. Only approved books are visible to readers.",
            )}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 p-6">
          <form
            onSubmit={handleFormSubmit}
            onChange={() => setIsDirty(true)}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center border-b border-gray-200 dark:border-gray-600 pb-2">
                <BookOpenIcon className="h-5 w-5 mr-2 text-indigo-600" />
                {t("Book Information")}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {t("Title")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    required
                    onChange={(e) => setPreviewTitle(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-gray-200  px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder={t("Enter book title")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {t("Author Name")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="author"
                    required
                    defaultValue={user?.name || ""}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-gray-200  px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Enter author name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {t("Price")} ({t("EGP")}){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      className="w-full border border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-gray-200  px-4 py-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {t("Publication Year")}
                  </label>
                  <input
                    name="year"
                    type="number"
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-gray-200  px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder={new Date().getFullYear()}
                    min="1000"
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    ISBN
                  </label>
                  <input
                    name="isbn"
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-gray-200  px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="ISBN"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {t("Edition")}
                  </label>
                  <input
                    name="edition"
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-gray-200  px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="e.g. 2nd"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t("Categories")} <span className="text-red-500">*</span>
                  </label>
                  <div className="rounded-lg bg-white dark:bg-zinc-800">
                    {categories.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("Loading categories...")}
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {categories.map((c) => {
                          const isSelected = selectedCategories.includes(c._id);
                          return (
                            <button
                              key={c._id}
                              type="button"
                              onClick={() => toggleCategory(c._id)}
                              className={`touch-area px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer font-medium text-sm ${
                                isSelected
                                  ? "bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 text-white shadow-md scale-105"
                                  : "bg-white dark:bg-zinc-700 border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-gray-300 hover:border-indigo-400 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-zinc-600"
                              }`}
                            >
                              {t(c.name)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {selectedCategories.length > 0 && (
                    <p
                      dir="auto"
                      className="text-xs text-indigo-600 dark:text-indigo-200 mt-2"
                    >
                      {selectedCategories.length} {t("category selected")}
                    </p>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {t("Description")} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    required
                    rows="4"
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-gray-200  px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                    placeholder={t("Enter book description...")}
                  />
                </div>
              </div>
            </div>

            {/* Files */}
            <div className="border-t border-gray-200 dark:border-gray-600 dark:bg-zinc-700 dark:text-gray-200  pt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                {t("Files & Media")}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-gray-200  rounded-xl p-6 text-center hover:border-indigo-500 transition-colors bg-gray-50">
                  <label className="block cursor-pointer">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      {t("Cover Image")} <span className="text-red-500">*</span>
                    </div>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      required
                      className="w-full text-sm text-gray-500 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-200 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {t("Recommended: 600×900px, max 5MB")}
                    </p>
                  </label>
                </div>

                <div className="cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-gray-200  rounded-xl p-6 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors bg-gray-50 dark:bg-zinc-700">
                  <label className="block cursor-pointer">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      {t("PDF File")} <span className="text-red-500">*</span>
                    </div>
                    <input
                      type="file"
                      name="pdf"
                      accept="application/pdf"
                      required
                      className="w-full text-sm text-gray-500 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-200 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {t("Upload the complete book in PDF format")}
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {/* Signature notice */}
            <div className="bg-indigo-50 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-600 rounded-xl px-5 py-3 flex items-start gap-3">
              <PencilIcon className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-indigo-700 dark:text-indigo-200">
                {t(
                  "You will be asked to sign a digital publishing contract before submitting.",
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-2">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => navigate("/author-dashboard")}
                className="cursor-pointer px-6 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-gray-200  text-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors disabled:opacity-50"
              >
                {t("Cancel")}
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="cursor-pointer px-6 py-2.5 bg-indigo-600 text-white dark:text-gray-200 rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    {t("Uploading")}
                    {"..."}
                  </>
                ) : (
                  <>
                    <PencilIcon className="h-4 w-4" />
                    {t("Sign & Publish")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignModal && (
        <SignatureModal
          bookTitle={formData?.data.get("title") || previewTitle}
          authorName={user?.name}
          price={formData?.data.get("price") || 0}
          onConfirm={handleSignatureConfirm}
          onCancel={() => setShowSignModal(false)}
        />
      )}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            dir={i18n.dir()}
            className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {t("Unsaved Changes")}
                </h3>
              </div>
              <button
                onClick={handleStay}
                className="touch-area text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t(
                "You have unsaved book information. If you leave this page, all your entered data will be lost.",
              )}
            </p>

            <div dir="rtl" className="flex gap-3">
              <button
                onClick={handleStay}
                className="touch-area flex-1 px-4 py-3 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
              >
                {t("Stay on Page")}
              </button>
              <button
                onClick={handleLeave}
                className="touch-area flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors cursor-pointer"
              >
                {t("Leave Page")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddAuthorBook;
