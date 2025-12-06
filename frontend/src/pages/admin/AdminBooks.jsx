import { useState, useEffect } from "react";
import { addBook, updateBook, deleteBook } from "../../api/adminApi";
import { getBooks } from "../../api/booksApi";

import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  BookOpenIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

const AdminBooks = () => {
  const [books, setBooks] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [previewBook, setPreviewBook] = useState(null);

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

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book?.author?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || book.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Add
  const handleAddBook = async (bookData) => {
    const savedBook = await addBook(bookData);
    setBooks([...books, savedBook]);
    setShowAddModal(false);
  };

  // Edit
  const handleEditBook = async (updatedBook) => {
    const saved = await updateBook(updatedBook._id, updatedBook);
    setBooks(books.map((b) => (b._id === saved._id ? saved : b)));
    setEditingBook(null);
  };

  // Delete
  const handleDelete = async (_id) => {
    if (window.confirm("Are you sure?")) {
      await deleteBook(_id);
      setBooks(books.filter((b) => b._id !== _id));
    }
  };

  // Fetch Books
  useEffect(() => {
    const fetchBooks = async () => {
      const data = await getBooks();
      setBooks(data);
    };
    fetchBooks();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Book Management</h1>
          <p className="text-gray-600">
            Manage your book inventory and listings
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooks.map((book) => (
                <tr key={book._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpenIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium">{book.title}</div>
                        <div className="text-sm text-gray-500">
                          {book.author}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {book.category}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm font-medium">
                    ${book.price.toFixed(2)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`text-sm ${
                        book.countInStock === 0 ? "text-red-600" : ""
                      }`}
                    >
                      {book.countInStock} units
                    </span>

                    {book.countInStock < 10 && book.countInStock > 0 && (
                      <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Low Stock
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm">{book.sales ?? 0}sss</td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        book.status === "Published"
                          ? "bg-green-100 text-green-800"
                          : book.status === "Draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : book.status === "Archived"
                          ? "bg-gray-300 text-gray-700"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {book.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm flex space-x-2 mt-1">
                    <button
                      onClick={() => setEditingBook(book)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => handleDelete(book._id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => setPreviewBook(book)}
                      className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                      title="Quick Preview"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {(showAddModal || editingBook) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingBook ? "Edit Book" : "Add New Book"}
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.target);

                  const bookData = {
                    title: data.get("title"),
                    author: data.get("author"),
                    price: parseFloat(data.get("price")),
                    countInStock: parseInt(data.get("stock")),
                    category: data.get("category"),
                    description: data.get("description"),
                    status: data.get("status"),
                  };

                  editingBook
                    ? handleEditBook({ ...editingBook, ...bookData })
                    : handleAddBook(bookData);
                }}
              >
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Book Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={editingBook?.title}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Author */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      name="author"
                      defaultValue={editingBook?.author}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Price + Stock */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        name="price"
                        step="0.01"
                        defaultValue={editingBook?.price}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        name="stock"
                        defaultValue={editingBook?.countInStock}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      defaultValue={editingBook?.category}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {categories
                        .filter((c) => c !== "all")
                        .map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue={editingBook?.status || "Published"}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                      <option value="Unavailable">Unavailable</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={editingBook?.description}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingBook(null);
                    }}
                    className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingBook ? "Update Book" : "Add Book"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {previewBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">{previewBook.title}</h2>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Author:</span> {previewBook.author}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Category:</span>{" "}
              {previewBook.category}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Price:</span> $
              {previewBook.price.toFixed(2)}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Stock:</span>{" "}
              {previewBook.countInStock} units
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Status:</span> {previewBook.status}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Description:</span>
            </p>
            <p className="text-gray-800 mb-4">
              {previewBook.description || "No description available."}
            </p>

            <button
              onClick={() => setPreviewBook(null)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooks;
