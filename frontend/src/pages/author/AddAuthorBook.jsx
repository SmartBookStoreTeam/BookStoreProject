/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { submitAuthorBook } from "../../api/adminApi";
import { getCategories } from "../../api/categoriesApi";
import imageCompression from "browser-image-compression";
import { BookOpenIcon, ClockIcon, PencilIcon, XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

/* ─────────────────────────────────────────────
   SignatureModal — canvas-based digital signing
───────────────────────────────────────────── */
const SignatureModal = ({ bookTitle, authorName, price, onConfirm, onCancel }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
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
      const res = await previewAuthorBookContract({
        title: bookTitle,
        price: price || 0,
        signatureBase64: signature
      });
      setPdfPreviewUrl(res.pdfUrl);
      setStep(2);
    } catch (err) {
      alert(t("Failed to generate contract preview."));
    } finally {
      setIsPreviewLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div dir={i18n.dir()} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${step === 2 ? 'max-w-2xl' : 'max-w-lg'} overflow-hidden transition-all`}>
        {/* Header */}
        <div className="bg-indigo-600 dark:bg-indigo-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white dark:text-gray-200">
            <PencilIcon className="h-5 w-5" />
            <h2 className="font-bold text-lg">{step === 1 ? t("Digital Signature") : t("Contract Preview")}</h2>
          </div>
          <button onClick={onCancel} className="text-white/70 dark:text-gray-200 hover:text-white dark:hover:text-gray-200 cursor-pointer">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {step === 1 ? (
            <>
              {/* Contract summary */}
              <div className="bg-indigo-50 dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 text-sm text-indigo-800 dark:text-indigo-200 space-y-1">
                <p className="font-semibold text-indigo-900 dark:text-indigo-100">{t("Publishing Contract")}</p>
                <p>{t("Book")}: <span className="font-medium">{bookTitle}</span></p>
                <p>{t("Author Name")}: <span className="font-medium">{authorName}</span></p>
                <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-2 leading-relaxed">
                  {t("By signing, you confirm that you own the copyright of this book and agree to Bookfly's publishing terms including a 20% platform commission.")}
                </p>
              </div>

              {/* Canvas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t("Draw your signature below")} <span className="text-red-500">*</span>
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
                  <p className="text-xs text-gray-400">{t("Use your mouse or finger to draw your signature")}</p>
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
                  ) : <CheckCircleIcon className="h-4 w-4" />}
                  {isPreviewLoading ? t("Generating...") : t("Preview Contract")}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* PDF Preview Step */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden h-96 bg-gray-50 dark:bg-gray-800">
                <iframe src={pdfPreviewUrl} className="w-full h-full" title="Contract Preview" />
              </div>
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                {t("Please review your generated contract before final submission.")}
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
                  onClick={() => onConfirm(signature)}
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
const AddAuthorBook = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [formData, setFormData] = useState(null); // stores prepared FormData
  const { t, i18n } = useTranslation();

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
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1600, useWebWorker: true };
      const compressed = await imageCompression(imageFile, options);
      compressedImage = new File([compressed], imageFile.name, { type: imageFile.type });
    }

    // Store form state so we can use it after signature
    setFormData({ data, compressedImage });
    setShowSignModal(true);
  };

  // Step 2: user draws signature → submit everything
  const handleSignatureConfirm = async (signatureBase64) => {
    setShowSignModal(false);
    setIsUploading(true);

    try {
      const { data, compressedImage } = formData;
      const bookData = new FormData();

      ["title", "author", "description", "year", "isbn", "edition"].forEach((f) =>
        bookData.append(f, data.get(f))
      );

      selectedCategories.forEach((id) => bookData.append("categories", id));
      bookData.append("price", parseFloat(data.get("price") || 0));
      bookData.append("signature", signatureBase64);

      if (compressedImage) bookData.append("image", compressedImage, compressedImage.name);
      if (data.get("pdf")?.size > 0) bookData.append("pdf", data.get("pdf"));

      await submitAuthorBook(bookData);
      navigate("/author-dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || t("Failed to submit book"));
    } finally {
      setIsUploading(false);
    }
  };

  // Read form title for the modal
  const [previewTitle, setPreviewTitle] = useState("");

  return (
    <div dir={i18n.dir()} className="min-h-screen bg-zinc-50  dark:bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t("Publish New Book")}</h1>
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
            {t("After submission, your book will appear as Pending in your dashboard until an admin approves it. Only approved books are visible to readers.")}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 p-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
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
                    {t("Price")} ({t("EGP")}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-gray-200  px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ISBN</label>
                  <input
                    name="isbn"
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-gray-200  px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="ISBN"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t("Edition")}</label>
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
                  <div style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#818cf8 transparent",
                  }} className="border border-gray-300 dark:border-gray-600 dark:bg-zinc-700 dark:text-gray-200  rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                    {categories.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t("Loading categories...")}</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map((c) => (
                          <label
                            key={c._id}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              value={c._id}
                              checked={selectedCategories.includes(c._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCategories((prev) => [...prev, c._id]);
                                } else {
                                  setSelectedCategories((prev) => prev.filter((id) => id !== c._id));
                                }
                              }}
                              className="w-4 h-4 text-indigo-600 dark:text-indigo-400 rounded border-gray-300 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-200">{t(c.name)}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedCategories.length > 0 && (
                    <p dir="auto" className="text-xs text-indigo-600 dark:text-indigo-200 mt-1">
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
              <h3 className="text-lg font-semibold text-gray-700 mb-4">{t("Files & Media")}</h3>
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t("Recommended: 600×900px, max 5MB")}</p>
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t("Upload the complete book in PDF format")}</p>
                  </label>
                </div>
              </div>
            </div>

            {/* Signature notice */}
            <div className="bg-indigo-50 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-600 rounded-xl px-5 py-3 flex items-start gap-3">
              <PencilIcon className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-indigo-700 dark:text-indigo-200">
                {t("You will be asked to sign a digital publishing contract before submitting.")}
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
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    {t("Uploading")}{"..."}
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
    </div>
  );
};

export default AddAuthorBook;
