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
        const response = await api.get("/admin/dashboard/analytics");
        if (response.data?.success) {
          setData(response.data.data);
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
        <div className="h-20 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 rounded-lg"></div>
          <div className="h-80 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-2xl font-bold text-gray-800">
            Analytics & Reports
          </h1>
          <p className="text-gray-600">
            Detailed insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <ChartBarIcon className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-gray-600">
            Last updated: Today, 10:30 AM
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold mt-2">
                {metrics.totalSales.toLocaleString()}
                {" "}
                EGP
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500 ml-1">Live</span>
                <span className="text-sm text-gray-500 ml-2">All time</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold mt-2">
                {metrics.totalOrders.toLocaleString()}
              </p>
              <span className="text-sm text-gray-500 mt-2 block">
                All processed orders
              </span>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold mt-2">
                {metrics.totalCustomers.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <span
                  className={`text-sm ${metrics.weeklyGrowth >= 0 ? "text-green-500" : "text-red-500"} ml-1`}
                >
                  {metrics.weeklyGrowth.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  Weekly Growth
                </span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Daily Average</p>
              <p className="text-2xl font-bold mt-2">
                {metrics.dailyAverage.toFixed(1)}
              </p>
              <span className="text-sm text-gray-500 mt-2 block">
                Orders per day
              </span>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Monthly Sales Trend
          </h3>
          <div className="space-y-4">
            {monthlyData.map((month) => (
              <div key={month.month} className="flex items-center">
                <div className="w-16 text-sm text-gray-600">{month.month}</div>
                <div className="flex-1 ml-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{month.sales.toLocaleString()} EGP</span>
                    <span>{month.orders} orders</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
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
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Top Categories by Revenue
          </h3>
          <div className="space-y-4">
            {topCategories.map((cat, index) => (
              <div
                key={cat.category}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{cat.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">
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
            ))}
          </div>
        </div>
      </div>

      {/* Top Selling Books */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Top Selling Books
        </h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Book Title
                  </th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Author
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Units Sold
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Revenue
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rank
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topBooks.map((book, index) => (
                  <tr key={book.title} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800 text-sm sm:text-base">
                        {book.title}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-600">
                      {book.author}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 sm:px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {book.sales} units
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      ${book.revenue.toLocaleString()}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-800"
                            : index === 1
                              ? "bg-gray-100 text-gray-800"
                              : index === 2
                                ? "bg-orange-100 text-orange-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        <span className="font-bold">#{index + 1}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="font-medium text-gray-800 mb-3">Conversion Rate</h4>
          <div className="text-3xl font-bold text-blue-600">4.8%</div>
          <div className="text-sm text-gray-600 mt-1">
            Visitor to customer conversion
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="font-medium text-gray-800 mb-3">Customer Retention</h4>
          <div className="text-3xl font-bold text-green-600">78%</div>
          <div className="text-sm text-gray-600 mt-1">Repeat customer rate</div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
