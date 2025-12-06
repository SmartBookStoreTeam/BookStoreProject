import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const RecentOrders = () => {
  const recentOrders = [
    {
      id: "ORD-245",
      customer: "Alex Johnson",
      date: "2024-01-15",
      total: 89.97,
      status: "Delivered",
      items: 3,
    },
    {
      id: "ORD-246",
      customer: "Maria Garcia",
      date: "2024-01-15",
      total: 129.5,
      status: "Processing",
      items: 5,
    },
    {
      id: "ORD-247",
      customer: "David Smith",
      date: "2024-01-14",
      total: 45.99,
      status: "Shipped",
      items: 2,
    },
    {
      id: "ORD-248",
      customer: "Sarah Wilson",
      date: "2024-01-14",
      total: 199.99,
      status: "Pending",
      items: 4,
    },
    {
      id: "ORD-249",
      customer: "James Brown",
      date: "2024-01-13",
      total: 67.5,
      status: "Cancelled",
      items: 3,
    },
    {
      id: "ORD-250",
      customer: "Lisa Taylor",
      date: "2024-01-13",
      total: 234.0,
      status: "Delivered",
      items: 6,
    },
    {
      id: "ORD-251",
      customer: "Mike Davis",
      date: "2024-01-12",
      total: 89.99,
      status: "Processing",
      items: 2,
    },
    {
      id: "ORD-252",
      customer: "Emma Clark",
      date: "2024-01-12",
      total: 156.75,
      status: "Shipped",
      items: 5,
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "Processing":
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case "Shipped":
        return <TruckIcon className="h-5 w-5 text-blue-500" />;
      case "Cancelled":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      case "Shipped":
        return "bg-blue-100 text-blue-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All →
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-blue-600">
                    {order.id}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">
                    {order.customer}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(order.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-bold text-gray-900">
                    ${order.total.toFixed(2)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {order.items} items
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing <span className="font-bold">{recentOrders.length}</span>{" "}
            recent orders
          </div>
          <div className="text-sm font-medium text-gray-800">
            Total: $
            {recentOrders
              .reduce((sum, order) => sum + order.total, 0)
              .toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;
