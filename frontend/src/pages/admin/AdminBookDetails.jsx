import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAdminBookById, getAdminBookContract } from "../../api/adminApi";
import { getCategories } from "../../api/categoriesApi";
import axios from "axios";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  BookOpenIcon,
  UserIcon,
  TagIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
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
  const [contractLoading, setContractLoading] = useState(false);
  const [contractData, setContractData] = useState(null);

  // جلب بيانات الكتاب
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const [response, categoriesRes] = await Promise.all([
          getAdminBookById(id),
          getCategories()
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
      } catch (error) {
        console.error("Error fetching book details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookDetails();
  }, [id]);

  // تحميل PDF
  const downloadPDF = () => {
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `${book.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // View contract
  const handleViewContract = async () => {
    setContractLoading(true);
    try {
      const res = await getAdminBookContract(id);
      setContractData(res.data);
    } catch {
      alert("No contract found for this book.");
    } finally {
      setContractLoading(false);
    }
  };

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (!book)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Book Not Found
        </h2>
        <button
          onClick={() => navigate("/admin/books")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Books
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/books")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Books
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
            <p className="text-gray-600 mt-2">{book.author}</p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            {book.pdf && (
              <button
                onClick={downloadPDF}
                className="cursor-pointer flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Download PDF
              </button>
            )}
            {(book.contractPdf || book.signatureUrl) && (
              <button
                onClick={handleViewContract}
                disabled={contractLoading}
                className="cursor-pointer flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                {contractLoading ? "Loading..." : "View Contract"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pending Edits Info Box */}
      {book.pendingEdits && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <h3 className="text-lg font-bold text-amber-800">Pending Edit Request</h3>
          </div>
          <p className="text-amber-700 text-sm mb-4">
            The author has requested changes to this book. Below are the new values proposed:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(book.pendingEdits).map(([key, value]) => {
              if (key === 'fileMeta') return null;
              let displayValue = value;
              if (key === 'categories' && Array.isArray(value)) {
                const mappedCats = value.map(catId => {
                  const cat = allCategories.find(c => c._id === catId || c.name === catId);
                  return cat ? cat.name : catId;
                });
                displayValue = `[${mappedCats.join(', ')}]`;
              } else if (key === 'image' || key === 'pdf') {
                displayValue = "A new file was uploaded";
              }
              
              return (
                <div key={key} className="bg-white p-3 rounded-lg border border-amber-100 flex flex-col">
                  <span className="text-xs text-amber-600 font-bold uppercase mb-1">{key}</span>
                  <span className="text-sm font-medium text-gray-800 truncate" title={String(displayValue)}>
                    {String(displayValue) || "—"}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-amber-600 font-semibold">
            Approve the book from the 'Pending' list to apply these changes, or Reject to discard them.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {book.image ? (
              <img
                src={book.image}
                alt={book.title}
                className="w-full h-64 object-contain rounded-lg mb-4"
              />
            ) : (
              <div className="w-full h-64 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <BookOpenIcon className="h-20 w-20 text-blue-300" />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Description</h3>
            <p className="text-gray-600 whitespace-pre-line">
              {book.description || "No description available."}
            </p>
          </div>
        </div>

        {/* Right Column - PDF Viewer */}
        <div className="lg:col-span-2">
          <div
            className={`bg-white rounded-xl shadow-sm ${
              isFullscreen ? "fixed inset-0 z-50 p-4" : "p-6"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">PDF Viewer</h3>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading PDF...</p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-gray-300 rounded-lg">
                <BookOpenIcon className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">
                  No PDF available for this book
                </p>
                <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
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

      {/* Contract Modal */}
      {contractData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <DocumentTextIcon className="h-5 w-5" />
                <h2 className="font-bold text-lg">Publishing Contract</h2>
              </div>
              <button onClick={() => setContractData(null)} className="text-white/70 hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Signature preview */}
              {contractData.signatureUrl && (
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
                    <PencilIcon className="h-4 w-4" /> Author's Digital Signature
                  </p>
                  <img src={contractData.signatureUrl} alt="Signature" className="max-h-24 border border-gray-300 rounded-lg bg-white p-2" />
                  {contractData.contractSignedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Signed on {new Date(contractData.contractSignedAt).toLocaleString()}
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
                  <EyeIcon className="h-4 w-4" /> View Contract PDF
                </a>
                <a
                  href={contractData.url}
                  download={`${book?.title || "contract"}-contract.pdf`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" /> Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookDetails;
