"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import Navigation from "@/components/Common/Navigation";
import { getAnalytics } from "@/services/analyticsService";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getAnalytics({ period });
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600";
      case "IN_PROGRESS":
        return "text-blue-600";
      case "COMPLETED":
        return "text-green-600";
      case "CANCELLED":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["PHARMACY", "ADMIN"]}>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
          <Navigation title="Analytics" userRole="pharmacy" />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading analytics...</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["PHARMACY", "ADMIN"]}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <Navigation title="Analytics Dashboard" userRole="pharmacy" />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600">
                  Comprehensive insights into your pharmacy performance
                </p>
              </div>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </motion.div>

          {analytics && (
            <>
              {/* Key Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              >
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 text-lg">💰</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(analytics.sales.totalRevenue)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-lg">📦</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(analytics.sales.totalOrders)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 text-lg">💬</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Consultations</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(analytics.consultations.total)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-orange-600 text-lg">💊</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Prescriptions</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(analytics.prescriptions.total)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Charts and Detailed Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Sales Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Daily Sales Trend
                  </h3>
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {analytics.sales.dailySales.map((day: any, index: number) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-orange-500 rounded-t"
                          style={{
                            height: `${(day.revenue / Math.max(...analytics.sales.dailySales.map((d: any) => d.revenue))) * 200}px`,
                          }}
                        ></div>
                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-xs font-medium text-gray-900">
                          {formatCurrency(day.revenue)}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* User Types */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    User Types
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-700">Anonymous Users</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {analytics.userTypes.anonymous} ({Math.round((analytics.userTypes.anonymous / analytics.userTypes.total) * 100)}%)
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-700">Authenticated Users</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {analytics.userTypes.authenticated} ({Math.round((analytics.userTypes.authenticated / analytics.userTypes.total) * 100)}%)
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Detailed Statistics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Consultation Status */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Consultation Status
                  </h3>
                  <div className="space-y-3">
                    {analytics.consultations.statusBreakdown.map((status: any) => (
                      <div key={status.status} className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${getStatusColor(status.status)}`}>
                          {status.status.replace("_", " ")}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {status.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Prescription Status */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Prescription Status
                  </h3>
                  <div className="space-y-3">
                    {analytics.prescriptions.statusBreakdown.map((status: any) => (
                      <div key={status.status} className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${getStatusColor(status.status)}`}>
                          {status.status.replace("_", " ")}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {status.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Inventory Alerts */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Inventory Alerts
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Low Stock Items</span>
                      <span className="text-sm font-semibold text-orange-600">
                        {analytics.inventory.lowStockItems}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Expiring Items</span>
                      <span className="text-sm font-semibold text-red-600">
                        {analytics.inventory.expiringItems}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Total Items</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {analytics.inventory.totalItems}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Top Medications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8 bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Prescribed Medications
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Medication
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Generic Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Strength
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prescriptions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analytics.topMedications.map((med: any, index: number) => (
                        <tr key={med.medicationId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-lg mr-3">#{index + 1}</div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {med.medication.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {med.medication.dosageForm}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {med.medication.genericName || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {med.medication.strength}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {med._count.id}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
} 