// pages/admin/AdminOrders.jsx
import React, { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CurrencyDollarIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  getOrders,
  approveOrder,
  rejectOrder,
  deleteOrder,
} from "../../api/adminApi";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getOrders();
        const ordersData = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
        // If API fails, orders will remain empty array
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const statusOptions = ["all", "requested", "approved", "rejected"];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "downloaded":
      case "approved":
      case "completed":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "processing":
      case "requested":
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case "cancelled":
      case "rejected":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "downloaded":
      case "approved":
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
      case "requested":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      let updatedOrder;
      if (newStatus === "Downloaded" || newStatus === "approved") {
        updatedOrder = await approveOrder(orderId);
      } else if (newStatus === "Cancelled" || newStatus === "rejected") {
        updatedOrder = await rejectOrder(orderId);
      } else {
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? { ...order, status: updatedOrder?.status || newStatus }
            : order,
        ),
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update order status");
    }
  };

  const handleDelete = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
      alert("Order deleted successfully");
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert("Failed to delete order");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Order Management</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage customer orders</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
            Total Revenue:{" "}
            <span className="text-green-600">
              {orders
                .reduce((sum, order) => sum + (order.total || 0), 0)
                .toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              EGP
            </span>
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {["requested", "approved", "rejected"].map((status) => (
          <div key={status} className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-white">{status}</p>
                <p className="text-xl sm:text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                  {orders.filter((o) => o.status === status).length}
                </p>
              </div>
              {getStatusIcon(status)}
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border bg-gray-50 dark:bg-zinc-700 dark:text-white border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "All Status" : option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="w-full divide-y divide-gray-200 dark:divide-zinc-700">
              <thead className="bg-gray-50 dark:bg-zinc-800 dark:text-white">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-800 dark:bg-zinc-800 dark:text-white">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600 dark:text-white">
                          Loading orders...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-zinc-700">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {order._id.slice(-8)}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                          {order.user?.name || "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-200">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-zinc-700 dark:text-gray-200">
                          {order.items?.length || 0} items
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-200">
                          {order.total.toFixed(2)} EGP
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 sm:px-3 py-1 text-xs rounded-full ${getStatusColor(
                              order.status,
                            )}`}
                          >
                            {order.status}
                          </span>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(order._id, e.target.value)
                            }
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white dark:border-gray-600"
                          >
                            {statusOptions
                              .filter((o) => o !== "all")
                              .map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium dark:text-gray-200">
                        <div className="flex space-x-2">
                          <button
                            className="cursor-pointer text-blue-600 hover:text-blue-500 p-1 hover:bg-blue-50 rounded dark:hover:bg-zinc-800 dark:text-white dark:border-zinc-700"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            className="cursor-pointer text-green-600 hover:text-green-500 p-1 hover:bg-green-50 rounded dark:hover:bg-zinc-800 dark:text-white dark:border-zinc-700"
                            title="Mark as Downloaded"
                            onClick={() =>
                              updateOrderStatus(order._id, "approved")
                            }
                          >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </button>
                          <button
                            className="cursor-pointer text-red-600 hover:text-red-500 p-1 hover:bg-red-50 rounded dark:hover:bg-zinc-800 dark:text-white dark:border-zinc-700"
                            title="Cancel Order"
                            onClick={() =>
                              updateOrderStatus(order._id, "rejected")
                            }
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            className="cursor-pointer text-gray-600 hover:text-red-500 hover:bg-red-50 rounded p-1 dark:hover:bg-zinc-800 dark:text-white dark:border-zinc-700"
                            title="Delete Order"
                            onClick={() => handleDelete(order._id)}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-zinc-700 bg-white dark:bg-zinc-800">
          {loading ? (
            <div className="px-4 py-12 text-center">
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 "></div>
                <span className="ml-3 text-gray-600 dark:text-white">Loading orders...</span>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-500 dark:text-white">
              No orders found
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-700 dark:bg-zinc-800 dark:text-white dark:border-zinc-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm font-medium text-blue-600 mb-1 dark:text-blue-400">
                      #{order._id.slice(-8)}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      {order.user?.name || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm text-gray-600 dark:text-white">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-white dark:border-zinc-700">
                      {order.items?.length || 0} items
                    </span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-200">
                    {order.total.toFixed(2)} EGP
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  {/* Status Selector */}
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus(order._id, e.target.value)
                    }
                    className="text-xs border border-gray-300 bg-gray-50 dark:bg-zinc-800 dark:text-white dark:border-zinc-700 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                  >
                    {statusOptions
                      .filter((o) => o !== "all")
                      .map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                  </select>

                  {/* Mobile Actions */}
                  <div className="flex gap-1">
                    <button
                      className="text-blue-600 bg-gray-50 hover:text-blue-900 dark:hover:text-blue-400 cursor-pointer p-2 hover:bg-blue-50 dark:hover:bg-zinc-800 rounded dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="text-green-600 bg-gray-50  hover:text-green-900 dark:hover:text-green-400 cursor-pointer p-2 hover:bg-green-50 dark:hover:bg-zinc-800 rounded dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
                      title="Approve"
                      onClick={() =>
                        updateOrderStatus(order._id, "approved")
                      }
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="text-red-600 bg-gray-50  hover:text-red-900 dark:hover:text-red-400 cursor-pointer p-2 hover:bg-red-50 dark:hover:bg-zinc-800 rounded dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
                      title="Reject"
                      onClick={() =>
                        updateOrderStatus(order._id, "rejected")
                      }
                    >
                      <XCircleIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="text-gray-600 bg-gray-50  hover:text-red-600 dark:hover:text-red-400 cursor-pointer p-2 hover:bg-red-50 dark:hover:bg-zinc-800 rounded dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
                      title="Delete"
                      onClick={() => handleDelete(order._id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Summary */}
        <div className="px-6 py-4 border-t border-gray-200  bg-gray-50 dark:bg-zinc-800 dark:text-white dark:border-zinc-700">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="text-sm text-gray-600 dark:text-white">
              Total Orders:{" "}
              <span className="font-bold">{filteredOrders.length}</span>
            </div>
            <div className="text-sm font-bold text-gray-800 dark:text-white">
              Total Value:{" "}
              {filteredOrders
                .reduce((sum, order) => sum + order.total, 0)
                .toFixed(2)}{" "}
              EGP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
