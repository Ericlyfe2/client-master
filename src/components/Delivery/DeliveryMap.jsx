"use client";

import { useState, useEffect } from "react";
import { watchLocation } from "@/lib/locationTracking";

// Straight-line distance (metres) between two coords — Haversine.
const haversine = (a, b) => {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

// Shows the courier's REAL live position (streamed to Firestore by the courier
// device) on an OpenStreetMap embed — no Google Maps API key required.
// ETA comes from OSRM's free routing API (real road distance + duration).
const DeliveryMap = ({ deliveryId, dropPoint, dropCoords }) => {
  // Drop-point coordinates. Defaults to KNUST main campus; pass `dropCoords`
  // per delivery once drop points carry real lat/lng.
  const drop = dropCoords || { lat: 6.6745, lng: -1.5716 };

  const [location, setLocation] = useState(null);
  const [staleSeconds, setStaleSeconds] = useState(0);
  const [eta, setEta] = useState(null); // { distanceM, durationS, source }

  // Subscribe to the live courier location for this delivery.
  useEffect(() => {
    if (!deliveryId) return;
    const unsubscribe = watchLocation(deliveryId, (loc) => setLocation(loc));
    return () => unsubscribe();
  }, [deliveryId]);

  // Track how long since the last fix (to show "live" vs "last seen").
  useEffect(() => {
    if (!location?.updatedAt) return;
    const tick = () =>
      setStaleSeconds(Math.floor((Date.now() - location.updatedAt) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [location?.updatedAt]);

  const hasFix = location && typeof location.lat === "number";
  const isLive = hasFix && location.active && staleSeconds < 30;

  // Small bounding box around the courier for the OSM embed.
  const osmSrc = hasFix
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${
        location.lng - 0.004
      }%2C${location.lat - 0.003}%2C${location.lng + 0.004}%2C${
        location.lat + 0.003
      }&layer=mapnik&marker=${location.lat}%2C${location.lng}`
    : null;

  return (
    <div className="relative h-72 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
      {hasFix ? (
        <iframe
          title="Live delivery location"
          src={osmSrc}
          className="absolute inset-0 w-full h-full"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <span className="text-4xl mb-3">🛰️</span>
          <p className="font-semibold text-gray-800 dark:text-gray-100">
            Waiting for courier location
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
            The map goes live once the courier starts sharing their GPS for this delivery.
          </p>
        </div>
      )}

      {/* Live status badge */}
      <div className="absolute top-3 left-3 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"
          }`}
        />
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
          {isLive
            ? "LIVE"
            : hasFix
            ? `Last seen ${staleSeconds}s ago`
            : "Offline"}
        </span>
      </div>

      {/* Precision + coordinates readout */}
      {hasFix && (
        <div className="absolute bottom-3 left-3 right-3 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-gray-700 dark:text-gray-300">
              {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {location.accuracy != null
                ? `±${Math.round(location.accuracy)} m`
                : "accuracy n/a"}
            </span>
          </div>
          <div className="text-gray-500 dark:text-gray-400 mt-0.5">
            Drop point: {dropPoint || "Campus Library - North Entrance"}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryMap;
