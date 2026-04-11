import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMyAuthorBooks, updateAuthorBook } from "../../api/adminApi";
import { getCategories } from "../../api/categoriesApi";
import imageCompression from "browser-image-compression";
import { BookOpenIcon, ArrowLeftIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const EditAuthorBook = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [book, setBook] = useState(null);

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



        setBook(found);
        const existing = found?.categories || [];
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!book) return null;

  return (
    <div dir={i18n.dir()} className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t("Edit Book")}</h1>
            <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
              <ClockIcon className="h-4 w-4 text-amber-500" />
              {t("Saving will reset status to Pending for re-review")}
            </p>
          </div>
        </div>

        {/* Status badge */}
        {(book.approvalStatus === "rejected" || book.rejectionReason) && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3">
            <p className="text-sm text-red-700 font-medium">
              ❌ {book.approvalStatus === "approved" ? t("Edit request rejected") : t("This book was rejected")}
            </p>
            {book.rejectionReason && (
              <p className="text-sm text-red-600 mt-1">{t("Reason")}: {book.rejectionReason}</p>
            )}
            <p className="text-xs text-red-500 mt-1">
              {book.approvalStatus === "approved" 
                ? t("Fix the issues and re-submit your edits.") 
                : t("Fix the issues and re-submit for approval.")}
            </p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center border-b pb-2">
                <BookOpenIcon className="h-5 w-5 mr-2 text-indigo-600" />
                {t("Book Information")}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("Title")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    defaultValue={book.title}
                    required
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("Author Name")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="author"
                    defaultValue={book.author}
                    required
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("Price")} ({t("EGP")}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={book.price}
                    required
                    min="0"
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("Publication Year")}</label>
                  <input
                    name="year"
                    type="number"
                    defaultValue={book.year}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    min="1000"
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                  <input
                    name="isbn"
                    defaultValue={book.isbn}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("Edition")}</label>
                  <input
                    name="edition"
                    defaultValue={book.edition}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("Categories")} <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                    {categories.length === 0 ? (
                      <p className="text-sm text-gray-500">{t("Loading categories...")}</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map((c) => (
                          <label
                            key={c._id}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              value={c._id}
                              checked={selectedCategories.includes(c._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCategories((prev) => [...prev, c._id]);
                                } else {
                                  setSelectedCategories((prev) =>
                                    prev.filter((id) => id !== c._id)
                                  );
                                }
                              }}
                              className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">{t(c.name)}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedCategories.length > 0 && (
                    <p className="text-xs text-indigo-600 mt-1">
                      {selectedCategories.length} categor{selectedCategories.length === 1 ? "y" : "ies"} {t("selected")}
                    </p>
                  )}
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("Description")} <span className="text-red-500">*</span></label>
                  <textarea
                    name="description"
                    defaultValue={book.description}
                    required
                    rows="4"
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Files */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">{t("Files & Media")}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors bg-gray-50">
                  <label className="block cursor-pointer">
                    <div className="text-sm font-medium text-gray-700 mb-2">{t("Cover Image")}</div>
                    {book.image && (
                      <div className="text-xs text-green-600 mb-2 flex items-center justify-center gap-1">
                        <span className="w-4 h-4">✓</span> {t("Current file exists")}
                      </div>
                    )}
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <p className="text-xs text-gray-500 mt-2">{t("Leave empty to keep current image")}</p>
                  </label>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors bg-gray-50">
                  <label className="block cursor-pointer">
                    <div className="text-sm font-medium text-gray-700 mb-2">{t("PDF File")}</div>
                    {book.pdf && (
                      <div className="text-xs text-green-600 mb-2 flex items-center justify-center gap-1">
                        <span>✓</span> {t("Current file exists")}
                      </div>
                    )}
                    <input
                      type="file"
                      name="pdf"
                      accept="application/pdf"
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <p className="text-xs text-gray-500 mt-2">{t("Leave empty to keep current PDF")}</p>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => navigate("/author-dashboard")}
                className="cursor-pointer px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                {t("Cancel")}
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="cursor-pointer px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md"
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
    </div>
  );
};

export default EditAuthorBook;
