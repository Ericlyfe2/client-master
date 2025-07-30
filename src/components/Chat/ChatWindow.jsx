"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import WelcomeMessage from "./WelcomeMessage";

const ChatWindow = ({ chatId, onMessageCountChange }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pharmacistTyping, setPharmacistTyping] = useState(false);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  // Mock pharmacist responses for demo
  const pharmacistResponses = [
    "Thank you for your question. I understand your concern about this medication. Let me provide you with some information...",
    "That's a great question! Based on what you've described, I would recommend...",
    "I appreciate you reaching out about this. It's important to discuss any concerns you have about your medication.",
    "Let me help clarify that for you. The medication you're asking about typically...",
    "Your safety is our top priority. I'd be happy to discuss any side effects or concerns you may have.",
    "That's a common question. Let me explain how this medication works and what you can expect...",
    "I'm here to help! Can you tell me a bit more about your specific situation?",
    "Thank you for being proactive about your health. This is exactly the kind of question we're here to answer.",
  ];

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/api/chat/${chatId}`);
      const fetchedMessages = res.data?.messages || [];

      // Transform API messages to match local format
      const transformedMessages = fetchedMessages.map((msg) => ({
        text: msg.content,
        sender: msg.type === "user" ? "user" : "pharmacist",
        timestamp: msg.createdAt,
      }));

      setMessages(transformedMessages);
      if (onMessageCountChange) {
        onMessageCountChange(transformedMessages.length);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      // Don't clear existing messages on error, just log the error
    }
  };

  const simulatePharmacistResponse = async () => {
    setPharmacistTyping(true);

    // Simulate typing delay
    await new Promise((resolve) =>
      setTimeout(resolve, 2000 + Math.random() * 3000)
    );

    const randomResponse =
      pharmacistResponses[
        Math.floor(Math.random() * pharmacistResponses.length)
      ];
    const pharmacistMessage = {
      text: randomResponse,
      sender: "pharmacist",
      timestamp: new Date().toISOString(),
    };

    // Add pharmacist message to local state
    setMessages((prev) => [...prev, pharmacistMessage]);

    // Also save to API for persistence
    try {
      const apiPharmacistMessage = {
        content: pharmacistMessage.text,
        type: "pharmacist",
        userId: "pharmacist",
      };
      await axios.post(`/api/chat/${chatId}`, apiPharmacistMessage);
    } catch (error) {
      console.error("Error saving pharmacist message:", error);
    }

    setPharmacistTyping(false);

    if (onMessageCountChange) {
      onMessageCountChange((messages.length || 0) + 1);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const newMsg = {
      text: input,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    if (onMessageCountChange) {
      onMessageCountChange((messages.length || 0) + 1);
    }

    try {
      // Transform message to API format
      const apiMessage = {
        content: newMsg.text,
        type: "user",
        userId: "anonymous", // You might want to get this from auth context
      };

      await axios.post(`/api/chat/${chatId}`, apiMessage);
      await fetchMessages();

      // Simulate pharmacist response
      setTimeout(() => {
        simulatePharmacistResponse();
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    // Load messages from localStorage first as backup
    const savedMessages = localStorage.getItem(`chatMessages_${chatId}`);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Ensure parsedMessages is an array
        if (Array.isArray(parsedMessages)) {
          setMessages(parsedMessages);
          if (onMessageCountChange) {
            onMessageCountChange(parsedMessages.length);
          }
        }
      } catch (error) {
        console.error("Error parsing saved messages:", error);
      }
    }

    // Then fetch from API
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // Polling every 10 seconds
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);

    // Save messages to localStorage for persistence
    if (Array.isArray(messages) && messages.length > 0) {
      localStorage.setItem(`chatMessages_${chatId}`, JSON.stringify(messages));
    }
  }, [messages, pharmacistTyping, chatId]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-[70vh] bg-white">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3 bg-green-400 rounded-full"
            />
            <div>
              <h3 className="font-semibold">Dr. Sarah Johnson, PharmD</h3>
              <p className="text-sm opacity-90">Licensed Pharmacist</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Online</p>
            <p className="text-xs opacity-75">
              Usually responds in 2-3 minutes
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white"
      >
        {/* Welcome Message for New Sessions */}
        {messages.length === 0 && <WelcomeMessage />}

        <AnimatePresence>
          {Array.isArray(messages) &&
            messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] ${
                    msg.sender === "user" ? "order-2" : "order-1"
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-2xl shadow-sm ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                        : "bg-white border border-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p
                      className={`text-xs mt-2 ${
                        msg.sender === "user"
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </motion.div>
                </div>

                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-400 to-blue-500 order-1 ml-2"
                      : "bg-gradient-to-r from-green-400 to-green-500 order-2 mr-2"
                  }`}
                >
                  {msg.sender === "user" ? "U" : "P"}
                </div>
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Pharmacist Typing Indicator */}
        <AnimatePresence>
          {pharmacistTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start"
            >
              <div className="order-1">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: 0,
                        }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: 0.2,
                        }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: 0.4,
                        }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    </div>
                    <span className="text-sm text-gray-500">
                      Pharmacist is typing...
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center text-white text-sm font-medium order-2 mr-2">
                P
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="w-full border border-gray-300 rounded-xl p-3 pr-12 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black"
              rows="1"
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                😊
              </button>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                📎
              </button>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              input.trim() && !isLoading
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              "Send"
            )}
          </motion.button>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "Medication questions",
            "Side effects",
            "Dosage concerns",
            "Drug interactions",
          ].map((action, index) => (
            <motion.button
              key={action}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setInput(action)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
            >
              {action}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
