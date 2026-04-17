// pages/admin/AdminSettings.jsx
import React, { useState } from "react";
import {
  CogIcon,
  BellIcon,
  CreditCardIcon,
  UserIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  BookmarkSquareIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    storeName: "Bookfly Store",
    storeEmail: "bookfly2026@gmail.com",
    storePhone: "+20 123 456 7890",
    storeAddress: "123 Book Street, Zagazig, Egypt",
    currency: "EGP",
    timezone: "Africa/Cairo",
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    twoFactorAuth: true,
    taxRate: 8.5,
  });

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    alert("Settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your store settings and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition shadow-sm"
        >
          <BookmarkSquareIcon className="h-5 w-5" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Store Information */}
        <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl shadow-sm p-6 transition-colors">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <CogIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Store Information
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Basic store details and contact information
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store Name
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => handleChange("storeName", e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store Email
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => handleChange("storeEmail", e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store Phone
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={settings.storePhone}
                  onChange={(e) => handleChange("storePhone", e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store Address
              </label>
              <textarea
                value={settings.storeAddress}
                onChange={(e) => handleChange("storeAddress", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Business Settings */}
        <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl shadow-sm p-6 transition-colors">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CreditCardIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Business Settings
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Pricing and tax configurations for digital downloads
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="EGP">EGP (EGP)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.taxRate}
                onChange={(e) =>
                  handleChange("taxRate", parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl shadow-sm p-6 transition-colors">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <BellIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Configure how you receive alerts and updates
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">Email Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive order and system notifications via email
                </p>
              </div>
              <button
                onClick={() =>
                  handleChange(
                    "emailNotifications",
                    !settings.emailNotifications,
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.emailNotifications ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.emailNotifications
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">SMS Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive urgent alerts via SMS
                </p>
              </div>
              <button
                onClick={() =>
                  handleChange("smsNotifications", !settings.smsNotifications)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.smsNotifications ? "bg-blue-600" : "bg-gray-300 dark:bg-zinc-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.smsNotifications
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl shadow-sm p-6 transition-colors">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Security</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Manage security preferences and access controls
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <LockClosedIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    Two-Factor Authentication
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add an extra layer of security to your account
                </p>
              </div>
              <button
                onClick={() =>
                  handleChange("twoFactorAuth", !settings.twoFactorAuth)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.twoFactorAuth ? "bg-green-600" : "bg-gray-300 dark:bg-zinc-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.twoFactorAuth ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <GlobeAltIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <p className="font-medium text-gray-800 dark:text-gray-200">Maintenance Mode</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Temporarily disable public access to your store
                </p>
              </div>
              <button
                onClick={() =>
                  handleChange("maintenanceMode", !settings.maintenanceMode)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.maintenanceMode ? "bg-yellow-600" : "bg-gray-300 dark:bg-zinc-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.maintenanceMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
