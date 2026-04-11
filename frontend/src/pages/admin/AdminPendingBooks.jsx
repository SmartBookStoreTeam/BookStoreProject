import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  BookOpenIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { getPendingBooks, approveBook, rejectBook } from "../../api/adminApi";

const AdminPendingBooks = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalBook, setRejectModalBook] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getPendingBooks();
        setBooks(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveBook(id);
      setBooks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve");
    }
  };

  const handleReject = async () => {
    if (!rejectModalBook) return;
    try {
      await rejectBook(rejectModalBook._id, rejectReason);
      setBooks((prev) => prev.filter((b) => b._id !== rejectModalBook._id));
      setRejectModalBook(null);
      setRejectReason("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ClockIcon className="h-8 w-8" />
              Pending Book Approvals
            </h1>
            <p className="text-amber-100 mt-1">
              Review and approve or reject author book submissions
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl px-6 py-3 text-center">
            <div className="text-3xl font-bold">{books.length}</div>
            <div className="text-sm text-amber-100">Awaiting Review</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full" />
          </div>
        ) : books.length === 0 ? (
          <div className="py-24 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-300 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-600">All caught up!</p>
            <p className="text-sm text-gray-400 mt-1">
              No books pending approval at the moment.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {books.map((book) => (
              <div
                key={book._id}
                className="flex items-start gap-5 p-6 hover:bg-amber-50/50 transition-colors"
              >
                {/* Cover */}
                {book.image ? (
                  <img
                    src={book.image}
                    alt={book.title}
                    className="h-24 w-16 object-cover rounded-lg flex-shrink-0 shadow-sm"
                  />
                ) : (
                  <div className="h-24 w-16 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpenIcon className="h-7 w-7 text-amber-400" />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="relative">
                      {/* Title Diff */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {book.pendingEdits?.title ? (
                          <>
                            <h3 className="font-bold text-gray-500 text-lg leading-tight line-through">
                              {book.title}
                            </h3>
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md text-sm font-bold border border-amber-300">
                              {book.pendingEdits.title}
                            </span>
                          </>
                        ) : (
                          <h3 className="font-bold text-gray-900 text-lg leading-tight">
                            {book.title}
                          </h3>
                        )}
                      </div>

                      <p className="text-gray-500 text-sm mt-0.5">by {book.author}</p>
                      
                      <div className="flex items-center gap-4 mt-2">
                        {/* Price Diff */}
                        <div className="flex items-center gap-2">
                          {book.pendingEdits?.price !== undefined ? (
                            <>
                              <span className="text-sm font-semibold text-gray-500 line-through">
                                {book.price} EGP
                              </span>
                              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md text-xs font-bold border border-amber-300">
                                {book.pendingEdits.price} EGP
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-semibold text-gray-800">
                              {book.price} EGP
                            </span>
                          )}
                        </div>
                        {book.categories?.length > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {book.categories.map((c) => (typeof c === "object" ? c.name : c)).join(", ")}
                          </span>
                        )}
                      </div>
                      {book.submittedBy && (
                        <p className="text-xs text-gray-400 mt-1.5">
                          Submitted by:{" "}
                          <span className="font-semibold text-gray-600">
                            {book.submittedBy.name}
                          </span>{" "}
                          ({book.submittedBy.email})
                        </p>
                      )}
                      {book.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {book.description}
                        </p>
                      )}
                    </div>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-full flex-shrink-0 whitespace-nowrap">
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                      Pending Review
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleApprove(book._id)}
                      className="cursor-pointer flex items-center gap-2 px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setRejectModalBook(book);
                        setRejectReason("");
                      }}
                      className="cursor-pointer flex items-center gap-2 px-5 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => navigate(`/admin/books/${book._id}`)}
                      className={`cursor-pointer flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${book.pendingEdits ? "bg-amber-500 text-white hover:bg-amber-600" : "text-gray-600 hover:bg-gray-200"}`}
                    >
                      <EyeIcon className="h-4 w-4" />
                      {book.pendingEdits ? "Review Edits" : "Preview"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalBook && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Reject Book</h3>
            <p className="text-sm text-gray-500 mb-4">
              Rejecting:{" "}
              <strong className="text-gray-800">{rejectModalBook.title}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Author:{" "}
              <span className="font-medium text-gray-700">
                {rejectModalBook.submittedBy?.name || rejectModalBook.author}
              </span>{" "}
              will be notified of the rejection reason.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Tell the author why their book was rejected..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setRejectModalBook(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPendingBooks;
