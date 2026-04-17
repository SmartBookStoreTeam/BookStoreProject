import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import api from "../../api/api";

const RecentOrders = () => {
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          "/admin/orders?pageSize=8&sort=-createdAt",
        );
        if (response.data?.success && Array.isArray(response.data.data)) {
          setRecentOrders(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching recent orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "pending":
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case "rejected":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-900 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">
          Recent Orders
        </h3>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-zinc-700/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-900 rounded-xl shadow-sm p-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Recent Orders</h3>
        <Link to="/admin/orders" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-600 font-medium">
          View All →
        </Link>
      </div>

      <div className="overflow-x-auto -mx-6 sm:mx-0">
        <div className="inline-block min-w-full align-middle px-6 sm:px-0">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Items
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      #{order._id.slice(-6).toUpperCase()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      {order.user?.name || "Unknown"}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-200">
                      {order.total.toFixed(2)} EGP
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span
                        className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3">
                    <span className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200">
                      {order.books?.length || 0} items
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-800">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-bold">{recentOrders.length}</span>{" "}
            recent orders
          </div>
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Total:{" "}
            {recentOrders
              .reduce((sum, order) => sum + order.total, 0)
              .toFixed(2)}{" "}
            EGP
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;
