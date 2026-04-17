import { useState, useEffect } from "react";
import {
  TagIcon,
  PlusCircleIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  getAllCoupons,
  createCoupon,
  generateCoupon,
  deleteCoupon,
  toggleCoupon,
} from "../../api/couponsApi";
import toast from "react-hot-toast";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // form state
  const [form, setForm] = useState({
    code: "",
    discountPercent: "",
    expiresAt: "",
    maxUses: "",
    autoGenerate: false,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await getAllCoupons();
      setCoupons(res.data || []);
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.discountPercent || !form.expiresAt) {
      toast.error("Discount percent and expiry date are required");
      return;
    }
    if (Number(form.discountPercent) < 1 || Number(form.discountPercent) > 100) {
      toast.error("Discount must be between 1% and 100%");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        discountPercent: Number(form.discountPercent),
        expiresAt: form.expiresAt,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
      };

      if (form.autoGenerate) {
        await generateCoupon(payload);
      } else {
        if (form.code) payload.code = form.code;
        await createCoupon(payload);
      }

      toast.success("Coupon created successfully!");
      setForm({ code: "", discountPercent: "", expiresAt: "", maxUses: "", autoGenerate: false });
      setShowForm(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      toast.success("Coupon deleted");
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleCoupon(id);
      setCoupons((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isActive: res.data.isActive } : c)),
      );
      toast.success(`Coupon ${res.data.isActive ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to toggle coupon");
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  const isExpired = (date) => new Date() > new Date(date);

  const activeCoupons = coupons.filter((c) => c.isActive && !isExpired(c.expiresAt)).length;
  const expiredCoupons = coupons.filter((c) => isExpired(c.expiresAt)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Coupon Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage discount coupons for your store</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="cursor-pointer flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-sm"
        >
          <PlusCircleIcon className="h-5 w-5" />
          New Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Coupons", value: coupons.length, color: "blue", icon: TagIcon },
          { label: "Active", value: activeCoupons, color: "green", icon: CheckCircleIcon },
          { label: "Expired", value: expiredCoupons, color: "red", icon: XCircleIcon },
          {
            label: "Inactive",
            value: coupons.filter((c) => !c.isActive).length,
            color: "gray",
            icon: ArrowPathIcon,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl shadow-sm p-4 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className={`text-xl sm:text-2xl font-bold mt-1 text-${stat.color}-600 dark:text-${stat.color === 'gray' ? 'gray-300' : stat.color + '-400'}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`h-10 w-10 bg-${stat.color}-100 dark:bg-${stat.color === 'gray' ? 'zinc-700' : stat.color + '-900/30'} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-600 dark:text-${stat.color === 'gray' ? 'gray-400' : stat.color + '-400'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Coupon Form */}
      {showForm && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-indigo-100 dark:border-zinc-800 p-6 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <SparklesIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Create New Coupon</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Fill in the details below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Auto-generate toggle */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-700/50 rounded-lg border border-transparent dark:border-zinc-700/50">
              <button
                type="button"
                onClick={() => handleFormChange("autoGenerate", !form.autoGenerate)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  form.autoGenerate ? "bg-indigo-600" : "bg-gray-300 dark:bg-zinc-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    form.autoGenerate ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto-generate coupon code
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Code */}
              {!form.autoGenerate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Coupon Code <span className="text-gray-400 dark:text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SUMMER20"
                    value={form.code}
                    onChange={(e) => handleFormChange("code", e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono uppercase transition-colors"
                  />
                </div>
              )}

              {/* Discount Percent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Discount Percent <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g. 20"
                    value={form.discountPercent}
                    onChange={(e) => handleFormChange("discountPercent", e.target.value)}
                    className="w-full px-3 py-2 pr-8 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold">
                    %
                  </span>
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.expiresAt}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => handleFormChange("expiresAt", e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              {/* Max Uses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Max Uses <span className="text-gray-400 dark:text-gray-500">(leave empty for unlimited)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={form.maxUses}
                  onChange={(e) => handleFormChange("maxUses", e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="cursor-pointer flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-60"
              >
                {submitting ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircleIcon className="h-4 w-4" />
                )}
                {submitting ? "Creating..." : "Create Coupon"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="cursor-pointer px-6 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm overflow-hidden border border-transparent dark:border-zinc-800 transition-colors">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-700 flex items-center gap-2">
          <TagIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          <h3 className="font-semibold text-gray-800 dark:text-white">All Coupons</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-indigo-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <TagIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No coupons yet</p>
            <p className="text-gray-400 text-sm">Create your first coupon above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-100 dark:divide-zinc-700">
              <thead className="bg-gray-50 dark:bg-zinc-900/50">
                <tr>
                  {["Code", "Discount", "Expires", "Max Uses", "Status", "Created", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                {coupons.map((coupon) => {
                  const expired = isExpired(coupon.expiresAt);
                  return (
                    <tr key={coupon._id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                      {/* Code */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-zinc-700 px-2 py-0.5 rounded">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                            title="Copy code"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="px-4 py-3">
                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          {coupon.discountPercent}%
                        </span>
                      </td>

                      {/* Expires */}
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm ${expired ? "text-red-600 dark:text-red-400 font-semibold" : "text-gray-700 dark:text-gray-300"}`}
                        >
                          {new Date(coupon.expiresAt).toLocaleDateString()}
                          {expired && (
                            <span className="ml-1 text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded">
                              Expired
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Max Uses */}
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {coupon.maxUses !== null ? coupon.maxUses : (
                          <span className="text-gray-400 dark:text-gray-500 italic">Unlimited</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            coupon.isActive && !expired
                              ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                              : "bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {coupon.isActive && !expired ? (
                            <CheckCircleIcon className="h-3.5 w-3.5" />
                          ) : (
                            <XCircleIcon className="h-3.5 w-3.5" />
                          )}
                          {coupon.isActive && !expired
                            ? "Active"
                            : expired
                              ? "Expired"
                              : "Inactive"}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(coupon.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggle(coupon._id)}
                            className={`cursor-pointer p-1.5 rounded-lg transition-colors ${
                              coupon.isActive
                                ? "text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                            }`}
                            title={coupon.isActive ? "Deactivate" : "Activate"}
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id, coupon.code)}
                            className="cursor-pointer p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete coupon"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;
