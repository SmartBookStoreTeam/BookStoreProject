import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updateBook, getAdminBookById } from "../../api/adminApi";
import { getCategories } from "../../api/categoriesApi";
import { DollarSign, AlertTriangle, X } from "lucide-react";
import { BookOpenIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useNavigation } from "../../context/NavigationContext";

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [book, setBook] = useState(null);
  const { t, i18n } = useTranslation();
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
        const [bookRes, categoriesRes] = await Promise.all([
          getAdminBookById(id),
          getCategories(),
        ]);

        if (bookRes.success) {
          setBook(bookRes.data);
          // Pre-select existing categories
          const existing = bookRes.data?.categories || [];
          setSelectedCategories(
            existing.map((c) => (typeof c === "object" ? c._id : c))
          );
        } else {
          setBook(bookRes);
          const existing = bookRes?.categories || [];
          setSelectedCategories(
            existing.map((c) => (typeof c === "object" ? c._id : c))
          );
        }

        setCategories(
          Array.isArray(categoriesRes.data) ? categoriesRes.data : [],
        );
      } catch (err) {
        console.error("Failed to fetch data", err);
        alert("Failed to load book details");
        navigate("/admin/books");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

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

      [
        "title",
        "author",
        "description",
        "status",
        "year",
        "isbn",
        "edition",
      ].forEach((f) => bookData.append(f, data.get(f)));

      // Append each selected category separately
      if (selectedCategories.length === 0) {
        alert("Please select at least one category.");
        setIsUploading(false);
        return;
      }
      selectedCategories.forEach((id) => bookData.append("categories", id));

      bookData.append("price", parseFloat(data.get("price") || 0));

      if (data.get("image")?.size > 0)
        bookData.append("image", data.get("image"));

      if (data.get("pdf")?.size > 0) bookData.append("pdf", data.get("pdf"));

      await updateBook(id, bookData);
      setIsDirty(false);
      navigate("/admin/books");
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to update book";
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-center">
          <div>
            <h1 className="text-2xl text-center font-bold text-gray-800 dark:text-gray-200">Edit Book</h1>
            <p className="text-gray-600 dark:text-gray-300">Update book information and files</p>
          </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <form onSubmit={handleSubmit} onChange={() => setIsDirty(true)} className="space-y-6 max-w-5xl mx-auto">
          {/* Book Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center border-b border-gray-300 dark:border-gray-800 pb-2">
              <BookOpenIcon className="h-5 w-5 mr-2 text-blue-600" />
              Book Information
            </h3>
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  defaultValue={book.title}
                  required
                  className="w-full text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter book title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  name="author"
                  defaultValue={book.author}
                  required
                  className="w-full text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter author name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (EGP) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={book.price}
                  required
                  className="w-full text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Publication Year
                </label>
                <input
                  name="year"
                  type="number"
                  defaultValue={book.year}
                  className="w-full text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={new Date().getFullYear()}
                  min="1000"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ISBN
                </label>
                <input
                  name="isbn"
                  defaultValue={book.isbn}
                  className="w-full text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="ISBN"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Edition
                </label>
                <input
                  name="edition"
                  defaultValue={book.edition}
                  className="w-full text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Edition"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="bg-white dark:bg-zinc-800">
                  {categories.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-300">Loading categories...</p>
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
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-md scale-105"
                                : "bg-white dark:bg-zinc-700 dark:border-gray-800 border-gray-200 text-gray-700 dark:text-gray-200 hover:border-indigo-400 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                            }`}
                          >
                            {c.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {selectedCategories.length > 0 && (
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                    {selectedCategories.length} categor{selectedCategories.length === 1 ? "y" : "ies"} selected
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={book.status || "available"}
                  className="w-full   dark:text-gray-200  border border-gray-300 dark:border-zinc-700  dark:bg-zinc-900  px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={book.description}
                  rows="4"
                  className="w-full text-gray-800 dark:text-gray-200  border border-gray-300 dark:border-zinc-700  dark:bg-zinc-900  px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                  placeholder="Enter book description..."
                />
              </div>
            </div>
          </div>

          {/* Files Section */}
          <div className="border-t border-gray-200  dark:border-gray-800  dark:bg-zinc-800   pt-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300  mb-4">
              Files & Media
            </h3>
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
              <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 dark:bg-zinc-900  rounded-xl p-6 text-center hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-950">
                <label className="block cursor-pointer">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300  mb-2">
                    Cover Image
                  </div>
                  {book.image && (
                    <div className="text-xs text-green-600 dark:text-green-500 mb-2 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Current file exists
                    </div>
                  )}
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="w-full text-sm text-gray-500 dark:text-gray-200  border border-gray-300   dark:border-gray-800  dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-indigo-900/80 file:text-indigo-900 hover:file:bg-indigo-900 hover:file:text-indigo-300 dark:file:text-indigo-200"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-300 mt-2">
                    Leave empty to keep current image
                  </p>
                </label>
              </div>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-800  dark:bg-zinc-900  rounded-xl p-6 text-center hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-950">
                <label className="block cursor-pointer">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    PDF File
                  </div>
                  {book.pdf && (
                    <div className="text-xs text-green-600 dark:text-green-500 mb-2 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Current file exists
                    </div>
                  )}
                  <input
                    type="file"
                    name="pdf"
                    accept="application/pdf"
                    className="w-full text-sm text-gray-500 dark:text-gray-200  border border-gray-300   dark:border-gray-800  dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-indigo-900/80 file:text-indigo-900 hover:file:bg-indigo-900 hover:file:text-indigo-300 dark:file:text-indigo-200"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-300 mt-2">
                    Leave empty to keep current PDF
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-gray-800  dark:bg-zinc-800 ">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => navigate("/admin/books")}
              className="px-6 py-2.5 border border-gray-300  dark:border-gray-800  dark:bg-zinc-800 text-gray-700 dark:text-gray-300  rounded-lg hover:bg-gray-50 hover:dark:bg-gray-700 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2.5 bg-blue-600 text-white dark:text-gray-300 rounded-lg hover:bg-blue-700 hover:dark:bg-blue-500 font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg"
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
                  Updating...
                </>
              ) : (
                "Update Book"
              )}
            </button>
          </div>
        </form>
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

export default EditBook;
