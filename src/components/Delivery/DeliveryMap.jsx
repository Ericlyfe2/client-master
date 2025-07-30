"use client";

import { useState, useEffect } from "react";

const DeliveryMap = ({ deliveryLocation, dropPoint, status }) => {
  const [currentLocation, setCurrentLocation] = useState(deliveryLocation);
  const [isUpdating, setIsUpdating] = useState(false);

  // Simulate real-time location updates
  useEffect(() => {
    if (status === "in_transit" || status === "out_for_delivery") {
      const interval = setInterval(() => {
        setIsUpdating(true);
        // Simulate movement
        setCurrentLocation((prev) => ({
          ...prev,
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001,
        }));
        setTimeout(() => setIsUpdating(false), 500);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [status]);

  // Mock map coordinates for demo
  const mapCenter = { lat: 40.7128, lng: -74.006 };
  const dropPointCoords = { lat: 40.7135, lng: -74.0065 };

  const getStatusColor = () => {
    switch (status) {
      case "delivered":
        return "text-green-600";
      case "out_for_delivery":
        return "text-orange-600";
      case "in_transit":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "delivered":
        return "✅";
      case "out_for_delivery":
        return "🚚";
      case "in_transit":
        return "📦";
      case "packaged":
        return "📋";
      case "processing":
        return "⚙️";
      default:
        return "📝";
    }
  };

  return (
    <div className="relative h-full bg-gradient-to-br from-blue-50 to-green-50">
      {/* Map Container */}
      <div className="relative h-full overflow-hidden">
        {/* Background Map Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-green-100">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
                backgroundSize: "20px 20px",
              }}
            />
          </div>
        </div>

        {/* Drop Point Marker */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: "70%",
            top: "30%",
          }}
        >
          <div className="bg-green-600 text-white rounded-full p-3 shadow-lg border-2 border-white">
            📍
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white px-2 py-1 rounded text-xs shadow-md whitespace-nowrap">
            Drop Point
          </div>
        </div>

        {/* Delivery Vehicle Marker */}
        {currentLocation &&
          (status === "in_transit" || status === "out_for_delivery") && (
            <div
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ${
                isUpdating ? "scale-110" : "scale-100"
              }`}
              style={{
                left: `${50 + (currentLocation.lat - mapCenter.lat) * 10000}%`,
                top: `${50 + (currentLocation.lng - mapCenter.lng) * 10000}%`,
              }}
            >
              <div className="bg-orange-600 text-white rounded-full p-3 shadow-lg border-2 border-white animate-pulse">
                🚚
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white px-2 py-1 rounded text-xs shadow-md whitespace-nowrap">
                Delivery Vehicle
              </div>
            </div>
          )}

        {/* Route Line */}
        {status === "in_transit" || status === "out_for_delivery" ? (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1="50%"
              y1="50%"
              x2="70%"
              y2="30%"
              stroke="rgba(59, 130, 246, 0.5)"
              strokeWidth="3"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
          </svg>
        ) : null}

        {/* Status Overlay */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getStatusIcon()}</span>
            <div>
              <p className={`font-semibold ${getStatusColor()}`}>
                {status?.replace("_", " ").toUpperCase() || "ORDER CONFIRMED"}
              </p>
              <p className="text-xs text-gray-500">
                {status === "in_transit" || status === "out_for_delivery"
                  ? "Live tracking active"
                  : "Tracking will begin soon"}
              </p>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">Drop Point</p>
              <p className="text-sm text-gray-600">
                {dropPoint || "Campus Library - North Entrance"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Estimated Arrival</p>
              <p className="font-semibold text-green-600">2:30 PM</p>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <button className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg hover:bg-white transition-colors">
            <span className="text-lg">🔍</span>
          </button>
          <button className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg hover:bg-white transition-colors">
            <span className="text-lg">📍</span>
          </button>
        </div>

        {/* Loading Indicator */}
        {isUpdating && (
          <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
            <div className="bg-white rounded-lg px-3 py-1 text-sm text-blue-600">
              Updating location...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryMap;
