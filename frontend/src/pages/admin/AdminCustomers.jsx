import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
            phone: u.phoneNumber || u.phone || "-",
            nationalId: u.nationalId,
            portfolioLink: u.portfolioLink,
            bio: u.bio,
            digitalSignature: u.digitalSignature,
            applicationStatus: u.applicationStatus,
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


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage customers and authors</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <UsersIcon className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Total: <span className="font-bold">{allUsers.length}</span>
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl shadow-sm p-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Customers</p>
              <p className="text-xl sm:text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{customers.length}</p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl shadow-sm p-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Authors</p>
              <p className="text-xl sm:text-2xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">{authors.length}</p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <PencilSquareIcon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl shadow-sm p-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">
                {allUsers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
                <span className="ml-1 text-sm">EGP</span>
              </p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <StarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl shadow-sm p-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Avg. Order Value</p>
              <p className="text-xl sm:text-2xl font-bold mt-1 text-orange-600 dark:text-orange-400">
                {(
                  allUsers.reduce((sum, c) => sum + c.totalSpent, 0) /
                  Math.max(allUsers.reduce((sum, c) => sum + c.orders, 0), 1)
                ).toFixed(2)}
                <span className="ml-1 text-sm">EGP</span>
              </p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <StarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-zinc-700">
        <button
          onClick={() => { setActiveTab("customers"); setSearchTerm(""); }}
          className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "customers"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          <UsersIcon className="h-4 w-4" />
          Customers ({customers.length})
        </button>
        <button
          onClick={() => { setActiveTab("authors"); setSearchTerm(""); }}
          className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "authors"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
              : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          <BookOpenIcon className="h-4 w-4" />
          Authors ({authors.length})
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl shadow-sm p-4 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab} by name or email...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="w-full divide-y divide-gray-200 dark:divide-zinc-700">
              <thead className={activeTab === "authors" ? "bg-indigo-50 dark:bg-indigo-900/20" : "bg-gray-50 dark:bg-zinc-900/50"}>
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {activeTab === "authors" ? "Author" : "Customer"}
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-400">
                      No {activeTab} found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((customer) => {
                    const isAuthor = customer.role === "author";
                    return (
                      <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center">
                            <div className={`h-8 w-8 sm:h-10 sm:w-10 shrink-0 ${isAuthor ? "bg-indigo-100 dark:bg-indigo-900/40" : "bg-blue-100 dark:bg-blue-900/40"} rounded-full flex items-center justify-center`}>
                              <span className={`text-xs sm:text-sm font-medium ${isAuthor ? "text-indigo-600 dark:text-indigo-400" : "text-blue-600 dark:text-blue-400"}`}>
                                {customer.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-3 sm:ml-4 min-w-0">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {customer.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Joined {new Date(customer.joinDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                              <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                              {customer.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                              <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                              {customer.phone}
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                          <div className="text-center">
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{customer.orders}</span>
                            <div className="text-xs text-gray-500 dark:text-gray-400">orders</div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {(customer?.totalSpent ?? 0).toFixed(2)} EGP
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm font-medium">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setPreviewCustomer(customer)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>

                            {/* Show "Make Author" only if user applied as author (pending), always show "Revert User" for authors */}
                             {(isAuthor || customer.applicationStatus === "pending") && (
                              <button
                                onClick={() => handleRoleChange(customer, isAuthor ? "user" : "author")}
                                disabled={roleLoadingId === customer.id}
                                className={`p-1 rounded text-xs font-medium px-2 py-1 transition-all cursor-pointer ${
                                  isAuthor
                                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-600"
                                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
                                } disabled:opacity-50`}
                                title={isAuthor ? "Revert to User" : "Make Author"}
                              >
                                {roleLoadingId === customer.id ? "..." : isAuthor ? "Revert User" : "Make Author"}
                              </button>
                            )}

                            <button
                              onClick={() => toggleStatus(customer.id)}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                customer.status === "Active"
                                  ? "text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                                  : "text-green-600 hover:text-green-900 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/30"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-all scale-in-center">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-800/30">
              <div className="flex items-center gap-4">
                <div className={`h-14 w-14 rounded-2xl shadow-sm ${previewCustomer.role === "author" ? "bg-indigo-600 text-white" : "bg-blue-600 text-white"} flex items-center justify-center text-xl font-bold`}>
                  {previewCustomer.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{previewCustomer.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider ${previewCustomer.role === "author" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"}`}>
                      {previewCustomer.role === "author" ? t("Author") : t("User")}
                    </span>
                    {previewCustomer.applicationStatus === "pending" && (
                      <span className="px-2.5 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                        {t("Pending App")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setPreviewCustomer(null)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Basics */}
                <div className="space-y-6">
                  <section>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-4 border-l-4 border-blue-500 pl-3">{t("Contact Details")}</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg"><EnvelopeIcon className="h-5 w-5 text-gray-500" /></div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t("Email Address")}</p>
                          <p className="text-sm text-gray-900 dark:text-white font-semibold">{previewCustomer.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg"><PhoneIcon className="h-5 w-5 text-gray-500" /></div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t("Phone Number")}</p>
                          <p className="text-sm text-gray-900 dark:text-white font-semibold">{previewCustomer.phone}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-4 border-l-4 border-green-500 pl-3">{t("Activity Stats")}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t("Orders")}</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{previewCustomer.orders}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t("Revenue")}</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{previewCustomer.totalSpent.toFixed(0)} <span className="text-xs font-normal">EGP</span></p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Column: Author Info */}
                <div className="space-y-6">
                  {(previewCustomer.role === "author" || previewCustomer.applicationStatus === "pending") ? (
                    <section className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 h-full">
                      <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-5">{t("Author Profile")}</h3>
                      <div className="space-y-5">
                        {previewCustomer.nationalId && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{t("National ID")}</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white tracking-wider">{previewCustomer.nationalId}</p>
                          </div>
                        )}
                        {previewCustomer.portfolioLink && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{t("Portfolio")}</p>
                            <a href={previewCustomer.portfolioLink} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-bold break-all block">
                              {previewCustomer.portfolioLink}
                            </a>
                          </div>
                        )}
                        {previewCustomer.bio && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{t("Biography")}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed">"{previewCustomer.bio}"</p>
                          </div>
                        )}
                      </div>
                    </section>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-zinc-800/30 rounded-3xl border border-dashed border-gray-300 dark:border-zinc-700">
                      <UsersIcon className="h-12 w-12 text-gray-300 dark:text-zinc-600 mb-3" />
                      <p className="text-gray-400 dark:text-zinc-500 text-sm text-center">Standard customer profile.<br/>No author application submitted.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Signature Section */}
              {(previewCustomer.role === "author" || previewCustomer.applicationStatus === "pending") && previewCustomer.digitalSignature && (
                <div className="mt-10 pt-6 border-t border-gray-100 dark:border-zinc-800">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-4 text-center">{t("Verified Digital Signature")}</h3>
                  <div className="flex justify-center">
                    <div className="bg-white p-6 rounded-2xl shadow-inner border border-gray-100 dark:border-zinc-800">
                      <img src={previewCustomer.digitalSignature} alt="Signature" className="max-h-32 w-auto grayscale contrast-125" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50/50 dark:bg-zinc-800/30 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                {t("Member ID")}: {previewCustomer.id.slice(-8).toUpperCase()}
              </p>
              <button
                onClick={() => setPreviewCustomer(null)}
                className="px-8 py-2.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-bold hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-gray-200 dark:shadow-none"
              >
                {t("Done")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Role Change Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-2xl shadow-xl max-w-sm w-full p-6 transition-colors">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirm Role Change</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to{" "}
              {confirmModal.targetRole === "author" ? "promote" : "revert"}{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-200">{confirmModal.customer.name}</span> to{" "}
              <span className="font-semibold capitalize text-gray-900 dark:text-gray-200">{confirmModal.targetRole}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmRoleChange}
                className={`flex-1 py-2 rounded-lg text-white font-medium transition-colors cursor-pointer ${
                  confirmModal.targetRole === "author" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-600 hover:bg-gray-700 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                }`}
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer"
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