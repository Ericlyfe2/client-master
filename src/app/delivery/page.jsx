"use client";

import { useState, useEffect } from "react";
import DeliveryTracker from "@/components/Delivery/DeliveryTracker";
import DeliveryMap from "@/components/Delivery/DeliveryMap";
import OrderStatus from "@/components/Delivery/OrderStatus";
import {
  getDeliveryStatus,
  getDeliveryLocation,
} from "@/services/deliveryService";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import Navigation from "@/components/Common/Navigation";
import { useAuth } from "@/hooks/useAuth";

export default function DeliveryPage() {
  const [deliveryData, setDeliveryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anonId, setAnonId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Get anonymous ID from localStorage
    let id = localStorage.getItem("anonId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("anonId", id);
    }
    setAnonId(id);

    // Fetch delivery data
    const fetchDeliveryData = async () => {
      try {
        setLoading(true);
        const status = await getDeliveryStatus(id);
        const location = await getDeliveryLocation(id);

        setDeliveryData({
          status,
          location,
          orderId: `SM-${id.slice(0, 8).toUpperCase()}`,
          estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          dropPoint: "Campus Library - North Entrance",
          packageType: "Discreet Packaging",
          trackingCode: `TRK-${id.slice(0, 6).toUpperCase()}`,
        });
      } catch (err) {
        setError("Unable to fetch delivery information");
        console.error("Delivery fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryData();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["CLIENT", "PHARMACY"]}>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        {/* Navigation */}
        <Navigation
          title="Delivery Tracking"
          userRole={user?.role?.toLowerCase() || "client"}
        />

        {loading ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                🔍 Loading your delivery information...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Delivery Unavailable
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <p className="text-sm text-gray-500">
                Please ensure you have submitted a consultation first, or try
                again later.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-orange-800 mb-2">
                🚚 Secure Delivery Tracking
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Track your discreet delivery in real-time. Your privacy is
                protected throughout the entire process.
              </p>
            </div>

            {/* Privacy Notice */}
            <div className="bg-white/70 backdrop-blur-sm border border-orange-200 rounded-xl p-4 mb-6 max-w-4xl mx-auto">
              <div className="flex items-start space-x-3">
                <span className="text-orange-600 text-xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-orange-800 mb-1">
                    Privacy Protected
                  </h3>
                  <p className="text-sm text-orange-700">
                    Your delivery is handled with complete discretion. No
                    personal information is visible on the package.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Map and Tracker */}
              <div className="space-y-6">
                {/* Delivery Map */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 overflow-hidden">
                  <div className="p-4 border-b border-orange-100">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Live Location
                    </h2>
                    <p className="text-sm text-gray-600">
                      Real-time delivery vehicle tracking
                    </p>
                  </div>
                  <div className="p-4">
                    <DeliveryMap location={deliveryData?.location} />
                  </div>
                </div>

                {/* Delivery Tracker */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 overflow-hidden">
                  <div className="p-4 border-b border-orange-100">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Delivery Progress
                    </h2>
                    <p className="text-sm text-gray-600">
                      Track your order through each stage
                    </p>
                  </div>
                  <div className="p-4">
                    <DeliveryTracker status={deliveryData?.status} />
                  </div>
                </div>
              </div>

              {/* Right Column - Order Status */}
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 overflow-hidden">
                  <div className="p-4 border-b border-orange-100">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Order Details
                    </h2>
                    <p className="text-sm text-gray-600">
                      Complete order information and status
                    </p>
                  </div>
                  <div className="p-4">
                    <OrderStatus
                      orderId={deliveryData?.orderId}
                      status={deliveryData?.status}
                      trackingCode={deliveryData?.trackingCode}
                      packageType={deliveryData?.packageType}
                      dropPoint={deliveryData?.dropPoint}
                      estimatedDelivery={deliveryData?.estimatedDelivery}
                    />
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Delivery Instructions
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-3">
                      <span className="text-orange-500 text-lg">📦</span>
                      <div>
                        <p className="font-medium text-gray-800">
                          Package Collection
                        </p>
                        <p className="text-gray-600">
                          Present your tracking code to collect your package
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-orange-500 text-lg">🆔</span>
                      <div>
                        <p className="font-medium text-gray-800">
                          Identification
                        </p>
                        <p className="text-gray-600">
                          No personal ID required - tracking code only
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-orange-500 text-lg">⏰</span>
                      <div>
                        <p className="font-medium text-gray-800">
                          Collection Window
                        </p>
                        <p className="text-gray-600">
                          Available for pickup within 24 hours of delivery
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
