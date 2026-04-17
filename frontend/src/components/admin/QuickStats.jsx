import { useState, useEffect } from "react";
import {
  ShoppingBagIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import api from "../../api/api";

const QuickStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/dashboard/stats");
        if (response.data?.success) {
          const data = response.data.data;

          setStats([
            {
              title: "Today's Orders",
              value: data.todaysOrders.toString(),
              change:
                data.ordersChange >= 0
                  ? `+${data.ordersChange}`
                  : data.ordersChange.toString(),
              trend: data.ordersChange >= 0 ? "up" : "down",
              icon: ShoppingBagIcon,
              color: "bg-blue-500",
              changeColor:
                data.ordersChange >= 0 ? "text-green-500" : "text-red-500",
            },
            {
              title: "Today's Revenue",
              value: `${data.todaysRevenue.toFixed(2)} EGP`,
              change:
                data.revenueChange >= 0
                  ? `+${data.revenueChange.toFixed(0)} EGP`
                  : `${data.revenueChange.toFixed(0)} EGP`,
              trend: data.revenueChange >= 0 ? "up" : "down",
              icon: CurrencyDollarIcon,
              color: "bg-green-500",
              changeColor:
                data.revenueChange >= 0 ? "text-green-500" : "text-red-500",
            },
            {
              title: "New Customers",
              value: data.newCustomersToday.toString(),
              change:
                data.customersChange >= 0
                  ? `+${data.customersChange}`
                  : data.customersChange.toString(),
              trend: data.customersChange >= 0 ? "up" : "down",
              icon: UserGroupIcon,
              color: "bg-purple-500",
              changeColor:
                data.customersChange >= 0 ? "text-green-500" : "text-red-500",
            },
            {
              title: "Pending Orders",
              value: data.pendingOrders.toString(),
              change: "",
              trend: "neutral",
              icon: ShoppingBagIcon,
              color: "bg-orange-500",
              changeColor: "text-gray-500",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-900 rounded-xl shadow-sm p-5 animate-pulse"
          >
            <div className="h-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-900 rounded-xl shadow-sm p-5 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
              <div className="flex items-baseline mt-2">
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stat.value}</p>
                {stat.change && (
                  <div className={`flex items-center ml-3 ${stat.changeColor}`}>
                    {stat.trend === "up" ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : stat.trend === "down" ? (
                      <ArrowDownIcon className="h-4 w-4" />
                    ) : null}
                    <span className="text-sm font-medium ml-1 dark:text-gray-200">
                      {stat.change}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className={`${stat.color} p-3 rounded-xl`}>
              <stat.icon className="h-6 w-6 text-white dark:text-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
