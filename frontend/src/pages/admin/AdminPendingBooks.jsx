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
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      {/* Header */}
      <div className="bg-indigo-600  rounded-lg md:rounded-xl shadow-lg p-4 md:p-6 text-white">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
              <ClockIcon className="h-6 md:h-8 w-6 md:w-8 flex-shrink-0" />
              <span>Pending Book Approvals</span>
            </h1>
            <p className="text-sm md:text-base text-amber-100 mt-1">
              Review and approve or reject author book submissions
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg md:rounded-xl px-4 md:px-6 py-2 md:py-3 text-center self-start md:self-end">
            <div className="text-2xl md:text-3xl font-bold">{books.length}</div>
            <div className="text-xs md:text-sm text-amber-100">Awaiting Review</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg md:rounded-xl shadow-sm border border-gray-100 dark:border-zinc-900 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12 md:py-24">
            <div className="animate-spin h-8 md:h-10 w-8 md:w-10 border-4 border-amber-500 border-t-transparent rounded-full" />
          </div>
        ) : books.length === 0 ? (
          <div className="py-12 md:py-24 text-center px-4">
            <CheckCircleIcon className="h-12 md:h-16 w-12 md:w-16 text-green-300 mx-auto mb-4" />
            <p className="text-lg md:text-xl font-semibold text-gray-600 dark:text-gray-200">All caught up!</p>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">
              No books pending approval at the moment.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {books.map((book) => (
              <div
                key={book._id}
                className={`flex flex-col md:flex-row md:items-start gap-3 md:gap-5 p-3 md:p-6 transition-colors border-l-4 ${
                  book.pendingEdits
                    ? "border-amber-400 bg-white dark:bg-zinc-800 hover:bg-amber-50/30 dark:hover:bg-amber-900/10"
                    : "border-transparent hover:bg-gray-50 dark:hover:bg-zinc-700/30"
                }`}
              >
                {/* Cover */}
                {book.image ? (
                  <img
                    src={book.image}
                    alt={book.title}
                    className="h-24 w-16 object-cover rounded-lg flex-shrink-0 shadow-sm mx-auto md:mx-0"
                  />
                ) : (
                  <div className="h-24 w-16 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                    <BookOpenIcon className="h-7 w-7 text-amber-400" />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                    <div className="relative flex-1 min-w-0">
                      {/* Title Diff */}
                      <div className="flex flex-col gap-1 flex-wrap">
                        {book.pendingEdits?.title && String(book.pendingEdits.title) !== String(book.title) ? (
                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                            <h3 className="font-bold text-gray-500 dark:text-gray-200 text-base md:text-lg leading-tight line-through break-words">
                              {book.title}
                            </h3>
                            <span className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 px-2 py-0.5 rounded-md text-xs font-bold border border-amber-300 dark:border-amber-600 w-fit">
                              {book.pendingEdits.title}
                            </span>
                          </div>
                        ) : (
                          <h3 className="font-bold text-gray-900 dark:text-gray-200 text-base md:text-lg leading-tight break-words">
                            {book.title}
                          </h3>
                        )}
                      </div>

                      {book.pendingEdits?.author && String(book.pendingEdits.author) !== String(book.author) ? (
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mt-0.5">
                          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm line-through">
                            by {book.author}
                          </p>
                          <span className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 px-2 py-0.5 rounded-md text-[10px] md:text-xs font-bold border border-amber-300 dark:border-amber-600 w-fit">
                            by {book.pendingEdits.author}
                          </span>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-0.5 break-words">
                          by {book.author}
                        </p>
                      )}
                      
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2">
                        {/* Price Diff */}
                        <div className="flex items-center gap-2 flex-wrap">
                         {book.pendingEdits?.price !== undefined && Number(book.pendingEdits.price) !== Number(book.price) ? (
                            <>
                              <span className="text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-200 line-through">
                                {book.price} EGP
                              </span>
                              <span className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 px-2 py-0.5 rounded-md text-xs font-bold border border-amber-300 dark:border-amber-600">
                                {book.pendingEdits.price} EGP
                              </span>
                            </>
                          ) : (
                            <span className="text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {book.price} EGP
                            </span>
                          )}
                        </div>
                        {/* Categories Diff */}
                        {(() => {
                          if (!book.pendingEdits?.categories) return null;
                          const oldIds = (book.categories || []).map(c => typeof c === 'object' ? (c._id || c) : c).sort();
                          const newIds = [...book.pendingEdits.categories].sort();
                          const isChanged = JSON.stringify(oldIds) !== JSON.stringify(newIds);
                          
                          if (isChanged) {
                            return (
                              <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-600">
                                Categories Modified
                              </span>
                            );
                          }
                          return null;
                        })()}

                        {!book.pendingEdits?.categories && book.categories?.length > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 px-2 py-0.5 rounded-full w-fit">
                            {book.categories
                              .map((c) => (typeof c === "object" ? c.name : c))
                              .join(", ")}
                          </span>
                        )}
                      </div>
                      {book.submittedBy && (
                        <p className="text-xs text-gray-400 dark:text-gray-400 mt-1.5 break-words">
                          Submitted by:{" "}
                          <span className="font-semibold text-gray-600 dark:text-gray-200">
                            {book.submittedBy.name}
                          </span>{" "}
                          ({book.submittedBy.email})
                        </p>
                      )}
                      {/* Description Diff hint */}
                      {book.pendingEdits?.description && String(book.pendingEdits.description) !== String(book.description) && (
                         <div className="mt-2 p-2 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded text-[10px] md:text-xs text-amber-700 dark:text-amber-300 font-medium">
                            Description has been modified
                         </div>
                      )}

                      {book.description && (!book.pendingEdits?.description || String(book.pendingEdits.description) === String(book.description)) && (
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                          {book.description}
                        </p>
                      )}
                    </div>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-900 dark:text-amber-100 text-xs font-semibold rounded-full flex-shrink-0 whitespace-nowrap w-fit md:self-start">
                      <span className="w-2 h-2 bg-amber-400 dark:bg-amber-200 rounded-full animate-pulse" />
                      Pending
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 md:gap-3 mt-3 md:mt-4">
                    <button
                      onClick={() => handleApprove(book._id)}
                      className="cursor-pointer flex items-center justify-center md:justify-start gap-2 px-3 md:px-5 py-2 bg-green-600 dark:bg-green-700 text-white hover:text-gray-100 dark:hover:text-gray-200 text-xs md:text-sm font-semibold rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors shadow-sm flex-1 md:flex-none min-h-[36px]"
                    >
                      <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden md:inline">Approve</span>
                      <span className="md:hidden">Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        setRejectModalBook(book);
                        setRejectReason("");
                      }}
                      className="cursor-pointer flex items-center justify-center md:justify-start gap-2 px-3 md:px-5 py-2 bg-red-50 text-red-600 border border-red-200 dark:border-red-700 hover:text-gray-100 dark:bg-red-900 dark:text-red-100 text-xs md:text-sm font-semibold rounded-lg hover:bg-red-100 hover:text-gray-100 dark:hover:bg-red-800 transition-colors flex-1 md:flex-none min-h-[36px]"
                    >
                      <XCircleIcon className="h-4 w-4 flex-shrink-0" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => navigate(`/admin/books/${book._id}`)}
                      className={`cursor-pointer flex items-center justify-center md:justify-start gap-2 px-3 md:px-5 py-2 text-xs md:text-sm font-semibold rounded-lg transition-colors flex-1 md:flex-none min-h-[36px] ${book.pendingEdits ? "bg-amber-500 dark:bg-amber-700 text-white hover:bg-amber-600 dark:hover:bg-amber-800" : "text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                    >
                      <EyeIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden md:inline">{book.pendingEdits ? "Review Edits" : "Preview"}</span>
                      <span className="md:hidden">{book.pendingEdits ? "Review" : "View"}</span>
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
          <div className="bg-white dark:bg-zinc-800 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 max-w-md w-full max-h-screen overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Reject Book</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 break-words">
              Rejecting:{" "}
              <strong className="text-gray-800 dark:text-gray-200">{rejectModalBook.title}</strong>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 break-words">
              Author:{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {rejectModalBook.submittedBy?.name || rejectModalBook.author}
              </span>{" "}
              will be notified of the rejection reason.
            </p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Rejection Reason{" "}
              <span className="text-gray-400 dark:text-gray-200 font-normal">(optional)</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Tell the author why their book was rejected..."
              className="w-full border border-gray-300 dark:border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
            />
            <div className="flex flex-col md:flex-row gap-2 md:gap-3 mt-4">
              <button
                onClick={() => setRejectModalBook(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-200 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm min-h-[36px]"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2.5 bg-red-600 dark:bg-red-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-700 font-medium text-sm min-h-[36px]"
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
