// components/admin/SalesChart.jsx
import React from 'react';
import { ArrowTrendingUpIcon  } from '@heroicons/react/24/outline';

const SalesChart = () => {
  const salesData = [
    { day: 'Mon', sales: 4200 },
    { day: 'Tue', sales: 5200 },
    { day: 'Wed', sales: 6100 },
    { day: 'Thu', sales: 7300 },
    { day: 'Fri', sales: 8200 },
    { day: 'Sat', sales: 9500 },
    { day: 'Sun', sales: 10800 },
  ];

  const maxSales = Math.max(...salesData.map(d => d.sales));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Sales Overview</h3>
          <p className="text-sm text-gray-600">Weekly sales performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <ArrowTrendingUpIcon  className="h-5 w-5 text-green-500" />
          <span className="text-sm font-bold text-green-600">+12.5%</span>
        </div>
      </div>

      {/* Chart Bars */}
      <div className="flex items-end justify-between h-48 mt-8">
        {salesData.map((data) => {
          const height = (data.sales / maxSales) * 100;
          return (
            <div key={data.day} className="flex flex-col items-center space-y-2">
              <div className="relative">
                <div
                  className="w-10 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 hover:opacity-80"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    ${data.sales.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600">{data.day}</div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">${salesData.reduce((sum, d) => sum + d.sales, 0).toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Sales</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{Math.round(salesData.reduce((sum, d) => sum + d.sales, 0) / salesData.length).toLocaleString()}</div>
          <div className="text-sm text-gray-600">Daily Average</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">+{((salesData[salesData.length - 1].sales / salesData[0].sales - 1) * 100).toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Weekly Growth</div>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;