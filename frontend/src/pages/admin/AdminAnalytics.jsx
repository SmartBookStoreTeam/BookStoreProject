// pages/admin/AdminAnalytics.jsx
import React from "react";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon ,
  UsersIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

const AdminAnalytics = () => {
  const monthlyData = [
    { month: "Jan", sales: 4200, orders: 150, customers: 120 },
    { month: "Feb", sales: 5200, orders: 180, customers: 140 },
    { month: "Mar", sales: 6100, orders: 210, customers: 160 },
    { month: "Apr", sales: 7300, orders: 240, customers: 190 },
    { month: "May", sales: 8200, orders: 280, customers: 210 },
    { month: "Jun", sales: 9500, orders: 310, customers: 240 },
    { month: "Jul", sales: 10800, orders: 340, customers: 270 },
    { month: "Aug", sales: 9700, orders: 290, customers: 230 },
    { month: "Sep", sales: 8900, orders: 260, customers: 200 },
    { month: "Oct", sales: 11200, orders: 380, customers: 290 },
    { month: "Nov", sales: 12500, orders: 410, customers: 320 },
    { month: "Dec", sales: 13800, orders: 450, customers: 350 },
  ];

  const topCategories = [
    { category: "Fiction", sales: 24500, growth: "+12%" },
    { category: "Technology", sales: 18900, growth: "+18%" },
    { category: "Self-Help", sales: 15600, growth: "+8%" },
    { category: "Business", sales: 12400, growth: "+22%" },
    { category: "Romance", sales: 9800, growth: "+5%" },
  ];

  const topBooks = [
    {
      title: "Digital Dreams",
      author: "John Smith",
      sales: 342,
      revenue: 6830,
    },
    { title: "The Silent Echo", author: "Jane Doe", sales: 298, revenue: 7450 },
    {
      title: "Code Revolution",
      author: "Mike Chen",
      sales: 256,
      revenue: 8945,
    },
    { title: "Mindful Living", author: "Lisa Wong", sales: 234, revenue: 4446 },
    {
      title: "Data Science 101",
      author: "Sarah Miller",
      sales: 189,
      revenue: 7551,
    },
  ];

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
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold mt-2">$124,560</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon  className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500 ml-1">+12.5%</span>
                <span className="text-sm text-gray-500 ml-2">
                  from last month
                </span>
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
              <p className="text-2xl font-bold mt-2">3,845</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon  className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500 ml-1">+8.2%</span>
                <span className="text-sm text-gray-500 ml-2">
                  from last month
                </span>
              </div>
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
              <p className="text-2xl font-bold mt-2">2,456</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon  className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500 ml-1">+5.7%</span>
                <span className="text-sm text-gray-500 ml-2">
                  from last month
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
              <p className="text-sm text-gray-600">Avg. Order Value</p>
              <p className="text-2xl font-bold mt-2">$89.50</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon  className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500 ml-1">+3.9%</span>
                <span className="text-sm text-gray-500 ml-2">
                  from last month
                </span>
              </div>
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
                    <span>${month.sales.toLocaleString()}</span>
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
                    ${cat.sales.toLocaleString()}
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Book Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Author
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Units Sold
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Revenue
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rank
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topBooks.map((book, index) => (
                <tr key={book.title} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">
                      {book.title}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {book.author}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {book.sales} units
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    ${book.revenue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
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

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="font-medium text-gray-800 mb-3">Stock Turnover</h4>
          <div className="text-3xl font-bold text-purple-600">3.2x</div>
          <div className="text-sm text-gray-600 mt-1">
            Annual inventory turnover
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
