// components/admin/SalesChart.jsx
import React, { useState, useEffect } from "react";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import api from "../../api/api";

const SalesChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    dailyAverage: 0,
    weeklyGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        // Fetch last 7 days sales data
        const response = await api.get("/admin/dashboard/weekly-sales");

        if (response.data?.success && Array.isArray(response.data.data)) {
          const data = response.data.data;
          setSalesData(data);

          // Calculate stats
          const total = data.reduce((sum, d) => sum + (d.sales || 0), 0);
          const avg = data.length > 0 ? total / data.length : 0;
          const growth =
            data.length >= 2 && data[0].sales > 0
              ? (data[data.length - 1].sales / data[0].sales - 1) * 100
              : 0;

          setStats({
            totalSales: total,
            dailyAverage: avg,
            weeklyGrowth: growth,
          });
        }
      } catch (error) {
        console.error("Error fetching sales data:", error);
        // Set default empty data on error
        setSalesData([
          { day: "Mon", sales: 0 },
          { day: "Tue", sales: 0 },
          { day: "Wed", sales: 0 },
          { day: "Thu", sales: 0 },
          { day: "Fri", sales: 0 },
          { day: "Sat", sales: 0 },
          { day: "Sun", sales: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const maxSales =
    salesData.length > 0 ? Math.max(...salesData.map((d) => d.sales || 0)) : 1;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Sales Overview
          </h3>
          <p className="text-sm text-gray-600">Last 7 days performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <ArrowTrendingUpIcon
            className={`h-5 w-5 ${stats.weeklyGrowth >= 0 ? "text-green-500" : "text-red-500"}`}
          />
          <span
            className={`text-sm font-bold ${stats.weeklyGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {stats.weeklyGrowth >= 0 ? "+" : ""}
            {stats.weeklyGrowth.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Chart Bars */}
      <div className="flex items-end justify-between h-48 mt-8">
        {salesData.map((data) => {
          const height = maxSales > 0 ? (data.sales / maxSales) * 100 : 0;
          return (
            <div
              key={data.day}
              className="flex flex-col items-center space-y-2 group"
            >
              <div className="relative">
                <div
                  className="w-10 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 hover:opacity-80"
                  style={{ height: `${Math.max(height, 5)}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {data.sales.toLocaleString()} EGP
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600">{data.day}</div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">
            {stats.totalSales.toLocaleString()} EGP
          </div>
          <div className="text-sm text-gray-600">Total Sales</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">
            {Math.round(stats.dailyAverage).toLocaleString()} EGP
          </div>
          <div className="text-sm text-gray-600">Daily Average</div>
        </div>
        <div className="text-center">
          <div
            className={`text-2xl font-bold ${stats.weeklyGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {stats.weeklyGrowth >= 0 ? "+" : ""}
            {stats.weeklyGrowth.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Weekly Growth</div>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;
