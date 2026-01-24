import { useState, useEffect } from "react";
import { deleteBook, getAdminBooks } from "../../api/adminApi";
import { getCategories } from "../../api/categoriesApi";
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

  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksData, categoriesData] = await Promise.all([
          getAdminBooks({ isActive: "true", pageSize: 1000 }),
          getCategories(),
        ]);
        setBooks(Array.isArray(booksData.data) ? booksData.data : []);
        setCategories(
          Array.isArray(categoriesData.data) ? categoriesData.data : [],
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  /* ================= FILTER ================= */
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book?.author?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      book.category?._id === selectedCategory ||
      book.category?.name === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  /* ================= API HANDLERS ================= */

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
  // Fetched in initial useEffect above

  return (
    <div className="space-y-6 relative">
      {/* ================= HEADER WITH STATS ================= */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Book Management</h1>
            <p className="text-blue-100 mt-1">
              Manage your book inventory and listings
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/books/add")}
            className="mt-4 md:mt-0 bg-white text-blue-600 px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-50 font-semibold shadow-md transition-all hover:scale-105 cursor-pointer"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add New Book</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="text-2xl font-bold">{books.length}</div>
            <div className="text-sm text-blue-100">Total Books</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="text-2xl font-bold">{filteredBooks.length}</div>
            <div className="text-sm text-blue-100">Filtered</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="text-2xl font-bold">{categories.length}</div>
            <div className="text-sm text-blue-100">Categories</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="text-2xl font-bold">
              {books.filter((b) => b.status === "available").length}
            </div>
            <div className="text-sm text-blue-100">Available</div>
          </div>
        </div>
      </div>

      {/* ================= SEARCH & FILTER ================= */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-50"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No books found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try adjusting your search or filters
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr
                    key={book._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {/* Book Cover Thumbnail */}
                        <div className="shrink-0">
                          {book.image ? (
                            <img
                              src={book.image}
                              alt={book.title}
                              className="h-16 w-12 object-cover rounded shadow-sm"
                            />
                          ) : (
                            <div className="h-16 w-12 bg-linear-to-br from-blue-400 to-blue-600 rounded shadow-sm flex items-center justify-center">
                              <BookOpenIcon className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </div>
                        {/* Book Info */}
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 truncate hover:text-blue-600 cursor-pointer max-w-50">
                            {book.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate mt-1 cursor-pointer">
                            {book.author}
                          </div>
                          {book.publicationYear && (
                            <div className="text-xs text-gray-400 mt-1 cursor-pointer">
                              Published: {book.publicationYear}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {book.category?.name || "Uncategorized"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">
                        {Number(book.price || 0).toFixed(2)} EGP
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                          book.status === "available"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-red-500"
                        }`}
                      >
                        {book.status || "available"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/books/${book._id}`)}
                          title="View Details"
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/admin/books/edit/${book._id}`)
                          }
                          title="Edit Book"
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(book._id)}
                          title="Delete Book"
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredBooks.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No books found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            filteredBooks.map((book) => (
              <div
                key={book._id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex gap-3">
                  {/* Book Cover */}
                  <div className="shrink-0">
                    {book.image ? (
                      <img
                        src={book.image}
                        alt={book.title}
                        className="h-16 w-12 object-cover rounded shadow-sm"
                      />
                    ) : (
                      <div className="h-16 w-12 bg-linear-to-br from-blue-400 to-blue-600 rounded shadow-sm flex items-center justify-center">
                        <BookOpenIcon className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Book Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-sm">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      by {book.author}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-gray-900 text-sm">
                        {Number(book.price || 0).toFixed(2)} EGP
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {book.category?.name || "Uncategorized"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          book.status === "available"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {book.status || "available"}
                      </span>

                      {/* Mobile Actions */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => navigate(`/admin/books/${book._id}`)}
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/admin/books/edit/${book._id}`)
                          }
                          className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Edit Book"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(book._id)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Book"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBooks;
