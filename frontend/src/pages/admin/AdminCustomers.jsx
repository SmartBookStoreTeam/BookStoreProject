import { useState, useEffect } from "react";
import {
  UsersIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  StarIcon,
  EyeIcon,
  NoSymbolIcon,
  PencilSquareIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { getUsers, updateUserRole } from "../../api/adminApi";
import toast from "react-hot-toast";

const AdminCustomers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewCustomer, setPreviewCustomer] = useState(null);
  const [roleLoadingId, setRoleLoadingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [activeTab, setActiveTab] = useState("customers"); // "customers" | "authors"

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers({ pageSize: 1000 });
        const usersData = Array.isArray(response.data) ? response.data : [];

        const mapped = usersData
          .filter((u) => u.role !== "admin")
          .map((u) => ({
            ...u,
            id: u._id,
            role: u.role || "user",
            joinDate: u.createdAt || new Date(),
            orders: u.ordersCount || 0,
            totalSpent: u.totalSpent || 0,
            status: u.status || "Active",
            phone: u.phone || "-",
          }));

        setAllUsers(mapped);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, []);

  const customers = allUsers.filter((u) => u.role === "user");
  const authors   = allUsers.filter((u) => u.role === "author");
  const activeList = activeTab === "customers" ? customers : authors;

  const filtered = activeList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleStatus = (id) => {
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u
      )
    );
  };

  const handleRoleChange = (customer, targetRole) => {
    setConfirmModal({ customer, targetRole });
  };

  const confirmRoleChange = async () => {
    if (!confirmModal) return;
    const { customer, targetRole } = confirmModal;
    setConfirmModal(null);
    setRoleLoadingId(customer.id);
    try {
      await updateUserRole(customer.id, targetRole);
      setAllUsers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, role: targetRole } : c))
      );
      toast.success(`${customer.name} is now ${targetRole === "author" ? "an Author" : "a User"}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update role");
    } finally {
      setRoleLoadingId(null);
    }
  };

  const getLoyaltyLevel = (totalSpent) => {
    if (totalSpent > 1000) return { level: "Platinum", color: "bg-purple-100 text-purple-800" };
    if (totalSpent > 500)  return { level: "Gold",     color: "bg-yellow-100 text-yellow-800" };
    if (totalSpent > 250)  return { level: "Silver",   color: "bg-gray-100 text-gray-800" };
    return { level: "Bronze", color: "bg-orange-100 text-orange-800" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600">Manage customers and authors</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <UsersIcon className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">
            Total: <span className="font-bold">{allUsers.length}</span>
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Customers</p>
              <p className="text-xl sm:text-2xl font-bold mt-1 text-blue-600">{customers.length}</p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Authors</p>
              <p className="text-xl sm:text-2xl font-bold mt-1 text-indigo-600">{authors.length}</p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <PencilSquareIcon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold mt-1 text-purple-600">
                {allUsers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
                <span className="ml-1 text-sm">EGP</span>
              </p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <StarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Avg. Order Value</p>
              <p className="text-xl sm:text-2xl font-bold mt-1 text-orange-600">
                {(
                  allUsers.reduce((sum, c) => sum + c.totalSpent, 0) /
                  Math.max(allUsers.reduce((sum, c) => sum + c.orders, 0), 1)
                ).toFixed(2)}
                <span className="ml-1 text-sm">EGP</span>
              </p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <StarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab("customers"); setSearchTerm(""); }}
          className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "customers"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <UsersIcon className="h-4 w-4" />
          Customers ({customers.length})
        </button>
        <button
          onClick={() => { setActiveTab("authors"); setSearchTerm(""); }}
          className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "authors"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <BookOpenIcon className="h-4 w-4" />
          Authors ({authors.length})
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab} by name or email...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="w-full divide-y divide-gray-200">
              <thead className={activeTab === "authors" ? "bg-indigo-50" : "bg-gray-50"}>
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === "authors" ? "Author" : "Customer"}
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  {activeTab === "customers" && (
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loyalty
                    </th>
                  )}
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-400">
                      No {activeTab} found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((customer) => {
                    const loyalty  = getLoyaltyLevel(customer.totalSpent);
                    const isAuthor = customer.role === "author";
                    return (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center">
                            <div className={`h-8 w-8 sm:h-10 sm:w-10 shrink-0 ${isAuthor ? "bg-indigo-100" : "bg-blue-100"} rounded-full flex items-center justify-center`}>
                              <span className={`text-xs sm:text-sm font-medium ${isAuthor ? "text-indigo-600" : "text-blue-600"}`}>
                                {customer.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-3 sm:ml-4 min-w-0">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                {customer.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Joined {new Date(customer.joinDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4">
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
                        <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                          <div className="text-center">
                            <span className="text-lg font-bold text-gray-900">{customer.orders}</span>
                            <div className="text-xs text-gray-500">orders</div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">
                            {(customer?.totalSpent ?? 0).toFixed(2)} EGP
                          </div>
                        </td>
                        {activeTab === "customers" && (
                          <td className="hidden sm:table-cell px-6 py-4">
                            <span className={`px-2 sm:px-3 py-1 text-xs rounded-full ${loyalty.color}`}>
                              {loyalty.level}
                            </span>
                          </td>
                        )}
                        <td className="px-4 sm:px-6 py-4 text-sm font-medium">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setPreviewCustomer(customer)}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                              title="View Details"
                            >
                              <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>

                            {/* Show "Make Author" only if user applied as author (pending), always show "Revert User" for authors */}
                            {(isAuthor || customer.applicationStatus === "pending") && (
                              <button
                                onClick={() => handleRoleChange(customer, isAuthor ? "user" : "author")}
                                disabled={roleLoadingId === customer.id}
                                className={`p-1 rounded text-xs font-medium px-2 py-1 transition-colors ${
                                  isAuthor
                                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                                } disabled:opacity-50`}
                                title={isAuthor ? "Revert to User" : "Make Author"}
                              >
                                {roleLoadingId === customer.id ? "..." : isAuthor ? "Revert User" : "Make Author"}
                              </button>
                            )}

                            <button
                              onClick={() => toggleStatus(customer.id)}
                              className={`p-1 rounded ${
                                customer.status === "Active"
                                  ? "text-red-600 hover:text-red-900 hover:bg-red-50"
                                  : "text-green-600 hover:text-green-900 hover:bg-green-50"
                              }`}
                              title={customer.status === "Active" ? "Deactivate" : "Activate"}
                            >
                              <NoSymbolIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-12 w-12 rounded-full ${previewCustomer.role === "author" ? "bg-indigo-100" : "bg-blue-100"} flex items-center justify-center`}>
                <span className={`text-lg font-bold ${previewCustomer.role === "author" ? "text-indigo-600" : "text-blue-600"}`}>
                  {previewCustomer.name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold">{previewCustomer.name}</h2>
                <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${previewCustomer.role === "author" ? "bg-indigo-100 text-indigo-800" : "bg-gray-100 text-gray-600"}`}>
                  {previewCustomer.role === "author" ? "Author" : "User"}
                </span>
              </div>
            </div>

            <p className="text-gray-600 mb-2"><span className="font-medium">Email:</span> {previewCustomer.email}</p>
            <p className="text-gray-600 mb-2"><span className="font-medium">Phone:</span> {previewCustomer.phone}</p>
            <p className="text-gray-600 mb-2"><span className="font-medium">Orders:</span> {previewCustomer.orders}</p>
            <p className="text-gray-600 mb-2"><span className="font-medium">Total Spent:</span> {previewCustomer.totalSpent.toFixed(2)} EGP</p>
            <p className="text-gray-600 mb-2"><span className="font-medium">Status:</span> {previewCustomer.status}</p>
            <p className="text-gray-600 mb-2"><span className="font-medium">Loyalty Level:</span> {getLoyaltyLevel(previewCustomer.totalSpent).level}</p>
            <p className="text-gray-600 mb-2"><span className="font-medium">Joined:</span> {new Date(previewCustomer.joinDate).toLocaleDateString()}</p>

            <button
              onClick={() => setPreviewCustomer(null)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirm Role Change Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Confirm Role Change</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to{" "}
              {confirmModal.targetRole === "author" ? "promote" : "revert"}{" "}
              <span className="font-semibold">{confirmModal.customer.name}</span> to{" "}
              <span className="font-semibold capitalize">{confirmModal.targetRole}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmRoleChange}
                className={`flex-1 py-2 rounded-lg text-white font-medium transition-colors ${
                  confirmModal.targetRole === "author" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;