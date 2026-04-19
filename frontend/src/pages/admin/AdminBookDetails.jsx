import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAdminBookById, getAdminBookContract } from "../../api/adminApi";
import { getCategories } from "../../api/categoriesApi";
import axios from "axios";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import Loading from "../../components/Loading";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { useTranslation } from "react-i18next";

import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  BookOpenIcon,
  UserIcon,
  TagIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

const AdminBookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [contractData, setContractData] = useState(null);
  const { t } = useTranslation();

  // جلب بيانات الكتاب
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const [response, categoriesRes] = await Promise.all([
          getAdminBookById(id),
          getCategories(),
        ]);
        setBook(response.data);
        setAllCategories(categoriesRes.data || []);

        // Fetch signed URL for PDF
        if (response.data?.pdf) {
          try {
            const token = localStorage.getItem("token");
            const pdfResponse = await axios.get(
              `${import.meta.env.VITE_API_URL}/books/${id}/download`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );
            if (pdfResponse.data?.data?.url) {
              setPdfUrl(pdfResponse.data.data.url);
            }
          } catch (pdfError) {
            console.error("Error fetching PDF URL:", pdfError);
          }
        }

        // Fetch contract URL if exists
        if (response.data?.contractPdf || response.data?.signatureUrl) {
          try {
            const contractRes = await getAdminBookContract(id);
            setContractData(contractRes.data);
          } catch (contractError) {
            console.error("Error fetching contract URL:", contractError);
          }
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookDetails();
  }, [id]);


  // رفع PDF جديد
  const handleUploadPDF = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await axios.post(
        `/api/admin/books/${id}/upload-pdf`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setBook((prev) => ({ ...prev, pdf: res.data.url }));
      alert("PDF uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("PDF upload failed!");
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return (
      <Loading
        loading={t("Loading book details...")}
        animate={true}
        height={"h-96"}
      />
    );

  if (!book)
    return (
      <div className="flex flex-col items-center justify-center">
        <Loading
          error={t("Failed to load book details")}
          height={"h-80"}
          status="error"
        />
        <button
          onClick={() => navigate("/admin/books")}
          className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t("Back to Books")}
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 p-4 md:p-6">
      {/* Header */}
      <div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-200">
              {book.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {book.author}
            </p>
          </div>

        </div>
      </div>
      {/* Pending Edits Info Box */}
      {book.pendingEdits && (
        <div className="mb-6 mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 dark:bg-amber-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 dark:bg-amber-700"></span>
            </span>
            <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200">
              Pending Edit Request
            </h3>
          </div>
          <p className="text-amber-700 dark:text-amber-300 text-sm mb-4">
            The author has requested changes to this book. Below are the new
            values proposed:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(book.pendingEdits).map(([key, value]) => {
              if (key === "fileMeta") return null;
              
              let displayValue = value;
              let oldValue = book[key];
              let isChanged = false;

              // Handle Categories comparison
              if (key === "categories" && Array.isArray(value)) {
                const oldIds = (book.categories || []).map(c => typeof c === 'object' ? (c._id || c) : c).sort();
                const newIds = [...value].sort();
                isChanged = JSON.stringify(oldIds) !== JSON.stringify(newIds);

                const mappedCats = value.map((catId) => {
                  const cat = allCategories.find((c) => c._id === catId || c.name === catId);
                  return cat ? cat.name : catId;
                });
                displayValue = mappedCats.join(", ");
                oldValue = book.categories?.map(c => typeof c === 'object' ? c.name : c).join(', ') || "—";
              } 
              // Handle Files
              else if (key === "image" || key === "pdf") {
                // We assume if it's in pendingEdits, a new file was uploaded
                isChanged = true; 
                displayValue = "New file uploaded";
                oldValue = "Current file";
              }
              // Handle generic values
              else {
                isChanged = String(book[key] || "") !== String(value || "");
                oldValue = book[key] || "—";
              }

              // Skip if not actually changed
              if (!isChanged) return null;

              return (
                <div
                  key={key}
                  className="bg-amber-100/50 dark:bg-amber-900/40 p-4 rounded-xl border border-amber-200 dark:border-amber-700 flex flex-col shadow-sm"
                >
                  <span className="text-xs text-amber-700 dark:text-amber-400 font-bold uppercase mb-2">
                    {key}
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                      {String(oldValue)}
                    </span>
                    <span
                      className="text-sm font-bold text-gray-900 dark:text-gray-100 break-words"
                    >
                      {String(displayValue) || "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-amber-600 dark:text-amber-300 font-semibold">
            Approve the book from the 'Pending' list to apply these changes, or
            Reject to discard them.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6">
            {book.image ? (
              <img
                src={book.image}
                alt={book.title}
                className="w-full h-64 object-contain rounded-lg mb-4"
              />
            ) : (
              <div className="w-full h-64 bg-blue-50 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
                <BookOpenIcon className="h-20 w-20 text-blue-300" />
              </div>
            )}
          </div>

          {/* Book Details / Specifications */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold dark:text-gray-200 border-b dark:border-zinc-700 pb-2">
              {t("Book details")}
            </h3>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
              {book.pdf && pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer flex items-center px-4 py-2 bg-green-600 dark:bg-green-800 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-900"
                >
                  <EyeIcon className="h-5 w-5 mr-2" />
                  View Book PDF
                </a>
              )}
              {(book.contractPdf || book.signatureUrl) && contractData?.url && (
              <div className="flex gap-3 mt-4 mb-4">
                <a
                  href={contractData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer flex items-center px-4 py-2 bg-indigo-600 dark:bg-indigo-800 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-900"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  View Contract
                </a>
              </div>
            )}
          </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-500 dark:text-gray-400">
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" /> {t("Price")}
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {book.price} EGP
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-500 dark:text-gray-400">
                  <TagIcon className="h-4 w-4 mr-2" /> {t("Categories")}
                </span>
                <div className="flex flex-wrap justify-end gap-1 max-w-[150px]">
                   {book.categories?.map((c, idx) => (
                     <span key={idx} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded text-[10px] font-medium border border-blue-100 dark:border-blue-800">
                       {typeof c === 'object' ? c.name : c}
                     </span>
                   ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-500 dark:text-gray-400">
                  <ClockIcon className="h-4 w-4 mr-2" /> {t("Year")}
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {book.year || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-500 dark:text-gray-400">
                  <PencilIcon className="h-4 w-4 mr-2" /> ISBN
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {book.isbn || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-500 dark:text-gray-400">
                  <ChartBarIcon className="h-4 w-4 mr-2" /> {t("Edition")}
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {book.edition || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - PDF Viewer */}
        <div className="lg:col-span-2">
          <div
            className={`bg-white dark:bg-zinc-800 rounded-xl shadow-sm ${
              isFullscreen ? "fixed inset-0 z-50 p-4" : "p-6"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-gray-200">
                PDF Viewer
              </h3>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-zinc-700 rounded-lg cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {book.pdf ? (
              pdfUrl ? (
                <div className="border rounded-lg overflow-hidden h-96">
                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    <Viewer fileUrl={pdfUrl} />
                  </Worker>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 border rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-300">
                      Loading PDF...
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <BookOpenIcon className="h-16 w-16 text-gray-400 dark:text-gray-300 mb-4" />
                <p className="text-gray-500 dark:text-gray-300 mb-4">
                  No PDF available for this book
                </p>
                <label className="px-4 py-2 bg-blue-600 dark:bg-blue-400 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 cursor-pointer">
                  {uploading ? "Uploading..." : "Upload PDF"}
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleUploadPDF}
                    disabled={uploading}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description Section - Full Width below */}
      <div className="mt-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-4 border-b dark:border-zinc-700 pb-2">
          {t("Description")}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
          {book.description || t("No description available.")}
        </p>
      </div>
    </div>
  );
};

export default AdminBookDetails;
