// pages/admin/AdminDashboard.jsx (Updated with all components)
import { useState, useEffect } from "react";
import QuickStats from "../../components/admin/QuickStats";
import RecentOrders from "../../components/admin/RecentOrders";
import TopBooks from "../../components/admin/TopBooks";
import SalesChart from "../../components/admin/SalesChart";
import api from "../../api/api";
import UserAvatar from "../../components/UserAvatar";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const [performanceStats, setPerformanceStats] = useState(null);

  useEffect(() => {
    const fetchPerformanceStats = async () => {
      try {
        const response = await api.get("/admin/dashboard/stats");
        if (response.data?.success) {
          setPerformanceStats(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching performance stats:", error);
      }
    };

    fetchPerformanceStats();
  }, []);

  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Bar */}
      <div className="bg-white dark:bg-zinc-800 shadow-sm rounded-2xl p-6 border border-gray-100 dark:border-zinc-700 flex flex-col sm:flex-row gap-4 sm:items-center">
        <UserAvatar user={user} size={64} className="ring-4 ring-blue-500/20 shadow-xl" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Welcome back, {user?.name?.split(" ")[0] || "Admin"}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your store today.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats />

      {/* Charts and Top Books */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <TopBooks />
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 gap-6">
        <RecentOrders />
      </div>

      {/* Additional Info Section */}
      <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-900 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Store Performance Summary
        </h3>
        {performanceStats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-zinc-800/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {performanceStats.totalBooks}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Books</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-zinc-800/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {performanceStats.averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-zinc-800/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {performanceStats.returnCustomerPercentage.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Return Customers</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="text-center p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg animate-pulse"
              >
                <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
