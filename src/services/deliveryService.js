import axios from "axios";

// Mock delivery data for demo purposes (unused but kept for reference)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockDeliveryData = {
  default: {
    status: "in_transit",
    location: {
      lat: 40.7128,
      lng: -74.006,
      address: "New York, NY",
    },
    estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000),
    dropPoint: "Campus Library - North Entrance",
    packageType: "Discreet Packaging",
    trackingCode: "TRK-ABC123",
  },
};

// Simulate API delay
const simulateApiDelay = () =>
  new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

export const getDeliveryStatus = async (anonId) => {
  try {
    const response = await axios.get(`/api/delivery/status/${anonId}`);
    return response.data.status;
  } catch (error) {
    console.error("Error fetching delivery status:", error);
    // Fallback to mock data if API fails
    const deliveryStages = [
      "order_confirmed",
      "processing",
      "packaged",
      "in_transit",
      "out_for_delivery",
      "delivered",
    ];

    const timeSinceOrder =
      Date.now() - (localStorage.getItem("orderTime") || Date.now());
    const stageIndex = Math.min(
      Math.floor(timeSinceOrder / (30 * 60 * 1000)),
      deliveryStages.length - 1
    );

    return deliveryStages[stageIndex] || "order_confirmed";
  }
};

export const getDeliveryLocation = async (anonId) => {
  try {
    const response = await axios.get(`/api/delivery/location/${anonId}`);
    return response.data.location;
  } catch (error) {
    console.error("Error fetching delivery location:", error);
    // Fallback to mock data if API fails
    const baseLocation = {
      lat: 40.7128 + (Math.random() - 0.5) * 0.01,
      lng: -74.006 + (Math.random() - 0.5) * 0.01,
      address: "New York, NY",
    };

    return baseLocation;
  }
};

export const updateDeliveryStatus = async (anonId, status) => {
  try {
    await simulateApiDelay();

    // In a real app, this would be an API call
    // const response = await axios.put(`/api/delivery/status/${anonId}`, { status });
    // return response.data;

    return { success: true, status };
  } catch (error) {
    console.error("Error updating delivery status:", error);
    throw new Error("Failed to update delivery status");
  }
};

export const getDeliveryHistory = async (anonId: string) => {
  try {
    await simulateApiDelay();

    // Mock delivery history
    const history = [
      {
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: "order_confirmed",
        description: "Order confirmed and payment processed",
      },
      {
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        status: "processing",
        description: "Medication being prepared by pharmacist",
      },
      {
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        status: "packaged",
        description: "Package prepared with discreet packaging",
      },
      {
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        status: "in_transit",
        description: "Package picked up by delivery partner",
      },
    ];

    return history;
  } catch (error) {
    console.error("Error fetching delivery history:", error);
    throw new Error("Failed to fetch delivery history");
  }
};

export const createDeliveryOrder = async (orderData) => {
  try {
    await simulateApiDelay();

    // Store order time for demo purposes
    localStorage.setItem("orderTime", Date.now().toString());

    // In a real app, this would be an API call
    // const response = await axios.post('/api/delivery/orders', orderData);
    // return response.data;

    return {
      success: true,
      orderId: `SM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      trackingCode: `TRK-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000),
    };
  } catch (error) {
    console.error("Error creating delivery order:", error);
    throw new Error("Failed to create delivery order");
  }
};
