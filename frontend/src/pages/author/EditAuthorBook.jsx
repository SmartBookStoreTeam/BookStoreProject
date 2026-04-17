import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMyAuthorBooks, updateAuthorBook } from "../../api/adminApi";
import { getCategories } from "../../api/categoriesApi";
import imageCompression from "browser-image-compression";
import { BookOpenIcon, ArrowLeftIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import Loading from "../../components/Loading";
import { DollarSign, AlertTriangle, X } from "lucide-react";
import { useNavigation } from "../../context/NavigationContext";

const EditAuthorBook = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [book, setBook] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [booksRes, categoriesRes] = await Promise.all([
          getMyAuthorBooks(),
          getCategories(),
        ]);

        const found = booksRes.data?.find((b) => b._id === id);
        if (!found) {
          alert(t("Book not found"));
          navigate("/author-dashboard");
          return;
        }

        // Merge pending edits if they exist so the author builds on them
        const initialData = found.pendingEdits ? { ...found, ...found.pendingEdits } : found;
        setBook(initialData);

        const existing = initialData.categories || [];
        setSelectedCategories(existing.map((c) => (typeof c === "object" ? c._id : c)));
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      } catch (err) {
        console.error("Failed to fetch data", err);
        alert(t("Failed to load book details"));
        navigate("/author-dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, t]);

  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const data = new FormData(e.target);
      const bookData = new FormData();

      ["title", "author", "description", "year", "isbn", "edition"].forEach((f) =>
        bookData.append(f, data.get(f))
      );

      if (selectedCategories.length === 0) {
        alert(t("Please select at least one category."));
        setIsUploading(false);
        return;
      }
      selectedCategories.forEach((id) => bookData.append("categories", id));
      bookData.append("price", parseFloat(data.get("price") || 0));

      if (data.get("image")?.size > 0) {
        const imageFile = data.get("image");
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1600, useWebWorker: true };
        const compressed = await imageCompression(imageFile, options);
        bookData.append("image", new File([compressed], imageFile.name, { type: imageFile.type }));
      }

      if (data.get("pdf")?.size > 0) bookData.append("pdf", data.get("pdf"));

      await updateAuthorBook(id, bookData);
      setIsDirty(false);
      navigate("/author-dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || t("Failed to update book"));
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <Loading
        loading={t("Loading details...")}
        height="h-96"
        animate={true}
      />
    );
  }

  if (!book) return (
  <Loading
  error={t("Failed to load details!")}
    height="h-96"
    status="error"
  />);

  return (
    <div dir={i18n.dir()} className="min-h-screen bg-white dark:bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t("Edit Book")}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1 mt-0.5">
              <ClockIcon className="h-4 w-4 text-amber-500" />
              {t("Saving will reset status to Pending for re-review")}
            </p>
          </div>
        </div>

        {/* Status badge */}
        {(book.approvalStatus === "rejected" || book.rejectionReason) && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-100 dark:border-red-700 rounded-xl px-5 py-3">
            <p className="text-sm text-red-600 dark:text-red-200 font-medium">
              ❌ {book.approvalStatus === "approved" ? t("Edit request rejected") : t("This book was rejected")}
            </p>
            {book.rejectionReason && (
              <p className="text-sm text-red-600 dark:text-red-200 mt-1">{t("Reason")}: {book.rejectionReason}</p>
            )}
            <p className="text-xs text-red-500 dark:text-red-200 mt-1">
              {book.approvalStatus === "approved" 
                ? t("Fix the issues and re-submit your edits.") 
                : t("Fix the issues and re-submit for approval.")}
            </p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} onChange={() => setIsDirty(true)} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center border-b border-gray-100 dark:border-gray-700  pb-2">
                <BookOpenIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                {t("Book Information")}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {t("Title")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    defaultValue={book.title}
                    required
                    className="w-full text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {t("Author Name")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="author"
                    defaultValue={book.author}
                    required
                    className="w-full text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {t("Price")} ({t("EGP")}) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={book.price}
                    required
                    min="0"
                    className="w-full text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 px-4 py-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t("Publication Year")}</label>
                  <input
                    name="year"
                    type="number"
                    defaultValue={book.year}
                    className="w-full text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    min="1000"
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ISBN</label>
                  <input
                    name="isbn"
                    defaultValue={book.isbn}
                    className="w-full text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t("Edition")}</label>
                  <input
                    name="edition"
                    defaultValue={book.edition}
                    className="w-full border text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t("Categories")} <span className="text-red-500">*</span>
                  </label>
                  <div className="rounded-lg bg-white dark:bg-zinc-800">
                    {categories.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t("Loading categories...")}</p>
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
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
                      {selectedCategories.length} {t("category selected")}
                    </p>
                  )}
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t("Description")} <span className="text-red-500">*</span></label>
                  <textarea
                    name="description"
                    defaultValue={book.description}
                    required
                    rows="4"
                    className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Files */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">{t("Files & Media")}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors bg-gray-50 dark:bg-zinc-800">
                  <label className="block cursor-pointer">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t("Cover Image")}</div>
                    {book.image && (
                      <div className="text-xs text-green-600 dark:text-green-400 mb-2 flex items-center justify-center gap-1">
                        <span className="w-4 h-4">✓</span> {t("Current file exists")}
                      </div>
                    )}
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-200 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t("Leave empty to keep current image")}</p>
                  </label>
                </div>

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors bg-gray-50 dark:bg-zinc-800">
                  <label className="block cursor-pointer">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t("PDF File")}</div>
                    {book.pdf && (
                      <div className="text-xs text-green-600 dark:text-green-400 mb-2 flex items-center justify-center gap-1">
                        <span>✓</span> {t("Current file exists")}
                      </div>
                    )}
                    <input
                      type="file"
                      name="pdf"
                      accept="application/pdf"
                      className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-200 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t("Leave empty to keep current PDF")}</p>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => navigate("/author-dashboard")}
                className="cursor-pointer px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors disabled:opacity-50"
              >
                {t("Cancel")}
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="cursor-pointer px-6 py-2.5 bg-indigo-600 dark:bg-indigo-700 text-white dark:text-gray-200 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    {t("Updating...")}
                  </>
                ) : (
                  t("Re-Submit for Approval")
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
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

export default EditAuthorBook;
