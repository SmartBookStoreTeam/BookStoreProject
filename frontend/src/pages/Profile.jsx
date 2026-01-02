import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../hooks/useCart";
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
} from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import UserAvatar from "../components/UserAvatar";

const Profile = () => {
  const { user, logout } = useAuth();
  const { userBooks, removeUserBook, cartItems } = useCart();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Book categories (same as in Publish.jsx)
  const categories = [
    { value: "cooking", label: "Cooking" },
    { value: "health", label: "Health & Nutrition" },
    { value: "fiction", label: "Fiction" },
    { value: "non-fiction", label: "Non-Fiction" },
    { value: "academic", label: "Academic" },
    { value: "children", label: "Children's Books" },
    { value: "art", label: "Art & Photography" },
    { value: "biography", label: "Biography" },
    { value: "programming", label: "Programming" },
  ];

  // Load saved category preferences from localStorage
  useEffect(() => {
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

  const getImageSrc = (image) => {
    if (!image) return null;
    if (typeof image === "string") return image;
    if (typeof image === "object") {
      return image.base64 || image.preview || image.url || null;
    }
    return null;
  };

  const stats = [
    {
      icon: ShoppingBag,
      label: "Total Books",
      value: 0, //Implement orders from backend
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: BookOpen,
      label: "Books Listed",
      value: userBooks.length,
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

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        t(
          "Are you sure you want to delete your account? This action cannot be undone."
        )
      )
    ) {
      // Implement account deletion
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
      JSON.stringify(selectedCategories)
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
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 pt-20 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20">
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
          <div className="flex justify-end items-center mb-6">
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
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("You haven't listed any books yet")}
              </p>
              <Link
                to="/publish"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
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
                      <p className="text-indigo-600 dark:text-indigo-400 font-bold mb-3">
                        ₹{book.price}
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
                                t("Are you sure you want to remove this book?")
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
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("Name")}
                </label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("Email")}
                </label>
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

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-900 dark:text-gray-100 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors cursor-pointer"
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
