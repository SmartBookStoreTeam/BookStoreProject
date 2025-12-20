import { useState, useEffect } from "react";
import {
  UsersIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  StarIcon,
  EyeIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import { getUsers } from "../../api/adminApi";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewCustomer, setPreviewCustomer] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getUsers();

        // Map and filter only users
        const mappedCustomers = data
          .filter((customer) => customer.role === "user") // <-- only keep role = user
          .map((customer) => ({
            ...customer,
            id: customer._id,
            role: customer.role || "user",
            joinDate: customer.createdAt || new Date(),
            orders: customer.orders || 0,
            totalSpent: customer.totalSpent || 0,
            status: customer.status || "Active",
            phone: customer.phone || "-",
          }));

        setCustomers(mappedCustomers);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleCustomerStatus = async (id) => {
    setCustomers(
      customers?.map((customer) =>
        customer?.id === id
          ? {
              ...customer,
              status: customer.status === "Active" ? "Inactive" : "Active",
            }
          : customer
      )
    );
  };

  const getLoyaltyLevel = (totalSpent) => {
    if (totalSpent > 1000)
      return { level: "Platinum", color: "bg-purple-100 text-purple-800" };
    if (totalSpent > 500)
      return { level: "Gold", color: "bg-yellow-100 text-yellow-800" };
    if (totalSpent > 250)
      return { level: "Silver", color: "bg-gray-100 text-gray-800" };
    return { level: "Bronze", color: "bg-orange-100 text-orange-800" };
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Customer Management
          </h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <UsersIcon className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">
            Total Customers:{" "}
            <span className="font-bold">{customers?.length}</span>
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                {customers?.filter((c) => c.status === "Active").length}
              </p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold mt-1 text-blue-600">
                {customers?.reduce((sum, c) => sum + c.orders, 0)}
              </p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <StarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold mt-1 text-purple-600">
                $
                {customers
                  ?.reduce((sum, c) => sum + c.totalSpent, 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <StarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Order Value</p>
              <p className="text-2xl font-bold mt-1 text-orange-600">
                $
                {(
                  customers.reduce((sum, c) => sum + c.totalSpent, 0) /
                  customers.reduce((sum, c) => sum + c.orders, 1)
                ).toFixed(2)}
              </p>
            </div>
            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <StarIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loyalty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => {
                const loyalty = getLoyaltyLevel(customer.totalSpent);
                return (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="font-medium text-blue-600">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Joined{" "}
                            {new Date(customer.joinDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <EnvelopeIcon className="h-4 w-4 mr-2" />
                          {customer.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <PhoneIcon className="h-4 w-4 mr-2" />
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-center">
                        <span className="text-lg font-bold text-gray-900">
                          {customer.orders}
                        </span>
                        <div className="text-xs text-gray-500">orders</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">
                        ${(customer?.totalSpent ?? 0).toFixed(2)}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${loyalty.color}`}
                      >
                        {loyalty.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${
                          customer.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setPreviewCustomer(customer)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>

                        <button
                          onClick={() => toggleCustomerStatus(customer.id)}
                          className={`p-1 rounded ${
                            customer.status === "Active"
                              ? "text-red-600 hover:text-red-900 hover:bg-red-50"
                              : "text-green-600 hover:text-green-900 hover:bg-green-50"
                          }`}
                          title={
                            customer.status === "Active"
                              ? "Deactivate"
                              : "Activate"
                          }
                        >
                          <NoSymbolIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview */}
      {previewCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">{previewCustomer.name}</h2>

            <p className="text-gray-600 mb-2">
              <span className="font-medium">Email:</span>{" "}
              {previewCustomer.email}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Phone:</span>{" "}
              {previewCustomer.phone}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Orders:</span>{" "}
              {previewCustomer.orders}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Total Spent:</span> $
              {previewCustomer.totalSpent.toFixed(2)}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Status:</span>{" "}
              {previewCustomer.status}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Loyalty Level:</span>{" "}
              {getLoyaltyLevel(previewCustomer.totalSpent).level}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Joined:</span>{" "}
              {new Date(previewCustomer.joinDate).toLocaleDateString()}
            </p>

            <button
              onClick={() => setPreviewCustomer(null)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
