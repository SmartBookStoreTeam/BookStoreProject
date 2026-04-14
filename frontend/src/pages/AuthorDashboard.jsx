import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BookOpenIcon,
  CurrencyDollarIcon,
  EyeIcon,
  StarIcon,
  PlusCircleIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  SparklesIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { getAuthorDashboard } from "../api/adminApi";
import { useAuth } from "../context/AuthContext";
/* ── Tiny bar chart ── */
const SimpleBarChart = ({ data }) => {
  const { t } = useTranslation();
  if (!data || data.length === 0)
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        {t("No revenue data yet")}
      </div>
    );
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="flex items-end gap-2 h-40 px-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs text-gray-500">
            {d.revenue > 0 ? `${d.revenue.toFixed(0)}` : ""}
          </span>
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-purple-400 transition-all duration-500"
            style={{ height: `${(d.revenue / max) * 120}px`, minHeight: "4px" }}
            title={`${d.month}: ${d.revenue.toFixed(2)} EGP`}
          />
          <span className="text-xs text-gray-500">{d.month}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Stat card ── */
const StatCard = ({ icon, label, value, sub, color }) => {
  const I = icon;
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div
        className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <I className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

/* ── Book row ── */
const BookRow = ({ book }) => {
  const { t } = useTranslation();
  const categories = book.categories?.map((c) => c.name || c).join(", ") || "—";
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {book.image ? (
            <img
              src={book.image}
              alt={book.title}
              className="h-12 w-9 object-cover rounded-lg shadow-sm flex-shrink-0"
            />
          ) : (
            <div className="h-12 w-9 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpenIcon className="h-5 w-5 text-indigo-400" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-900 line-clamp-1">
              {book.title}
            </p>
            <p className="text-xs text-gray-400">{t(categories)}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
        {(book.price || 0).toFixed(2)} EGP
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-sm font-bold text-indigo-600">
          {book.sales || 0}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-sm text-gray-500">{book.views || 0}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1">
          <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium text-gray-700">
            {book.ratingAvg?.toFixed(1) || "—"}
          </span>
          <span className="text-xs text-gray-400">
            ({book.ratingCount || 0})
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            book.status === "available"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {book.status === "available" ? t("Available") : t("Unavailable")}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-400">
        {new Date(book.createdAt).toLocaleDateString()}
      </td>
    </tr>
  );
};

/* ── Main ── */
const AuthorDashboard = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await getAuthorDashboard();
        if (res.success) setData(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <p className="text-red-500 font-medium">{t(error)}</p>
          <Link
            to="/"
            className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            {t("Go Home")}
          </Link>
        </div>
      </div>
    );
  }

  const { stats, books, monthlyData, author } = data || {};

  return (
    <div className="space-y-8">
      {/* Welcome bar */}
      <div className="bg-indigo-500 rounded-2xl sm:p-4 p-6 text-white flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <p className="text-indigo-100 text-sm font-medium">
            {t("Author Dashboard")}
          </p>
          <h1 dir={i18n.dir()} className="text-2xl font-bold mt-0.5">
            {t("Welcome")}, {author?.name || user?.name}!
          </h1>
          {author?.bio && (
            <p className="text-indigo-200 text-sm mt-1 line-clamp-1">
              {author.bio}
            </p>
          )}
        </div>
        <Link
          to="/author-dashboard/add-book"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-50 transition-colors shadow-lg flex-shrink-0"
        >
          <PlusCircleIcon className="h-5 w-5" />
          {t("Publish New Book")}
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpenIcon}
          label={t("Published Books")}
          value={stats?.totalBooks || 0}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
        />
        <StatCard
          icon={ShoppingCartIcon}
          label={t("Total Sales")}
          value={stats?.totalSales || 0}
          sub={t("Copies Sold")}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          icon={CurrencyDollarIcon}
          label={t("Total Revenue")}
          value={`${(stats?.totalRevenue || 0).toFixed(0)} EGP`}
          color="bg-gradient-to-br from-emerald-500 to-green-600"
        />
        <StatCard
          icon={StarIcon}
          label={t("Avg. Rating")}
          value={stats?.avgRating ? `${stats.avgRating} ★` : "N/A"}
          sub={`${stats?.totalViews || 0} ${t("views")}`}
          color="bg-gradient-to-br from-amber-400 to-orange-500"
        />
      </div>

      {/* Charts + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <ChartBarIcon className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-800">
              {t("Monthly Revenue")}
            </h2>
            <span className="ml-auto text-xs text-gray-400">
              {t("Last") + " " + 6 + " " + t("months")}
            </span>
          </div>
          <SimpleBarChart data={monthlyData} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <ArrowTrendingUpIcon className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-800">
              {t("Quick Stats")}
            </h2>
          </div>
          <div className="space-y-4">
            {[
              {
                label: "Total Books",
                value: stats?.totalBooks || 0,
                icon: BookOpenIcon,
                color: "text-indigo-600 bg-indigo-50",
              },
              {
                label: "Total Views",
                value: (stats?.totalViews || 0).toLocaleString(),
                icon: EyeIcon,
                color: "text-blue-600 bg-blue-50",
              },
              {
                label: "Copies Sold",
                value: stats?.totalSales || 0,
                icon: ShoppingCartIcon,
                color: "text-emerald-600 bg-emerald-50",
              },
              {
                label: "Revenue",
                value: `${(stats?.totalRevenue || 0).toFixed(0)} EGP`,
                icon: CurrencyDollarIcon,
                color: "text-orange-600 bg-orange-50",
              },
              {
                label: "Avg. Rating",
                value: stats?.avgRating ? `${stats.avgRating} / 5` : "N/A",
                icon: StarIcon,
                color: "text-yellow-600 bg-yellow-50",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center ${item.color.split(" ")[1]}`}
                  >
                    <item.icon
                      className={`h-4 w-4 ${item.color.split(" ")[0]}`}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{t(item.label)}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          {author?.portfolioLink && (
            <a
              href={author.portfolioLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-indigo-200 text-indigo-600 text-sm hover:bg-indigo-50 transition-colors"
            >
              <SparklesIcon className="h-4 w-4" />
              {t("View Portfolio")}
            </a>
          )}
        </div>
      </div>
      {/* Books Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5 text-indigo-500 flex-shrink-0" />

            <h2 className="text-base sm:text-lg font-semibold text-gray-800">
              {t("Published Books")}
            </h2>

            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
              {books?.length || 0}
            </span>
          </div>

          <Link
            to="/author-dashboard/add-book"
            className="w-full sm:w-auto flex items-center justify-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <PlusCircleIcon className="h-4 w-4" /> {t("Publish Book")}
          </Link>
        </div>
        {!books || books.length === 0 ? (
          <div className="py-12 sm:py-16 text-center px-4">...</div>
        ) : (
          <>
            {/* 🖥 Desktop Table */}
            <div className="hidden md:block w-full overflow-x-auto">
              <table className="min-w-[750px] w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Book",
                      "Price",
                      "Sales",
                      "Views",
                      "Rating",
                      "Status",
                      "Published",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left"
                      >
                        {t(h)}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {books.map((book) => (
                    <BookRow key={book._id} book={book} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* 📱 Mobile Cards */}
            <div className="md:hidden space-y-4 px-4">
              {books.map((book) => (
                <div
                  key={book._id}
                  className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
                >
                  {/* Title */}
                  <h3 className="font-semibold text-gray-800 text-sm mb-2">
                    {book.title}
                  </h3>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="text-gray-400">Price:</span> {book.price}{" "}
                      EGP
                    </div>

                    <div>
                      <span className="text-gray-400">Sales:</span>{" "}
                      {book.sales || 0}
                    </div>

                    <div>
                      <span className="text-gray-400">Views:</span>{" "}
                      {book.views || 0}
                    </div>

                    <div>
                      <span className="text-gray-400">Rating:</span>{" "}
                      {book.rating ? `${book.rating} ★` : "N/A"}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600">
                      {book.status || "Published"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthorDashboard;
