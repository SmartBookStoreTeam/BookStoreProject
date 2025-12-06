import { useState } from "react";
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
} from "lucide-react";
import { useCart } from "../hooks/useCart";

const Sell = () => {
  const { addUserBook } = useCart();
  const [formData, setFormData] = useState({
    // Book Information
    title: "",
    author: "",
    description: "",
    category: "",
    price: "",
    condition: "excellent",
    isbn: "",

    // Book Images
    images: [],

    // Seller Information
    sellerName: "",
    sellerEmail: "",
    sellerPhone: "",
    sellerLocation: "",

    // Additional Details
    edition: "",
    publisher: "",
    publicationYear: "",
    pages: "",
    language: "english",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    { value: "", label: "Select Category" },
    { value: "cooking", label: "Cooking" },
    { value: "baking", label: "Baking" },
    { value: "desserts", label: "Desserts" },
    { value: "health", label: "Health & Nutrition" },
    { value: "fiction", label: "Fiction" },
    { value: "non-fiction", label: "Non-Fiction" },
    { value: "academic", label: "Academic" },
    { value: "children", label: "Children's Books" },
    { value: "art", label: "Art & Photography" },
    { value: "biography", label: "Biography" },
    { value: "other", label: "Other" },
  ];

  const conditions = [
    { value: "excellent", label: "Excellent - Like new" },
    { value: "very-good", label: "Very Good - Minimal wear" },
    { value: "good", label: "Good - Some signs of use" },
    { value: "fair", label: "Fair - Noticeable wear" },
    { value: "poor", label: "Poor - Heavy wear but readable" },
  ];

  const languages = [
    { value: "english", label: "English" },
    { value: "arabic", label: "Arabic" },
    { value: "hindi", label: "Hindi" },
    { value: "spanish", label: "Spanish" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "other", label: "Other" },
  ];

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return true; // Phone is optional

    // Remove all spaces, hyphens, parentheses, and plus signs for cleaning
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, "");

    // Egyptian phone number patterns:
    // 1) Mobile numbers: 01XXXXXXXXX (11 digits starting with 01)
    //    - 010, 011, 012, 015
    // 2) Landlines: 0X XXXXXXXX (varied lengths)

    // Check if it's a valid Egyptian number
    const mobileRegex = /^(01[0-25])([0-9]{8})$/; // 010, 011, 012, 015 followed by 8 digits
    const landlineRegex = /^(0[2-8])([0-9]{7,8})$/; // 02-08 followed by 7-8 digits

    // Check for mobile numbers (11 digits total)
    if (cleanPhone.length === 11 && mobileRegex.test(cleanPhone)) {
      return true;
    }

    // Check for landline numbers (8-9 digits total)
    if (
      (cleanPhone.length === 8 || cleanPhone.length === 9) &&
      landlineRegex.test(cleanPhone)
    ) {
      return true;
    }

    // Check for numbers with country code (+20)
    if (cleanPhone.startsWith("20")) {
      const withoutCountryCode = cleanPhone.substring(2);

      // Mobile with country code: 201XXXXXXXXX (10 digits after 20)
      if (
        withoutCountryCode.length === 10 &&
        mobileRegex.test("0" + withoutCountryCode)
      ) {
        return true;
      }

      // Landline with country code: 20X XXXXXXX (8-9 digits after 20)
      if (
        (withoutCountryCode.length === 8 || withoutCountryCode.length === 9) &&
        landlineRegex.test("0" + withoutCountryCode)
      ) {
        return true;
      }
    }

    return false;
  };

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

  const validatePages = (pages) => {
    if (!pages) return true; // Optional field
    return pages > 0 && pages < 50000; // Reasonable page count
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name.trim());
  };

  const validateLocation = (location) => {
    return location.trim().length >= 2 && location.trim().length <= 100;
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
    toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    }`;
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 5) {
      showToast("Maximum 5 images allowed", "error");
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        showToast("Only image files are allowed", "error");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        showToast("Image size should be less than 5MB", "error");
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
          newErrors.title = "Book title is required";
        } else if (!validateTitle(formData.title)) {
          newErrors.title = "Title must be between 2 and 200 characters";
        }

        // Author validation
        if (!formData.author.trim()) {
          newErrors.author = "Author name is required";
        } else if (!validateAuthor(formData.author)) {
          newErrors.author = "Author name must be between 2 and 100 characters";
        }

        // Category validation
        if (!formData.category) {
          newErrors.category = "Please select a category";
        }

        // Price validation
        if (!formData.price) {
          newErrors.price = "Price is required";
        } else if (!validatePrice(formData.price)) {
          newErrors.price = "Price must be between ₹1 and ₹999,999";
        }

        // ISBN validation
        if (formData.isbn && !validateISBN(formData.isbn)) {
          newErrors.isbn = "Please enter a valid ISBN (10 or 13 digits)";
        }

        // Publication year validation
        if (
          formData.publicationYear &&
          !validatePublicationYear(formData.publicationYear)
        ) {
          newErrors.publicationYear = `Please enter a valid year between 1900 and ${new Date().getFullYear()}`;
        }

        // Pages validation
        if (formData.pages && !validatePages(formData.pages)) {
          newErrors.pages = "Please enter a valid page count";
        }

        // Description validation
        if (!validateDescription(formData.description)) {
          newErrors.description =
            "Description must be less than 1000 characters";
        }

        break;

      case 2:
        // Image validation
        if (formData.images.length === 0) {
          newErrors.images = "Please upload at least one book image";
        }
        break;

      case 3:
        // Seller name validation
        if (!formData.sellerName.trim()) {
          newErrors.sellerName = "Your name is required";
        } else if (!validateName(formData.sellerName)) {
          newErrors.sellerName =
            "Please enter a valid name (2-50 characters, letters only)";
        }

        // Email validation
        if (!formData.sellerEmail.trim()) {
          newErrors.sellerEmail = "Email address is required";
        } else if (!validateEmail(formData.sellerEmail)) {
          newErrors.sellerEmail = "Please enter a valid email address";
        }

        // Phone validation
        if (formData.sellerPhone && !validatePhone(formData.sellerPhone)) {
          newErrors.sellerPhone = "Please enter a valid Egyptian phone number";
        }

        // Location validation
        if (!formData.sellerLocation.trim()) {
          newErrors.sellerLocation = "Location is required";
        } else if (!validateLocation(formData.sellerLocation)) {
          newErrors.sellerLocation =
            "Please enter a valid location (2-100 characters)";
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Scroll to first error
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.querySelector(
        `[name="${firstErrorField}"]`
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
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    // Clear errors when going back
    setErrors({});
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
      showToast("Please fix all validation errors before publishing", "error");
      setCurrentStep(1);
      return;
    }

    setIsPublishing(true);

    try {
      // Convert images to base64 for persistent storage
      const processedImages = await Promise.all(
        formData.images.map(async (image) => {
          if (image.file) {
            const base64 = await convertToBase64(image.file);
            return {
              base64,
              name: image.file.name,
              type: image.file.type,
            };
          }
          return image; // If it's already processed
        })
      );

      // Prepare book data for storage
      const bookData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        condition: formData.condition,
        isbn: formData.isbn.trim(),
        images: processedImages, // Use processed images
        sellerName: formData.sellerName.trim(),
        sellerEmail: formData.sellerEmail.trim(),
        sellerPhone: formData.sellerPhone.trim(),
        sellerLocation: formData.sellerLocation.trim(),
        edition: formData.edition.trim(),
        publisher: formData.publisher.trim(),
        publicationYear: formData.publicationYear,
        pages: formData.pages,
        language: formData.language,
      };

      // Save to context (which saves to localStorage)
      addUserBook(bookData);

      showToast("Your book has been published successfully!");

      // Reset form
      setFormData({
        title: "",
        author: "",
        description: "",
        category: "",
        price: "",
        condition: "excellent",
        isbn: "",
        images: [],
        sellerName: "",
        sellerEmail: "",
        sellerPhone: "",
        sellerLocation: "",
        edition: "",
        publisher: "",
        publicationYear: "",
        pages: "",
        language: "english",
      });
      setCurrentStep(1);
      setErrors({});
    } catch (error) {
      showToast("Failed to publish your book. Please try again.", error);
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
    { number: 2, title: "Upload Images" },
    { number: 3, title: "Seller Info" },
    { number: 4, title: "Review & Publish" },
  ];

  // Helper function to render error message
  const renderError = (fieldName) => {
    if (errors[fieldName]) {
      return (
        <p className="text-red-500 text-sm mt-1 flex items-center">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
          {errors[fieldName]}
        </p>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sell Your Book
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            List your pre-loved books and reach thousands of readers. Fill out
            the form below to get started.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-gray-300 text-gray-500"
                  } font-semibold`}
                >
                  {step.number}
                </div>
                <span
                  className={`ml-2 font-medium ${
                    currentStep >= step.number
                      ? "text-indigo-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      currentStep > step.number
                        ? "bg-indigo-600"
                        : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Step 1: Book Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Book Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Book Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 ${
                        errors.title
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-indigo-500"
                      }`}
                      placeholder="Enter book title"
                    />
                    {renderError("title")}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author *
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 ${
                        errors.author
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-indigo-500"
                      }`}
                      placeholder="Enter author name"
                    />
                    {renderError("author")}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 ${
                        errors.category
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-indigo-500"
                      }`}
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    {renderError("category")}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-1 ${
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition
                    </label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {conditions.map((condition) => (
                        <option key={condition.value} value={condition.value}>
                          {condition.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {languages.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                    <span className="text-xs text-gray-500 ml-1">
                      (Optional, max 1000 characters)
                    </span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 ${
                      errors.description
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-indigo-500"
                    }`}
                    placeholder="Describe your book's content, special features, and any notable aspects..."
                  />
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ISBN (Optional)
                    </label>
                    <input
                      type="text"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 ${
                        errors.isbn
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-indigo-500"
                      }`}
                      placeholder="ISBN number"
                    />
                    {renderError("isbn")}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Edition
                    </label>
                    <input
                      type="text"
                      name="edition"
                      value={formData.edition}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g., 1st, 2nd"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publication Year
                    </label>
                    <input
                      type="number"
                      name="publicationYear"
                      value={formData.publicationYear}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 ${
                        errors.publicationYear
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-indigo-500"
                      }`}
                      placeholder="YYYY"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                    {renderError("publicationYear")}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publisher
                    </label>
                    <input
                      type="text"
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Publisher name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Pages
                    </label>
                    <input
                      type="number"
                      name="pages"
                      value={formData.pages}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 ${
                        errors.pages
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-indigo-500"
                      }`}
                      placeholder="Number of pages"
                      min="1"
                    />
                    {renderError("pages")}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Upload Images */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Upload Book Images
                </h2>

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    errors.images
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                >
                  <Image className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Upload book images
                  </p>
                  <p className="text-gray-500 mb-4">
                    Upload clear photos of the front cover, back cover, and any
                    notable pages. Maximum 5 images (5MB each).
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
                    className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition cursor-pointer"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Choose Images
                  </label>
                  {renderError("images")}
                </div>

                {/* Preview Images */}
                {formData.images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Preview ({formData.images.length}/5)
                    </h3>
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
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Seller Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Seller Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="sellerName"
                        value={formData.sellerName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-1 ${
                          errors.sellerName
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-indigo-500"
                        }`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {renderError("sellerName")}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="sellerEmail"
                        value={formData.sellerEmail}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-1 ${
                          errors.sellerEmail
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-indigo-500"
                        }`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {renderError("sellerEmail")}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                      <span className="text-xs text-gray-500 ml-1">
                        (Optional)
                      </span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="sellerPhone"
                        value={formData.sellerPhone}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-1 ${
                          errors.sellerPhone
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-indigo-500"
                        }`}
                        placeholder="e.g., 01012345678 or 0212345678"
                      />
                    </div>
                    {renderError("sellerPhone")}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location/City *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="sellerLocation"
                        value={formData.sellerLocation}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-1 ${
                          errors.sellerLocation
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-indigo-500"
                        }`}
                        placeholder="Enter your city"
                      />
                    </div>
                    {renderError("sellerLocation")}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Publish */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Review Your Listing
                  </h2>
                  <p className="text-gray-600">
                    Please review all the information below before publishing
                    your book.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Book Details Summary */}
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2" />
                        Book Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Title:
                          </span>
                          <p className="text-gray-900 text-right">
                            {formData.title}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Author:
                          </span>
                          <p className="text-gray-900 text-right">
                            {formData.author}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Category:
                          </span>
                          <p className="text-gray-900 text-right capitalize">
                            {formData.category}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Price:
                          </span>
                          <p className="text-gray-900 text-right">
                            ₹{formData.price}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Condition:
                          </span>
                          <p className="text-gray-900 text-right capitalize">
                            {formData.condition}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Language:
                          </span>
                          <p className="text-gray-900 text-right capitalize">
                            {formData.language}
                          </p>
                        </div>
                        {formData.description && (
                          <div>
                            <span className="font-medium text-gray-700">
                              Description:
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
                      formData.publicationYear ||
                      formData.pages) && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Additional Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          {formData.isbn && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">ISBN:</span>
                              <span className="text-gray-900">
                                {formData.isbn}
                              </span>
                            </div>
                          )}
                          {formData.edition && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Edition:</span>
                              <span className="text-gray-900">
                                {formData.edition}
                              </span>
                            </div>
                          )}
                          {formData.publicationYear && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Publication Year:
                              </span>
                              <span className="text-gray-900">
                                {formData.publicationYear}
                              </span>
                            </div>
                          )}
                          {formData.pages && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Pages:</span>
                              <span className="text-gray-900">
                                {formData.pages}
                              </span>
                            </div>
                          )}
                          {formData.publisher && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Publisher:</span>
                              <span className="text-gray-900">
                                {formData.publisher}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Seller Information Summary */}
                  <div className="space-y-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Seller Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Name:
                          </span>
                          <p className="text-gray-900 text-right">
                            {formData.sellerName}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Email:
                          </span>
                          <p className="text-gray-900 text-right">
                            {formData.sellerEmail}
                          </p>
                        </div>
                        {formData.sellerPhone && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">
                              Phone:
                            </span>
                            <p className="text-gray-900 text-right">
                              {formData.sellerPhone}
                            </p>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            Location:
                          </span>
                          <p className="text-gray-900 text-right">
                            {formData.sellerLocation}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Images Preview */}
                    {formData.images.length > 0 && (
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Image className="w-5 h-5 mr-2" />
                          Book Images ({formData.images.length})
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

                    {/* Publish Button Section */}
                    <div className="bg-yellow-50 p-6 rounded-lg border-2 border-dashed border-yellow-200">
                      <h4 className="font-semibold text-gray-900 mb-3 text-center">
                        Ready to Publish?
                      </h4>
                      <p className="text-sm text-gray-600 text-center mb-4">
                        Once published, your book will be visible to all users
                        on the platform.
                      </p>
                      <button
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        {isPublishing ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            Publishing Your Book...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Publish Book Now
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        By publishing, you agree to our terms and conditions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-medium ${
                  currentStep === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                >
                  {currentStep === 3 ? "Review & Publish" : "Next"}
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isPublishing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Publishing...
                      </>
                    ) : (
                      "Publish Book"
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
            By listing your book, you agree to our terms of service. Your
            contact information will be shared with potential buyers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sell;
