import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BookOpenIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { getMyAuthorBooks, deleteAuthorBook, getAuthorBookContract } from "../../api/adminApi";

const statusConfig = {
  pending: {
    label: "Pending Review",
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  approved: {
    label: "Approved",
    bg: "bg-green-50 border-green-200",
    text: "text-green-700",
    dot: "bg-green-400",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
    dot: "bg-red-400",
  },
};

const AuthorSubmissions = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contractData, setContractData] = useState(null);
  const [contractLoading, setContractLoading] = useState(null); // bookId
  const { t, i18n } = useTranslation();
  useEffect(() => {
    // Check if sidebar requested a specific filter
    const tab = localStorage.getItem("authorDashTab");
    if (tab) localStorage.removeItem("authorDashTab");

    const fetch = async () => {
      try {
        const res = await getMyAuthorBooks();
        if (res.success) setBooks(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book submission?")) return;
    try {
      await deleteAuthorBook(id);
      setBooks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleViewContract = async (bookId) => {
    setContractLoading(bookId);
    try {
      const res = await getAuthorBookContract(bookId);
      setContractData(res.data);
    } catch {
      alert(t("No contract found for this book."));
    } finally {
      setContractLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div dir={i18n.dir()} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t("Books' status")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {t("Track all your book submissions and their approval status")}
          </p>
        </div>
        <Link
          to="/author-dashboard/add-book"
          className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white dark:text-gray-200 px-4 py-2.5 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors text-sm font-semibold shadow-sm"
        >
          <PlusCircleIcon className="h-4 w-4" />
          {t("Publish New Book")}
        </Link>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total", count: books.length, color: "bg-gray-100 text-gray-700" },
          { label: "Pending", count: books.filter((b) => b.approvalStatus === "pending").length, color: "bg-amber-100 text-amber-700" },
          { label: "Approved", count: books.filter((b) => b.approvalStatus === "approved").length, color: "bg-green-100 text-green-700" },
          { label: "Rejected", count: books.filter((b) => b.approvalStatus === "rejected").length, color: "bg-red-100 text-red-700" },
        ].map((s) => (
          <div key={s.label} className={`px-4 py-2 rounded-xl text-sm font-semibold ${s.color}`}>
            {t(s.label)}: {s.count}
          </div>
        ))}
      </div>

      {/* Book list */}
      {books.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-900 py-20 text-center">
          <BookOpenIcon className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">{t("No submissions yet")}</p>
          <Link
            to="/author-dashboard/add-book"
            className="mt-4 inline-flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white dark:text-gray-200 px-5 py-2 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors text-sm font-medium"
          >
            <PlusCircleIcon className="h-4 w-4" />
            {t("Submit Your First Book")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {books.map((book) => {
            const currentStatus = book.approvalStatus || book.status || "pending";
            const cfg = statusConfig[currentStatus] || statusConfig.pending;
            return (
              <div
                key={book._id}
                className={`bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 overflow-hidden ${
                  currentStatus === "rejected" ? "border-red-200" : "border-gray-100 dark:border-zinc-700"
                }`}
              >
                <div className="flex items-start gap-4 p-5">
                  {/* Cover */}
                  {book.image || book.coverImage?.url ? (
                    <img
                      src={book.image || book.coverImage?.url}
                      alt={book.title}
                      className="h-20 w-14 object-cover rounded-lg flex-shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="h-20 w-14 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpenIcon className="h-6 w-6 text-indigo-400 dark:text-indigo-200" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-200 text-base line-clamp-1">{book.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{book.author || book.user?.name}</p>
                        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-200 mt-1">{book.price} {t("EGP")}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-200 mt-0.5">
                          {t("Submitted")}: {new Date(book.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Status badge */}
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        {t(cfg.label)}
                      </div>
                    </div>

                    {/* Rejection reason */}
                    {(book.adminFeedback || book.rejectionReason) && (
                      <div className="mt-2 bg-red-50 dark:bg-red-900 border border-red-100 dark:border-red-700 rounded-lg px-3 py-2">
                        <p className="text-xs text-red-600 dark:text-red-200">
                          <span className="font-semibold">
                            {currentStatus === "approved" ? t("Edit request rejected") : t("Rejection reason")}:
                          </span>{" "}
                          {book.adminFeedback || book.rejectionReason}
                        </p>
                      </div>
                    )}

                    {currentStatus === "approved" && (
                      <p className="text-xs text-green-600 dark:text-green-200 mt-2">{t("Live and visible to readers")}</p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        onClick={() => navigate(`/author-dashboard/edit-book/${book._id}`)}
                        className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white dark:text-gray-200 text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                        {currentStatus === "approved" ? t("Request Edit") : t("Edit & Re-submit")}
                      </button>

                      {(book.contractPdf || book.signatureUrl) && (
                        <button
                          onClick={() => handleViewContract(book._id)}
                          disabled={contractLoading === book._id}
                          className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                          <DocumentTextIcon className="h-3.5 w-3.5" />
                          {contractLoading === book._id ? "..." : t("My Contract")}
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(book._id)}
                        className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 border border-red-200 dark:border-red-700 text-xs font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        {t("Delete")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contract Modal */}
      {contractData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-indigo-600 dark:bg-indigo-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <DocumentTextIcon className="h-5 w-5" />
                <h2 className="font-bold">{t("Publishing Contract")}</h2>
              </div>
              <button onClick={() => setContractData(null)} className="text-white/70 p-2 rounded-full bg-indigo-700 dark:bg-indigo-600 hover:text-white cursor-pointer text-xl">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {contractData.signatureUrl && (
                <div className="rounded-xl p-4 bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-200 mb-2">{t("Your Digital Signature")}</p>
                  <img src={contractData.signatureUrl} alt="Signature" className="max-h-20 border border-gray-300 dark:border-gray-600 rounded-lg bg-white p-2" />
                  {contractData.contractSignedAt && (
                    <p className="text-xs text-gray-400 dark:text-gray-200 mt-1">
                      {t("Signed on")} {new Date(contractData.contractSignedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <a
                  href={contractData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm"
                >
                  <DocumentTextIcon className="h-4 w-4" /> {t("View Contract")}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorSubmissions;

