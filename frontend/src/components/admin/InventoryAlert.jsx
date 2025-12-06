// components/admin/InventoryAlert.jsx
import React from "react";
import { ExclamationTriangleIcon  } from "@heroicons/react/24/outline";

const InventoryAlert = () => {
  const lowStockBooks = [
    { title: "Midnight Garden", stock: 3, threshold: 10 },
    { title: "Cooking Basics", stock: 5, threshold: 15 },
    { title: "The Last Kingdom", stock: 8, threshold: 10 },
    { title: "Ancient History", stock: 2, threshold: 5 },
  ];

  const outOfStockBooks = [
    { title: "Mindful Living", outSince: "2024-01-10" },
    { title: "Digital Photography", outSince: "2024-01-12" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Inventory Alerts
        </h3>
        <span className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full">
          {lowStockBooks.length + outOfStockBooks.length} Alerts
        </span>
      </div>

      {/* Low Stock Books */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <ExclamationTriangleIcon  className="h-5 w-5 text-yellow-500" />
          <h4 className="font-medium text-gray-800">
            Low Stock ({lowStockBooks.length})
          </h4>
        </div>
        <div className="space-y-3">
          {lowStockBooks.map((book) => (
            <div
              key={book.title}
              className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-800">{book.title}</div>
                <div className="text-sm text-gray-600">
                  Only {book.stock} units left (threshold: {book.threshold})
                </div>
              </div>
              <button className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200">
                Reorder
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Out of Stock Books */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          <h4 className="font-medium text-gray-800">
            Out of Stock ({outOfStockBooks.length})
          </h4>
        </div>
        <div className="space-y-3">
          {outOfStockBooks.map((book) => (
            <div
              key={book.title}
              className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-800">{book.title}</div>
                <div className="text-sm text-gray-600">
                  Out of stock since{" "}
                  {new Date(book.outSince).toLocaleDateString()}
                </div>
              </div>
              <button className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200">
                Restock
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Total inventory value: $24,580
          </span>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View Full Inventory →
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryAlert;
