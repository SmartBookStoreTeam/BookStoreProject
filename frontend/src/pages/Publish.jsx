/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  Upload,
  Image,
  DollarSign,
  BookOpen,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "../context/NavigationContext";
import AuthModal from "../components/AuthModal";
import { useLocation, useNavigate } from "react-router-dom";
import { submitAuthorBook } from "../api/adminApi";
import { getCategories } from "../api/categoriesApi";


const getInitialStep = () => {
  const saved = sessionStorage.getItem("publishCurrentStep");
  return saved ? parseInt(saved, 10) : 1;
};

// Check if form has any data
const hasFormData = (formData) => {
  return (
    formData.title.trim() !== "" ||
    formData.author.trim() !== "" ||
    formData.description.trim() !== "" ||
    formData.categories.length > 0 ||
    formData.price !== "" ||
    formData.isbn.trim() !== "" ||
    formData.images.length > 0 ||
    formData.pdfFile !== null ||
    formData.year !== ""
  );
};

const Publish = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(getInitialStep);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    categories: [],
    price: "",
    isbn: "",
    images: [],
    pdfFile: null,
    year: "",
    language: "english",
  });
  const [categoriesList, setCategoriesList] = useState([]);
  // const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Import navigation context
  const {
    registerBlocker,
    showWarningModal,
    pendingPath,
    confirmLeave,
    cancelLeave,
  } = useNavigation();

  // Register blocker with navigation context
  useEffect(() => {
    const shouldBlock = hasFormData(formData);
    const onLeave = () => {
      sessionStorage.removeItem("publishFormData");
      sessionStorage.removeItem("publishCurrentStep");
    };
    registerBlocker(shouldBlock, onLeave);

    // Cleanup: unregister blocker when component unmounts
    return () => {
      registerBlocker(false, null);
    };
  }, [formData, registerBlocker]);

  // Handle navigation context modal
  useEffect(() => {
    if (showWarningModal && pendingPath) {
      setShowLeaveModal(true);
      setPendingNavigation(pendingPath);
    }
  }, [showWarningModal, pendingPath]);

  // Handle browser back button
  useEffect(() => {
    if (!hasFormData(formData)) return;

    const handlePopState = (e) => {
      e.preventDefault();
      // Push current state back to prevent navigation
      window.history.pushState(null, "", location.pathname);
      setShowLeaveModal(true);
      setPendingNavigation("back");
    };

    // Push initial state
    window.history.pushState(null, "", location.pathname);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [formData, location.pathname]);

  // Handle browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasFormData(formData)) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formData]);

  // Handle leaving the page
  const handleLeave = () => {
    sessionStorage.removeItem("publishFormData");
    sessionStorage.removeItem("publishCurrentStep");
    setShowLeaveModal(false);

    // If this came from navigation context, use confirmLeave
    if (showWarningModal) {
      const path = confirmLeave();
      if (path) {
        navigate(path);
      }
    } else if (pendingNavigation === "back") {
      window.history.go(-2); // Go back 2 steps (one for pushState, one for actual back)
    } else if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setPendingNavigation(null);
  };

  const handleStay = () => {
    setShowLeaveModal(false);
    setPendingNavigation(null);
    // If this came from navigation context, cancel it
    if (showWarningModal) {
      cancelLeave();
    }
  };

  // Persist form data to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem("publishFormData", JSON.stringify(formData));
  }, [formData]);

  // Persist current step to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem("publishCurrentStep", currentStep.toString());
  }, [currentStep]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategoriesList(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Failed to fetch categories", error);
        setCategoriesList([]);
      }
    };
    fetchCategories();
  }, []);

  const languages = [
    { value: "english", label: "English" },
    { value: "arabic", label: "Arabic" },
    { value: "hindi", label: "Hindi" },
    { value: "spanish", label: "Spanish" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "other", label: "Other" },
  ];


  

  const validateISBN = (isbn) => {
    if (!isbn) return true; // ISBN is optional
    // Basic ISBN validation (10 or 13 digits)
    const cleanIsbn = isbn.replace(/[-\s]/g, "");
    return cleanIsbn.length === 10 || cleanIsbn.length === 13;
  };

  const validatePrice = (price) => {
    return price > 0 && price < 1000000; // Reasonable price range
  };

  const validatePublicationYear = (year) => {
    if (!year) return true; // Optional field
    const currentYear = new Date().getFullYear();
    return year >= 1900 && year <= currentYear;
  };


  const validateTitle = (title) => {
    return title.trim().length >= 2 && title.trim().length <= 200;
  };

  const validateAuthor = (author) => {
    return author.trim().length >= 2 && author.trim().length <= 100;
  };

  const validateDescription = (description) => {
    if (!description) return true; // Optional field
    return description.length <= 1000; // Max 1000 characters
  };

  // Simple toast function
  const showToast = (message, type = "success") => {
    // Create toast element
    const toast = document.createElement("div");
    toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 w-[90%] sm:w-auto text-center rounded-lg font-medium text-white transition-all duration-500 ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    }`;
    toast.dir = i18n.dir();
    toast.textContent = message;

    // Add to page
    document.body.appendChild(toast);

    // Remove after duration
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 1500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setFormData((prev) => ({
      ...prev,
      categories: selectedOptions,
    }));

    // Clear error when user selects
    if (errors.categories) {
      setErrors((prev) => ({
        ...prev,
        categories: "",
      }));
    }
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      showToast(t("Only PDF files are allowed"), "error");
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      showToast(t("PDF size should be less than 50MB"), "error");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      pdfFile: file,
    }));

    if (errors.pdfFile) {
      setErrors((prev) => ({
        ...prev,
        pdfFile: "",
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 5) {
      showToast(t("Maximum 5 images allowed"), "error");
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        showToast(t("Only image files are allowed"), "error");
        return false;
      }

      // Reduced size limit to 500KB to prevent localStorage quota issues
      if (file.size > 500 * 1024) {
        showToast(t("Image size should be less than 500KB"), "error");
        return false;
      }
      return true;
    });

    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        // Book title validation
        if (!formData.title.trim()) {
          newErrors.title = t("Book title is required");
        } else if (!validateTitle(formData.title)) {
          newErrors.title = t("Title must be between 2 and 200 characters");
        }

        // Author validation
        if (!formData.author.trim()) {
          newErrors.author = t("Author name is required");
        } else if (!validateAuthor(formData.author)) {
          newErrors.author = t(
            "Author name must be between 2 and 100 characters",
          );
        }

        // Category validation (multiple)
        if (formData.categories.length === 0) {
          newErrors.categories = t("Please select at least one category");
        }

        // Price validation
        if (!formData.price) {
          newErrors.price = t("Price is required");
        } else if (!validatePrice(formData.price)) {
          newErrors.price = t("Price must be between ₹1 and ₹999,999");
        }

        // ISBN validation
        if (formData.isbn && !validateISBN(formData.isbn)) {
          newErrors.isbn = t("Please enter a valid ISBN (10 or 13 digits)");
        }

        // Publication year validation
        if (formData.year && !validatePublicationYear(formData.year)) {
          newErrors.year = t(
            `Please enter a valid year between 1900 and ${new Date().getFullYear()}`,
          );
        }


        // Description validation
        if (!validateDescription(formData.description)) {
          newErrors.description = t(
            "Description must be less than 1000 characters",
          );
        }

        // PDF file validation
        if (!formData.pdfFile) {
          newErrors.pdfFile = t("Please upload a PDF file of your book");
        }

        break;

      case 2:
        // Image validation
        if (formData.images.length === 0) {
          newErrors.images = t("Please upload at least one book image");
        }
        break;

      case 3:
        // Additional validation can be added here
        break;

      default:
        break;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Scroll to first error
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.querySelector(
        `[name="${firstErrorField}"]`,
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        errorElement.focus();
      }
      return false;
    }

    return true;
  };

  const nextStep = () => {
    // Check if user is authenticated
    if (!user) {
      // Save intent to advance to next step after login
      sessionStorage.setItem("publishPendingNextStep", "true");
      setShowAuthModal(true);
      return;
    }
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Auto-advance to next step after user logs in
  useEffect(() => {
    if (user && sessionStorage.getItem("publishPendingNextStep") === "true") {
      sessionStorage.removeItem("publishPendingNextStep");
      // Only advance if current step validation passes
      if (validateStep(currentStep)) {
        setCurrentStep((prev) => prev + 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    // Clear errors when going back
    setErrors({});
  };
  const goToStep = (targetStep) => {
    // If going to a previous step, allow it without validation
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      setErrors({});
      return;
    }

    // If going to the same step, do nothing
    if (targetStep === currentStep) {
      return;
    }

    // If going to a future step, validate all steps up to the current one
    // First, validate the current step
    if (!validateStep(currentStep)) {
      showToast(
        `${t("Please complete")} ${t(steps[currentStep - 1].title)} ${t(
          "before proceeding",
        )}`,
        "error",
      );
      return;
    }

    // If going to next step, validate current step only
    if (targetStep === currentStep + 1) {
      setCurrentStep(targetStep);
      return;
    }

    // If going to a step beyond next, validate all intermediate steps
    let allValid = true;
    for (let step = currentStep; step < targetStep; step++) {
      if (!validateStep(step)) {
        allValid = false;
        showToast(
          `${t("Please complete")} ${t(steps[step - 1].title)} ${t(
            "before proceeding",
          )}`,
          "error",
        );
        break;
      }
    }

    if (allValid) {
      setCurrentStep(targetStep);
      setErrors({});
    }
  };

  const handlePublish = async () => {
    // Validate all steps before publishing
    let allValid = true;
    for (let step = 1; step <= 3; step++) {
      if (!validateStep(step)) {
        allValid = false;
        break;
      }
    }

    if (!allValid) {
      showToast(
        `${t("Please fix all validation errors before publishing")}`,
        "error",
      );
      setCurrentStep(1);
      return;
    }

    setIsPublishing(true);

    try {
      // Prepare FormData for multipart submission
      const formDataToSubmit = new FormData();

      // Add basic fields
      formDataToSubmit.append("title", formData.title.trim());
      formDataToSubmit.append("author", formData.author.trim());
      formDataToSubmit.append("description", formData.description.trim());
      formDataToSubmit.append("price", parseFloat(formData.price));
      formDataToSubmit.append("language", formData.language);
      
      // Add optional fields
      if (formData.isbn) formDataToSubmit.append("isbn", formData.isbn.trim());
      if (formData.year) formDataToSubmit.append("year", formData.year);

      // Add categories (as JSON array string)
      formDataToSubmit.append("categories", JSON.stringify(formData.categories));

      // Add PDF file
      if (formData.pdfFile) {
        formDataToSubmit.append("pdfFile", formData.pdfFile);
      }

      // Add images
      formData.images.forEach((image, index) => {
        if (image.file) {
          formDataToSubmit.append(`images`, image.file);
        }
      });

      // Submit to backend
      const response = await submitAuthorBook(formDataToSubmit);

      showToast(`${t("Your book has been published successfully!")}`);

      // Reset form
      setFormData({
        title: "",
        author: "",
        description: "",
        categories: [],
        price: "",
        isbn: "",
        images: [],
        pdfFile: null,
        year: "",
        language: "english",
      });
      setCurrentStep(1);
      setErrors({});
      // Clear sessionStorage after successful publish
      sessionStorage.removeItem("publishFormData");
      sessionStorage.removeItem("publishCurrentStep");

      // Redirect to author dashboard or books page
      setTimeout(() => {
        navigate("/author/books");
      }, 1500);
    } catch (error) {
      showToast(
        t("Failed to publish your book. Please try again"),
        "error"
      );
      console.error("Publish error:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  // Helper function to convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const steps = [
    { number: 1, title: "Book Details" },
    { number: 2, title: "Upload Cover and PDF" },
    { number: 3, title: "Review & Publish" },
  ];

  // Helper function to render error message
  const renderError = (fieldName) => {
    if (errors[fieldName]) {
      return (
        <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center">
          <span className="w-1.5 h-1.5 bg-red-500 dark:bg-red-400 rounded-full mr-2"></span>
          {errors[fieldName]}
        </p>
      );
    }
    return null;
  };

  return (
    <>
      {/* Authentication Modal */}
      <AuthModal
        icon={
          <BookOpen className="w-16 h-16 mx-auto text-indigo-600 dark:text-indigo-400" />
        }
        title={t("Please login or create an account to publish your book")}
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Navigation Warning Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            dir={i18n.dir()}
            className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {t("Unsaved Changes")}
                </h3>
              </div>
              <button
                onClick={handleStay}
                className="touch-area text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t(
                "You have unsaved book information. If you leave this page, all your entered data will be lost.",
              )}
            </p>

            <div dir="rtl" className="flex gap-3">
              <button
                onClick={handleStay}
                className="touch-area flex-1 px-4 py-3 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
              >
                {t("Stay on Page")}
              </button>
              <button
                onClick={handleLeave}
                className="touch-area flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors cursor-pointer"
              >
                {t("Leave Page")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        dir={i18n.dir()}
        className="min-h-screen bg-gray-50 dark:bg-zinc-900 pt-20"
      >
        <div className="w-full max-w-337.5 mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t("Publish Your Book")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t(
                "PublishBookParagraph",
                "List your loved books and reach thousands of readers. Fill out the form below to get started.",
              )}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row md:items-center md:justify-between gap-6 sm:gap-2 lg:whitespace-nowrap">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="flex items-center w-full sm:w-auto relative"
                >
                  <button
                    type="button"
                    onClick={() => goToStep(step.number)}
                    className={`touch-area flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      currentStep >= step.number
                        ? "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 hover:scale-110 dark:bg-indigo-500 dark:border-indigo-500"
                        : "border-gray-300 dark:border-zinc-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-zinc-500 hover:bg-gray-50 dark:hover:bg-zinc-800"
                    } font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                    title={
                      currentStep >= step.number
                        ? `Go to step ${step.number}`
                        : `Complete step ${currentStep} first`
                    }
                  >
                    {step.number}
                  </button>
                  <button
                    type="button"
                    onClick={() => goToStep(step.number)}
                    className={`touch-area ml-2 font-medium transition-colors cursor-pointer focus:underline hover:underline focus:outline-none mx-2 ${
                      currentStep >= step.number
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {t(step.title)}
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-[1.2px] sm:w-8 md:w-16 sm:h-0.5 h-4 mx-4 
  absolute start-1 translate-y-8 
  sm:static sm:translate-y-0 ${
    currentStep > step.number
      ? "bg-indigo-600 dark:bg-indigo-500"
      : "bg-gray-300 dark:bg-zinc-600"
  }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="max-w-6xl mx-auto bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6 md:p-8">
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Step 1: Book Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {t("Book Information")}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        {t("Book Title")} *
                      </label>
                      <div className="touch-area relative rounded-lg">
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg dark:bg-zinc-700 dark:border-zinc-600 dark:text-gray-200 dark:placeholder-gray-500 focus:outline-none focus:ring-1 ${
                            errors.title
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-indigo-500"
                          }`}
                          placeholder={t("Enter book title")}
                        />
                      </div>
                      {renderError("title")}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        {t("Author")} *
                      </label>
                      <div className="touch-area relative rounded-lg">
                        <input
                          type="text"
                          name="author"
                          value={formData.author}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg dark:bg-zinc-700 dark:border-zinc-600 dark:text-gray-200 dark:placeholder-gray-500 focus:outline-none focus:ring-1 ${
                            errors.author
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-indigo-500"
                          }`}
                          placeholder={t("Enter author name")}
                        />
                      </div>
                      {renderError("author")}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                        {t("Categories")} * <span className="text-xs text-gray-500">(Select one or more)</span>
                      </label>
                      <div className={`border rounded-lg p-4 ${
                        errors.categories
                          ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                          : "border-gray-300 dark:border-zinc-600"
                      }`}>
                        {categoriesList.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {categoriesList.map((cat) => (
                              <label
                                key={cat._id || cat.id}
                                className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.categories.includes(cat._id || cat.id)}
                                  onChange={(e) => {
                                    const categoryId = cat._id || cat.id;
                                    if (e.target.checked) {
                                      setFormData((prev) => ({
                                        ...prev,
                                        categories: [...prev.categories, categoryId],
                                      }));
                                    } else {
                                      setFormData((prev) => ({
                                        ...prev,
                                        categories: prev.categories.filter((id) => id !== categoryId),
                                      }));
                                    }
                                    if (errors.categories) {
                                      setErrors((prev) => ({
                                        ...prev,
                                        categories: "",
                                      }));
                                    }
                                  }}
                                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 cursor-pointer accent-indigo-600 dark:border-zinc-600 dark:bg-zinc-700 focus:ring-2 focus:ring-indigo-500"
                                />
                                <span className="ml-3 text-gray-700 dark:text-gray-300 font-medium">
                                  {cat.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                            {t("Loading categories...")}
                          </p>
                        )}
                      </div>
                      {renderError("categories")}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        {t("Price")} *
                      </label>
                      <div className="touch-area relative rounded-lg">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg dark:bg-zinc-700 dark:border-zinc-600 dark:text-gray-200 dark:placeholder-gray-500 dark:scheme-dark focus:outline-none focus:ring-1 ${
                            errors.price
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-indigo-500"
                          }`}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      {renderError("price")}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        {t("Language")}
                      </label>
                      <div className="touch-area relative rounded-lg">
                        <select
                          name="language"
                          value={formData.language}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border dark:bg-zinc-700 dark:border-zinc-600 dark:text-gray-200 border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {languages.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                              {lang.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      {t("Description") + " "}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        {t(
                          "DescriptionOptional",
                          "Optional, max 1000 characters",
                        )}
                      </span>
                    </label>
                    <div className="touch-area relative rounded-lg">
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        className={`w-full px-4 py-3 border rounded-lg dark:bg-zinc-700 dark:border-zinc-600 dark:text-gray-200 dark:placeholder-gray-500 focus:outline-none focus:ring-1 ${
                          errors.description
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-indigo-500"
                        }`}
                        placeholder={t(
                          "describeBook",
                          "Describe your book's content, special features, and any notable aspects...",
                        )}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      {renderError("description")}
                      <span
                        className={`text-xs ${
                          formData.description.length > 1000
                            ? "text-red-500"
                            : "text-gray-500"
                        }`}
                      >
                        {formData.description.length}/1000
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        ISBN {`(${t("Optional")})`}
                      </label>
                      <div className="touch-area relative rounded-lg">
                        <input
                          type="text"
                          name="isbn"
                          value={formData.isbn}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg dark:bg-zinc-700 dark:border-zinc-600 dark:text-gray-200 dark:placeholder-gray-500 focus:outline-none focus:ring-1 ${
                            errors.isbn
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-indigo-500"
                          }`}
                          placeholder={`ISBN ${t("number")}`}
                        />
                      </div>
                      {renderError("isbn")}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        {t("Publication Year")}
                      </label>
                      <div className="touch-area relative rounded-lg">
                        <input
                          type="number"
                          name="year"
                          value={formData.year}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg dark:bg-zinc-700 dark:border-zinc-600 dark:text-gray-200 dark:placeholder-gray-500 dark:scheme-dark focus:outline-none focus:ring-1 ${
                            errors.year
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-indigo-500"
                          }`}
                          placeholder="YYYY"
                          min="1900"
                          max={new Date().getFullYear()}
                        />
                      </div>
                      {renderError("year")}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Upload Cover and PDF */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-6">
                    {t("Upload Cover and PDF")}
                  </h2>

                  {/* Book Cover Images */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">
                      {t("Book Cover Images")}
                    </h3>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center ${
                        errors.images
                          ? "border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-950/20"
                          : "border-gray-300 dark:border-zinc-600"
                      }`}
                    >
                      <Image className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                      <p className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">
                        {t("Upload Book Cover Images")}
                      </p>
                      <p className="text-gray-500 dark:text-gray-300 mb-4">
                        {t(
                          "uploadImagesHint",
                          "Upload clear photos of the front cover, back cover, and any notable pages. Maximum 5 images (5MB each).",
                        )}
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="touch-area inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition cursor-pointer"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        {t("Choose Images")}
                      </label>
                      {renderError("images")}
                    </div>

                    {/* Preview Images */}
                    {formData.images.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">
                          {t("Preview")} ({formData.images.length}/5)
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {formData.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image.preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="touch-area absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PDF File Upload */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">
                      {t("Book PDF File")}
                    </h3>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      {t("Book PDF File")} * <span className="text-xs text-gray-500">(Max 50MB)</span>
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
                      errors.pdfFile
                        ? "border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-950/20"
                        : "border-gray-300 dark:border-zinc-600"
                    }`}>
                      {formData.pdfFile ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                              <span className="text-red-600 font-bold text-xs">PDF</span>
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-gray-900 dark:text-gray-200">{formData.pdfFile.name}</p>
                              <p className="text-xs text-gray-500">{(formData.pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, pdfFile: null }))}
                            className="text-red-500 hover:text-red-700 font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">
                            {t("Upload Book PDF")}
                          </p>
                          <p className="text-gray-500 dark:text-gray-300 mb-4 text-sm">
                            {t("Upload the complete PDF file of your book")}
                          </p>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={handlePdfUpload}
                            className="hidden"
                            id="pdf-upload"
                          />
                          <label
                            htmlFor="pdf-upload"
                            className="touch-area inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition cursor-pointer"
                          >
                            <Upload className="w-5 h-5 mr-2" />
                            {t("Choose PDF")}
                          </label>
                        </>
                      )}
                      {renderError("pdfFile")}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Publish */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-2">
                      {t("Review Your Listing")}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {t(
                        "Please review all the information below before publishing your book.",
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Book Details Summary */}
                    <div className="space-y-6">
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4 flex items-center">
                          <BookOpen className="w-5 h-5 mr-2" />
                          {t("Book Details")}
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {t("Title")}:
                            </span>
                            <p className="text-gray-900 dark:text-gray-200 text-right">
                              {formData.title}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {t("Author")}:
                            </span>
                            <p className="text-gray-900 dark:text-gray-200 text-right">
                              {formData.author}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {t("Categories")}:
                            </span>
                            <p className="text-gray-900 dark:text-gray-200 text-right capitalize">
                              {formData.categories.join(", ")}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {t("Price")}:
                            </span>
                            <p
                              dir={i18n.dir()}
                              className="text-gray-900 dark:text-gray-200 text-right"
                            >
                              {formData.price} {t("EGP")}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {t("Language")}:
                            </span>
                            <p className="text-gray-900 dark:text-gray-200 text-right capitalize">
                              {formData.language}
                            </p>
                          </div>
                          {formData.description && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {t("Description")}:
                              </span>
                              <p className="text-gray-900 mt-1 text-sm bg-white p-2 rounded border">
                                {formData.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional Book Details */}
                      {(formData.isbn ||
                        formData.edition ||
                        formData.year) && (
                        <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-3">
                            {t("Additional Details")}
                          </h4>
                          <div className="space-y-2 text-sm">
                            {formData.isbn && (
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {t("ISBN")}:
                                </span>
                                <span className="text-gray-900 dark:text-gray-200">
                                  {formData.isbn}
                                </span>
                              </div>
                            )}
                            {formData.edition && (
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {t("Edition")}:
                                </span>
                                <span className="text-gray-900 dark:text-gray-200">
                                  {formData.edition}
                                </span>
                              </div>
                            )}
                            {formData.year && (
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {t("Publication Year")}:
                                </span>
                                <span className="text-gray-900 dark:text-gray-200">
                                  {formData.year}
                                </span>
                              </div>
                            )}
                           
                            
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Images Preview and Files */}
                    <div className="space-y-6">
                      {/* Images Preview */}
                      {formData.images.length > 0 && (
                        <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-3 flex items-center">
                            <Image className="w-5 h-5 mr-2" />
                            {t("Book Images")} ({formData.images.length})
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {formData.images.map((image, index) => (
                              <img
                                key={index}
                                src={image.preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg border"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PDF File Preview */}
                      {formData.pdfFile && (
                        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-3">
                            {t("Book PDF File")}
                          </h4>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                              <span className="text-red-600 dark:text-red-400 font-bold text-sm">PDF</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-200">{formData.pdfFile.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{(formData.pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Publish Button Section */}
                      <div className="bg-yellow-50 dark:bg-yellow-950/20 p-6 rounded-lg border-2 border-dashed border-yellow-200 dark:border-yellow-700">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-3 text-center">
                          {t("Ready to Publish?")}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-4">
                          {t(
                            "Once published, your book will be visible to all users on the platform.",
                          )}
                        </p>
                        <button
                          onClick={handlePublish}
                          disabled={isPublishing}
                          className="touch-area w-full py-4 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isPublishing ? (
                            <>
                              <div
                                dir={i18n.dir()}
                                className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"
                              ></div>
                              {t("Publishing Your Book...")}
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              {t("Publish Book Now")}
                            </>
                          )}
                        </button>
                        <p className="text-xs text-gray-500 text-center mt-2">
                          {t(
                            "By publishing, you agree to our terms and conditions",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div
                dir="ltr"
                className="flex flex-col sm:flex-row justify-center gap-4 sm:justify-between   mt-8 pt-6 border-t border-gray-200"
              >
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`touch-area px-6 py-3 rounded-lg font-medium ${
                    currentStep === 1
                      ? " bg-gray-200 text-gray-500 cursor-not-allowed"
                      : currentStep === 3
                        ? "hidden sm:block bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                  }`}
                >
                  {t("Previous")}
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="touch-area px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 cursor-pointer"
                  >
                    {currentStep === 2 ? t("Review & Publish") : t("Next")}
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="touch-area px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 cursor-pointer"
                    >
                      {t("Edit Details")}
                    </button>
                    <button
                      onClick={handlePublish}
                      disabled={isPublishing}
                      className="touch-area px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer"
                    >
                      {isPublishing ? (
                        <>
                          <div
                            dir={i18n.dir()}
                            className=" animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
                          ></div>
                          {t("Publishing...")}
                        </>
                      ) : (
                        t("Publish Book")
                      )}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Help Text */}
          <div className="max-w-4xl mx-auto mt-8 text-center text-sm text-gray-500">
            <p>
              {t(
                "By listing your book, you agree to our terms of service. Your name and email will be shared with potential buyers.",
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
export default Publish;
