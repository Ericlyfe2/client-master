"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import Navigation from "@/components/Common/Navigation";
import { 
  Users, 
  BarChart3, 
  Shield, 
  Settings, 
  FileText, 
  HelpCircle,
  UserCheck,
  Calendar,
  Package,
  MessageSquare,
  Activity,
  Database
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();

  const adminFeatures = [
    {
      id: "users",
      title: "User Management",
      description: "Manage all users, roles, and permissions across the platform.",
      icon: Users,
      color: "bg-red-500 hover:bg-red-600",
      path: "/admin/users"
    },
    {
      id: "analytics",
      title: "System Analytics",
      description: "View comprehensive system analytics and performance metrics.",
      icon: BarChart3,
      color: "bg-blue-500 hover:bg-blue-600",
      path: "/admin/analytics"
    },
    {
      id: "security",
      title: "Security Settings",
      description: "Configure security policies and access controls.",
      icon: Shield,
      color: "bg-green-500 hover:bg-green-600",
      path: "/admin/security"
    },
    {
      id: "settings",
      title: "System Settings",
      description: "Configure system-wide settings and preferences.",
      icon: Settings,
      color: "bg-purple-500 hover:bg-purple-600",
      path: "/admin/settings"
    },
    {
      id: "logs",
      title: "Audit Logs",
      description: "Review system audit logs and activity history.",
      icon: FileText,
      color: "bg-orange-500 hover:bg-orange-600",
      path: "/admin/logs"
    },
    {
      id: "support",
      title: "Support Center",
      description: "Access support tools and help documentation.",
      icon: HelpCircle,
      color: "bg-indigo-500 hover:bg-indigo-600",
      path: "/admin/support"
    },
    {
      id: "staff",
      title: "Staff Management",
      description: "Manage pharmacy staff, schedules, and assignments.",
      icon: UserCheck,
      color: "bg-teal-500 hover:bg-teal-600",
      path: "/admin/staff"
    },
    {
      id: "consultations",
      title: "Consultations",
      description: "Monitor and manage patient consultations.",
      icon: MessageSquare,
      color: "bg-pink-500 hover:bg-pink-600",
      path: "/admin/consultations"
    },
    {
      id: "inventory",
      title: "Inventory Management",
      description: "Track medication inventory and stock levels.",
      icon: Package,
      color: "bg-amber-500 hover:bg-amber-600",
      path: "/admin/inventory"
    },
    {
      id: "delivery",
      title: "Delivery Management",
      description: "Monitor delivery status and track orders.",
      icon: Activity,
      color: "bg-emerald-500 hover:bg-emerald-600",
      path: "/admin/delivery"
    },
    {
      id: "database",
      title: "Database Management",
      description: "Manage database operations and maintenance.",
      icon: Database,
      color: "bg-slate-500 hover:bg-slate-600",
      path: "/admin/database"
    },
    {
      id: "reports",
      title: "Reports & Analytics",
      description: "Generate comprehensive reports and insights.",
      icon: BarChart3,
      color: "bg-cyan-500 hover:bg-cyan-600",
      path: "/admin/reports"
    }
  ];

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        {/* Navigation */}
        <Navigation title="Admin Dashboard" userRole="admin" />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user?.name || "Administrator"}. Manage your SafeMeds platform.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 border border-red-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">1,234</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Consultations</p>
                  <p className="text-2xl font-bold text-gray-900">56</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Deliveries</p>
                  <p className="text-2xl font-bold text-gray-900">23</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <p className="text-2xl font-bold text-green-600">98%</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Admin Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-red-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Admin Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Admin:</span>
                    <span className="ml-2 font-medium">
                      {user?.name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">
                      {user?.email || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Username:</span>
                    <span className="ml-2 font-medium">
                      {user?.username || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Role:</span>
                    <span className="ml-2 font-medium capitalize">
                      {user?.role || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl mb-2">👑</div>
                <div className="text-sm text-gray-600">Admin Account</div>
              </div>
            </div>
          </motion.div>

          {/* Admin Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {adminFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-red-200 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <IconComponent className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {feature.description}
                  </p>
                  <button
                    onClick={() => router.push(feature.path)}
                    className={`${feature.color} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full`}
                  >
                    Access {feature.title}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-red-200"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">New user registration: john.doe@example.com</span>
                </div>
                <span className="text-xs text-gray-500">2 minutes ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Consultation completed: #CONS-2024-001</span>
                </div>
                <span className="text-xs text-gray-500">15 minutes ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">System backup completed successfully</span>
                </div>
                <span className="text-xs text-gray-500">1 hour ago</span>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
