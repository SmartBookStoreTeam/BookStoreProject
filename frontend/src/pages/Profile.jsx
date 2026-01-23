import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../hooks/useCart";
import { deleteMyAccount } from "../api/adminApi";
import { getCategories } from "../api/categoriesApi";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Calendar,
  ShoppingBag,
  BookOpen,
  ShoppingCart,
  Edit,
  Trash2,
  Eye,
  X,
  ArrowLeft,
  Download,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { getImageSrc } from "../utils/imageUtils";
import UserAvatar from "../components/UserAvatar";

const Profile = () => {
  const { user, logout } = useAuth();
  const { userBooks, removeUserBook, cartItems, purchasedBooks } = useCart();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        if (response.success && Array.isArray(response.data)) {
          // Map API data to the format used in UI ({ value: _id, label: name })
          const formattedCategories = response.data.map((cat) => ({
            value: cat._id,
            label: cat.name,
          }));
          setCategories(formattedCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();

    // Load saved category preferences from localStorage
    const savedCategories = localStorage.getItem("categoryPreferences");
    if (savedCategories) {
      try {
        setSelectedCategories(JSON.parse(savedCategories));
      } catch (error) {
        console.error("Error loading category preferences:", error);
      }
    }
  }, []);

  if (!user) {
    navigate("/register");
    return null;
  }

  const stats = [
    {
      icon: ShoppingBag,
      label: "Total Books",
      value: purchasedBooks?.length + cartItems.length || 0,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: BookOpen,
      label: "Purchased Books",
      value: purchasedBooks?.length || 0,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      icon: ShoppingCart,
      label: "In Cart",
      value: cartItems.length,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      icon: User,
      label: "Member Since",
      value: new Date().getFullYear(),
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  const handleEditSubmit = (e) => {
    e.preventDefault();
    // Implement API call to update user info
    toast.success(t("Profile updated successfully!"), {
      duration: 1500,
      style: {
        background: "#333",
        color: "#fff",
        direction: i18n.dir(),
      },
    });
    setShowEditModal(false);
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        t(
          "Are you sure you want to delete your account? This action cannot be undone.",
        ),
      )
    ) {
      try {
        await deleteMyAccount(); // Call API to delete user self
        logout();
        navigate("/");
        toast.success(t("Account deleted successfully!"), {
          duration: 1500,
          style: {
            background: "#333",
            color: "#fff",
            direction: i18n.dir(),
          },
        });
      } catch (err) {
        console.error(err);
        toast.error(
          err.response?.data?.message || t("Failed to delete account"),
        );
      }
    }
  };

  // Toggle category selection
  const toggleCategory = (category) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((cat) => cat !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Save category preferences
  const saveCategoryPreferences = () => {
    localStorage.setItem(
      "categoryPreferences",
      JSON.stringify(selectedCategories),
    );
    toast.success(t("Preferences saved successfully!"), {
      duration: 1500,
      style: {
        background: "#333",
        color: "#fff",
        direction: i18n.dir(),
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 pt-5 transition-colors duration-300">
      <div className="w-full max-w-[1350px] mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="group touch-area p-2 rounded-full md:hidden flex items-center text-gray-500 dark:text-gray-300 hover:text-gray-900 hover:dark:text-gray-200 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-all" />
          {t("Go Back")}
        </button>
        <h1 className="text-3xl text-center font-bold text-gray-900 dark:text-gray-100 mb-8">
          {t("Profile")}
        </h1>
        {/* Profile Header */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6 sm:p-8 mb-8 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <UserAvatar user={user} size={96} className="shadow-lg text-3xl" />

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {user.name}
              </h1>
              <div className="flex flex-col sm:flex-row items-center gap-4 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {t("Joined")} {new Date().getFullYear()}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setShowEditModal(true)}
              className="touch-area bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              {t("Edit Profile")}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6 transition-colors duration-300"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t(stat.label)}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/*My Library*/}
        <h1 className="text-3xl text-center font-bold text-gray-900 dark:text-gray-100 mb-8">
          {t("My Library")}
        </h1>
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6 sm:p-8 mb-8 transition-colors duration-300">
          {!purchasedBooks || purchasedBooks.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p
                dir={i18n.dir()}
                className="text-gray-600 dark:text-gray-400 mb-4"
              >
                {t("You haven't added any books to your library yet")}
              </p>
              <Link
                dir={i18n.dir()}
                to="/shop"
                className="touch-area text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {t("Browse Books")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {purchasedBooks.map((book, index) => {
                const imageSrc = getImageSrc(
                  book.img ||
                    book.image ||
                    (book.images && book.images[0]) ||
                    "/placeholder-book.jpg",
                );

                return (
                  <div
                    key={book.id || book._id || index}
                    className="group relative bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-zinc-700"
                  >
                    {/* Book Image with Overlay */}
                    <div className="relative overflow-hidden">
                      <div className="touch-area relative aspect-[3/4] overflow-hidden">
                        <img
                          src={imageSrc}
                          alt={book.title}
                          className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-50"
                        />

                        {/* Title and Author */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 cursor-pointer z-10">
                          <h3
                            dir="auto"
                            className="font-bold text-lg text-white line-clamp-2 mb-1 drop-shadow-md"
                          >
                            {book.title}
                          </h3>
                          <p
                            dir="auto"
                            className="text-sm text-gray-200 drop-shadow-md"
                          >
                            {book.author}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 relative z-20">
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          to={`/pdf-viewer/${book._id || book.id}`}
                          state={{ pdfUrl: book.pdf, bookTitle: book.title }}
                          className="touch-area flex-1 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          <Eye size={16} />
                          {t("View")}
                        </Link>
                        <a
                          dir={i18n.dir()}
                          href={book.pdf || "#"}
                          download
                          className="touch-area bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                          title={t("Download PDF")}
                        >
                          <Download className="" size={16} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Category Preferences Section */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6 sm:p-8 mb-8 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t("Your Favorite Categories")}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("Select Your Favorite Book Categories")}
              </p>
            </div>
            {selectedCategories.length > 0 && (
              <button
                onClick={saveCategoryPreferences}
                className="touch-area bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer font-medium"
              >
                {t("Save Preferences")}
              </button>
            )}
          </div>

          {/* Category Pills Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category.value);
              return (
                <button
                  key={category.value}
                  onClick={() => toggleCategory(category.value)}
                  className={`touch-area px-4 py-3 rounded-lg border-2 transition-all duration-200 cursor-pointer font-medium text-sm ${
                    isSelected
                      ? "bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 text-white shadow-md transform scale-105"
                      : "bg-white dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 hover:border-indigo-400 dark:hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-zinc-600"
                  }`}
                >
                  {t(category.label)}
                </button>
              );
            })}
          </div>

          {/* Empty state message */}
          {selectedCategories.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-6 text-sm">
              {t("Select at least one category")}
            </p>
          )}
        </div>

        {/* My Listed Books */}
        <h1 className="text-3xl text-center font-bold text-gray-900 dark:text-gray-100 mb-8">
          {t("My Listed Books")}
        </h1>
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6 sm:p-8 mb-8 transition-colors duration-300">
          <div dir={i18n.dir()} className="flex justify-end items-center mb-6">
            <Link
              to="/publish"
              className="touch-area bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              {t("List New Book")}
            </Link>
          </div>

          {userBooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p
                dir={i18n.dir()}
                className="text-gray-600 dark:text-gray-400 mb-4"
              >
                {t("You haven't listed any books yet")}
              </p>
              <Link
                dir={i18n.dir()}
                to="/publish"
                className="touch-area text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {t("List your first book")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userBooks.map((book) => {
                const imageSrc =
                  book.images && book.images.length > 0
                    ? getImageSrc(book.images[0])
                    : null;

                return (
                  <div
                    key={book.id}
                    className="bg-gray-50 dark:bg-zinc-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Book Image */}
                    <div className="touch-area">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={book.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 dark:bg-zinc-600 flex items-center justify-center">
                          <span className="text-gray-400">{t("No Image")}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="touch-area font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">
                        {book.title}
                      </h3>
                      <div className="flex gap-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          by{" "}
                        </span>
                        <p className="touch-area text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {book.author}
                        </p>
                      </div>
                      <p
                        dir={i18n.dir()}
                        className="text-indigo-600 dark:text-indigo-400 font-bold mb-3"
                      >
                        {book.price} {t("EGP")}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          to={`/book/${book.id}`}
                          className="touch-area flex-1 bg-gray-200 dark:bg-zinc-600 hover:bg-gray-300 dark:hover:bg-zinc-500 text-gray-900 dark:text-gray-100 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm"
                        >
                          <Eye size={14} />
                          {t("View")}
                        </Link>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                t("Are you sure you want to remove this book?"),
                              )
                            ) {
                              removeUserBook(book.id);
                              toast.success(t("Book removed successfully!"), {
                                duration: 1500,
                                style: {
                                  background: "#333",
                                  color: "#fff",
                                  direction: i18n.dir(),
                                },
                              });
                            }
                          }}
                          className="touch-area bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700 p-6 transition-colors duration-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t("Account Actions")}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={logout}
              className="touch-area bg-gray-900 dark:bg-zinc-700 hover:bg-gray-800 dark:hover:bg-zinc-600 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
            >
              {t("Logout")}
            </button>
            <button
              onClick={handleDeleteAccount}
              className="touch-area bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
            >
              {t("Delete Account")}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t("Edit Profile")}
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="touch-area text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("Name")}
                </label>
                <div className="touch-area">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("Email")}
                </label>
                <div className="touch-area">
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-100"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="touch-area flex-1 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-900 dark:text-gray-100 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  className="touch-area flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors cursor-pointer"
                >
                  {t("Save Changes")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
