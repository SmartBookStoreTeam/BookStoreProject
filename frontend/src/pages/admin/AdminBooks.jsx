import { useState, useEffect } from "react";
import { addBook, updateBook, deleteBook } from "../../api/adminApi";
import { getBooks } from "../../api/booksApi";
import { useNavigate } from "react-router-dom";

import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();

  const categories = [
    "all",
    "Fiction",
    "Technology",
    "Romance",
    "Programming",
    "Fantasy",
    "Education",
    "Cooking",
    "Self-Help",
  ];

  /* ================= FILTER ================= */
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book?.author?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || book.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  /* ================= API HANDLERS ================= */

  const handleAddBook = async (bookData) => {
    try {
      const savedBook = await addBook(bookData);
      setBooks((prev) => [...prev, savedBook]);
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add book");
    }
  };

  const handleEditBook = async (id, bookData) => {
    try {
      const updated = await updateBook(id, bookData);
      setBooks((prev) =>
        prev.map((b) => (b._id === updated._id ? updated : b))
      );
      setEditingBook(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update book");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await deleteBook(id);
      setBooks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete book");
    }
  };

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await getBooks();
        setBooks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setBooks([]);
      }
    };
    fetchBooks();
  }, []);

  return (
    <div className="space-y-6 relative">
      {/* ================= LOADING OVERLAY ================= */}
      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white px-6 py-4 rounded-xl flex items-center space-x-3 shadow-lg">
            <svg
              className="animate-spin h-6 w-6 text-blue-600"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span className="font-medium">Uploading book...</span>
          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Book Management</h1>
          <p className="text-gray-600">Manage your book inventory</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* ================= SEARCH & FILTER ================= */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Categories" : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs">Book</th>
              <th className="px-6 py-3 text-left text-xs">Category</th>
              <th className="px-6 py-3 text-left text-xs">Price</th>
              <th className="px-6 py-3 text-left text-xs">Status</th>
              <th className="px-6 py-3 text-left text-xs">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredBooks.map((book) => (
              <tr key={book._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <BookOpenIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <div className="font-medium">{book.title}</div>
                      <div className="text-sm text-gray-500">{book.author}</div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">{book.category}</td>
                <td className="px-6 py-4">
                  ${Number(book.price || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4">{book.status}</td>

                <td className="px-6 py-4 flex space-x-2 mt-2">
                  <button onClick={() => setEditingBook(book)}>
                    <PencilIcon className="h-5 w-5 text-blue-600 cursor-pointer" />
                  </button>
                  <button onClick={() => handleDelete(book._id)}>
                    <TrashIcon className="h-5 w-5 text-red-600 cursor-pointer" />
                  </button>
                  <button onClick={() => navigate(`/admin/books/${book._id}`)}>
                    <EyeIcon className="h-5 w-5 text-gray-600 cursor-pointer" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= ADD / EDIT MODAL ================= */}
      {(showAddModal || editingBook) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingBook ? "Edit Book" : "Add Book"}
            </h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsUploading(true);

                try {
                  const data = new FormData(e.target);
                  const bookData = new FormData();

                  [
                    "title",
                    "author",
                    "category",
                    "description",
                    "status",
                  ].forEach((f) => bookData.append(f, data.get(f)));

                  bookData.append("price", parseFloat(data.get("price") || 0));

                  if (data.get("image")?.size > 0)
                    bookData.append("image", data.get("image"));

                  if (data.get("pdf")?.size > 0)
                    bookData.append("pdf", data.get("pdf"));

                  if (editingBook) {
                    await handleEditBook(editingBook._id, bookData);
                  } else {
                    await handleAddBook(bookData);
                  }
                } finally {
                  setIsUploading(false);
                }
              }}
              className="space-y-3"
            >
              <input
                name="title"
                defaultValue={editingBook?.title}
                required
                className="w-full border px-3 py-2 rounded"
                placeholder="Title"
              />
              <input
                name="author"
                defaultValue={editingBook?.author}
                required
                className="w-full border px-3 py-2 rounded"
                placeholder="Author"
              />
              <input
                name="price"
                type="number"
                step="0.01"
                defaultValue={editingBook?.price}
                required
                className="w-full border px-3 py-2 rounded"
                placeholder="Price"
              />

              <select
                name="category"
                defaultValue={editingBook?.category}
                className="w-full border px-3 py-2 rounded"
              >
                {categories
                  .filter((c) => c !== "all")
                  .map((c) => (
                    <option key={c}>{c}</option>
                  ))}
              </select>

              <select
                name="status"
                defaultValue={editingBook?.status || "available"}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>

              <textarea
                name="description"
                defaultValue={editingBook?.description}
                className="w-full border px-3 py-2 rounded"
                placeholder="Description"
              />

              <input type="file" name="image" />
              <input type="file" name="pdf" />

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => {
                    if (isUploading) return;
                    setShowAddModal(false);
                    setEditingBook(null);
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {isUploading
                    ? "Uploading..."
                    : editingBook
                    ? "Update"
                    : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooks;
