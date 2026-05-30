"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/Common/ThemeToggle";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirect authenticated users to their appropriate dashboard
        const dashboardPath =
          user.role === "CLIENT"
            ? "/client-dashboard"
            : user.role === "PHARMACY"
            ? "/pharmacy-dashboard"
            : user.role === "ADMIN"
            ? "/admin"
            : "/auth";
        router.push(dashboardPath);
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Loading SafeMeds...
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Preparing your healthcare experience
          </p>
        </motion.div>
      </div>
    );
  }

  // Show redirect message while redirecting authenticated users
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <span className="text-2xl text-white">✅</span>
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Welcome back, {user.name || user.username}!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Redirecting to your {user.role.toLowerCase()} dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="relative">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle variant="icon" size="sm" />
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-6">
            SafeMeds
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Secure, anonymous healthcare consultations for students. Get professional 
            medical advice from licensed pharmacists in a safe, confidential environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/auth")}
              className="bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-600 transition-colors"
            >
              Get Started
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/signup")}
              className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-8 py-4 rounded-lg font-semibold text-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-colors"
            >
              Create Account
            </motion.button>
          </div>
        </motion.div>

        {/* User Type Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {[
            {
              type: "CLIENT",
              title: "Students",
              icon: "👨‍🎓",
              description: "Get anonymous medical consultations and advice from licensed pharmacists.",
              features: ["Anonymous consultations", "Secure messaging", "Prescription delivery", "24/7 support"],
              color: "from-blue-500 to-blue-600",
              action: () => router.push("/signup")
            },
            {
              type: "PHARMACY",
              title: "Pharmacists",
              icon: "💊",
              description: "Provide professional medical advice and consultations to students.",
              features: ["License verification", "Professional dashboard", "Consultation management", "Secure payments"],
              color: "from-purple-500 to-purple-600",
              action: () => router.push("/signup")
            },
            {
              type: "ADMIN",
              title: "Administrators",
              icon: "⚙️",
              description: "Manage the platform and oversee all operations and user activities.",
              features: ["System management", "User oversight", "Analytics dashboard", "Platform control"],
              color: "from-red-500 to-red-600",
              action: () => router.push("/auth")
            }
          ].map((card, index) => (
            <motion.div
              key={card.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${card.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <span className="text-3xl">{card.icon}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center">
                {card.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                {card.description}
              </p>
              <ul className="space-y-2 mb-8">
                {card.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={card.action}
                className={`w-full bg-gradient-to-r ${card.color} text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300`}
              >
                {card.type === "ADMIN" ? "Admin Login" : "Get Started"}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">
            Why Choose SafeMeds?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔒",
                title: "Privacy First",
                description: "All consultations are completely anonymous and encrypted for maximum privacy."
              },
              {
                icon: "👨‍⚕️",
                title: "Licensed Professionals",
                description: "Only verified, licensed pharmacists can provide medical consultations."
              },
              {
                icon: "📱",
                title: "Easy Access",
                description: "Simple, intuitive interface accessible from any device, anywhere."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students who trust SafeMeds for their healthcare needs. 
            Get professional medical advice in a safe, anonymous environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/signup")}
              className="bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-600 transition-colors"
            >
              Create Your Account
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/auth")}
              className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Sign In
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            © 2026 SafeMeds. All rights reserved. | 
            <span className="ml-2">🔒 Your privacy is our priority</span>
          </p>
          <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <button onClick={() => router.push("/legal?tab=terms")} className="hover:text-blue-500 underline cursor-pointer">
              Terms of Service
            </button>
            <button onClick={() => router.push("/legal?tab=privacy")} className="hover:text-blue-500 underline cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => router.push("/legal?tab=hipaa")} className="hover:text-blue-500 underline cursor-pointer">
              HIPAA & Security
            </button>
            <button onClick={() => router.push("/legal?tab=disclaimer")} className="hover:text-blue-500 underline cursor-pointer">
              Medical Disclaimer
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
