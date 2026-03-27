import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addBook } from "../../api/adminApi";
import { getCategories } from "../../api/categoriesApi";
import imageCompression from "browser-image-compression";
import { BookOpenIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const AddBook = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

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

      if (data.get("image")?.size > 0) {
        const imageFile = data.get("image");

        const options = {
          maxSizeMB: 1, // أقصى حجم 1MB
          maxWidthOrHeight: 1600, // يقلل الأبعاد
          useWebWorker: true,
        };

        const compressedImage = await imageCompression(imageFile, options);
        const compressedFile = new File([compressedImage], imageFile.name, { type: imageFile.type });
        bookData.append("image", compressedFile, compressedFile.name);
      }

      if (data.get("pdf")?.size > 0) bookData.append("pdf", data.get("pdf"));

      await addBook(bookData);
      navigate("/admin/books");
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to add book";
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/admin/books")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Add New Book</h1>
            <p className="text-gray-600">
              Fill in the details to add a new book
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
          {/* Book Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center border-b pb-2">
              <BookOpenIcon className="h-5 w-5 mr-2 text-blue-600" />
              Book Information
            </h3>
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  required
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter book title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  name="author"
                  required
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter author name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (EGP) <span className="text-red-500">*</span>
                </label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  required
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publication Year
                </label>
                <input
                  name="year"
                  type="number"
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={new Date().getFullYear()}
                  min="1000"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ISBN
                </label>
                <input
                  name="isbn"
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="ISBN"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edition
                </label>
                <input
                  name="edition"
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Edition"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                  {categories.length === 0 ? (
                    <p className="text-sm text-gray-500">Loading categories...</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((c) => (
                        <label
                          key={c._id}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
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
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{c.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {selectedCategories.length > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    {selectedCategories.length} category selected
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue="available"
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="4"
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                  placeholder="Enter book description..."
                />
              </div>
            </div>
          </div>

          {/* Files Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Files & Media
            </h3>
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors bg-gray-50">
                <label className="block cursor-pointer">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Cover Image <span className="text-red-500">*</span>
                  </div>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    required
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: 600x900px, max 5MB
                  </p>
                </label>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors bg-gray-50">
                <label className="block cursor-pointer">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    PDF File <span className="text-red-500">*</span>
                  </div>
                  <input
                    type="file"
                    name="pdf"
                    accept="application/pdf"
                    required
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Upload the complete book in PDF format
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => navigate("/admin/books")}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg"
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
                  Uploading...
                </>
              ) : (
                "Add Book"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBook;
