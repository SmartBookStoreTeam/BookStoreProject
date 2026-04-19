// pages/admin/AdminAnalytics.jsx
import React from "react";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

import { useState, useEffect } from "react";
import api from "../../api/api";

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [analyticsResponse, topBooksResponse] = await Promise.all([
          api.get("/admin/dashboard/analytics"),
          api.get("/books/top?limit=5"),
        ]);

        if (analyticsResponse.data?.success) {
          const analyticsData = analyticsResponse.data.data;
          // Replace topBooks with data from /api/books/top
          const topBooksData =
            topBooksResponse.data?.success &&
            Array.isArray(topBooksResponse.data.data)
              ? topBooksResponse.data.data.map((book) => ({
                  title: book.title,
                  author: book.author,
                  sales: book.sales || 0,
                  revenue: (book.sales || 0) * (book.price || 0),
                }))
              : [];

          setData({
            ...analyticsData,
            topBooks: topBooksData,
          });
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>
          <div className="h-80 bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const { metrics, monthlyData, topCategories, topBooks } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Analytics & Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <ChartBarIcon className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Last updated: Today, 10:30 AM
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl shadow-sm p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sales</p>
              <p className="text-2xl font-bold mt-2 dark:text-white">
                {metrics.totalSales.toLocaleString()} EGP
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500 ml-1">Live</span>
                <span className="text-sm text-gray-500 dark:text-gray-500 ml-2">All time</span>
              </div>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl shadow-sm p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold mt-2 dark:text-white">
                {metrics.totalOrders.toLocaleString()}
              </p>
              <span className="text-sm text-gray-500 dark:text-gray-500 mt-2 block">
                All processed orders
              </span>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <ShoppingCartIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl shadow-sm p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
              <p className="text-2xl font-bold mt-2 dark:text-white">
                {metrics.totalCustomers.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <span
                  className={`text-sm ${metrics.weeklyGrowth >= 0 ? "text-green-500" : "text-red-500"} ml-1`}
                >
                  {metrics.weeklyGrowth.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-500 ml-2">
                  Weekly Growth
                </span>
              </div>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <UsersIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl shadow-sm p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Daily Average</p>
              <p className="text-2xl font-bold mt-2 dark:text-white">
                {metrics.dailyAverage.toFixed(1)}
              </p>
              <span className="text-sm text-gray-500 dark:text-gray-500 mt-2 block">
                Orders per day
              </span>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        {/* Sales Chart */}
        <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl shadow-sm p-6 transition-colors">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Monthly Sales Trend
          </h3>
          <div className="space-y-4">
            {monthlyData.map((month) => (
              <div key={month.month} className="flex items-center">
                <div className="w-16 text-sm text-gray-600 dark:text-gray-400">{month.month}</div>
                <div className="flex-1 ml-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>{month.sales.toLocaleString()} EGP</span>
                    <span>{month.orders} orders</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(month.sales / 15000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl shadow-sm p-6 transition-colors">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Top Categories by Revenue
          </h3>
          <div className="space-y-4">
            {!topCategories || topCategories.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <ChartBarIcon className="h-12 w-12 text-gray-300 dark:text-zinc-700 mx-auto mb-2" />
                <p>No category data available yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Categories will appear here once orders are approved
                </p>
              </div>
            ) : (
              topCategories.map((cat, index) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {cat.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 dark:text-gray-100">
                      {cat.sales.toLocaleString()} EGP
                    </p>
                    <p
                      className={`text-sm ${
                        cat.growth.startsWith("+")
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {cat.growth}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Selling Books */}
      <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Top Selling Books
        </h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Book Title
                  </th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Author
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Units Sold
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Revenue
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Rank
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                {!topBooks || topBooks.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      <BookOpenIcon className="h-12 w-12 text-gray-300 dark:text-zinc-700 mx-auto mb-2" />
                      <p>No sales data available yet</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Books will appear here once orders are approved
                      </p>
                    </td>
                  </tr>
                ) : (
                  topBooks.map((book, index) => (
                    <tr key={book.title} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                          {book.title}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {book.author}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 sm:px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                          {book.sales} units
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
                        ${book.revenue.toLocaleString()}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            index === 0
                              ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300"
                              : index === 1
                                ? "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-300"
                                : index === 2
                                  ? "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300"
                                  : "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300"
                          }`}
                        >
                          <span className="font-bold">#{index + 1}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl shadow-sm p-6 transition-colors">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Conversion Rate</h4>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">4.8%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Visitor to customer conversion
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl shadow-sm p-6 transition-colors">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Customer Retention</h4>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">78%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Repeat customer rate</div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
