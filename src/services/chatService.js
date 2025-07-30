import axios from "axios";

export const getChatMessages = async (chatId) => {
  try {
    const response = await axios.get(`/api/chat/${chatId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    // Return empty array as fallback
    return [];
  }
};

export const sendChatMessage = async (chatId, message) => {
  try {
    const response = await axios.post(`/api/chat/${chatId}`, message);
    return response.data;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw new Error("Failed to send message");
  }
};

export const getChatSession = (chatId) => {
  try {
    const session = localStorage.getItem(`chatSession_${chatId}`);
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error("Error getting chat session:", error);
    return null;
  }
};

export const saveChatSession = (chatId, sessionData) => {
  try {
    localStorage.setItem(`chatSession_${chatId}`, JSON.stringify(sessionData));
  } catch (error) {
    console.error("Error saving chat session:", error);
  }
};

export const clearChatSession = (chatId) => {
  try {
    localStorage.removeItem(`chatSession_${chatId}`);
    localStorage.removeItem(`chatMessages_${chatId}`);
  } catch (error) {
    console.error("Error clearing chat session:", error);
  }
};

// Mock pharmacist responses for demo
export const getPharmacistResponse = (userMessage) => {
  const responses = {
    default: [
      "Thank you for your question. I understand your concern about this medication. Let me provide you with some information...",
      "That's a great question! Based on what you've described, I would recommend...",
      "I appreciate you reaching out about this. It's important to discuss any concerns you have about your medication.",
    ],
    medication: [
      "Let me help clarify that for you. The medication you're asking about typically...",
      "This medication works by...",
      "It's important to take this medication exactly as prescribed.",
    ],
    side_effects: [
      "Your safety is our top priority. I'd be happy to discuss any side effects or concerns you may have.",
      "Common side effects of this medication include...",
      "If you experience any severe side effects, please contact your doctor immediately.",
    ],
    dosage: [
      "The dosage depends on several factors including your age, weight, and medical condition.",
      "It's crucial to follow the prescribed dosage schedule.",
      "Never adjust your dosage without consulting your healthcare provider.",
    ],
    interactions: [
      "Drug interactions are important to consider. Let me check what you're currently taking.",
      "This medication may interact with...",
      "Always inform your pharmacist about all medications you're taking.",
    ],
  };

  const lowerMessage = userMessage.toLowerCase();
  let category = "default";

  if (
    lowerMessage.includes("side effect") ||
    lowerMessage.includes("side effect")
  ) {
    category = "side_effects";
  } else if (lowerMessage.includes("dosage") || lowerMessage.includes("dose")) {
    category = "dosage";
  } else if (
    lowerMessage.includes("interaction") ||
    lowerMessage.includes("drug")
  ) {
    category = "interactions";
  } else if (
    lowerMessage.includes("medication") ||
    lowerMessage.includes("medicine")
  ) {
    category = "medication";
  }

  const categoryResponses = responses[category];
  return categoryResponses[
    Math.floor(Math.random() * categoryResponses.length)
  ];
};

export const simulateTypingDelay = async (minDelay = 2000, maxDelay = 5000) => {
  const delay = minDelay + Math.random() * (maxDelay - minDelay);
  await new Promise((resolve) => setTimeout(resolve, delay));
};
